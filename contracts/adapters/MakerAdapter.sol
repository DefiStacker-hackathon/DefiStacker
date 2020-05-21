pragma solidity ^0.6.6;

import "../../node_modules/@openzeppelin/contracts/math/SafeMath.sol";
import "../../node_modules/@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "../../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./makerUtils/interfaces/GetCdps.sol";
//import "./makerUtils/proxy/DSProxy.sol";


import "./makerUtils/proxy/CustomProxyActions.sol";

/*
    1. MakerAdapter - has the proxyActions : similar to aave
*/

  /*
        1. proxy.execute(functionSigs(address(this))) > proxy.execute > address(this) functionSigs execute function > hook inside of Stacker, to then do uniswap > to then do further CDP
                - create blah
                - uniswap
                - increaseCollatoral CDP

        2. proxy.execute(functionSigs(CustomProxyActionContractAddress)) > proxy.execute > CustomProxyActionContract functionSigs execute function
    */





contract MakerAdapter is CustomProxyActions {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    uint256 constant MAX_PERCENTAGE = 10 ** 18; // 100%
    address constant MAKER_ETH = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;

    address immutable ADAPTER_ADDRESS;
    address immutable STACKER_ADDRESS;
    address immutable UNISWAP_ADDRESS;
    address immutable KYBER_ADDRESS;
    address immutable AAVE_ADDRESS;

    constructor(address _stacker, address _uniswap, address _kyber, address _aave) public payable {
        ADAPTER_ADDRESS = address(this);
        STACKER_ADDRESS = _stacker;
        UNISWAP_ADDRESS = _uniswap;
        KYBER_ADDRESS = _kyber;
        AAVE_ADDRESS = _aave;
    }
    /**
     * @dev called by stacker 
     */
    function executeProxyCall(address PROXY_REGISTRY, bytes memory _callArgs)
        public
        payable
    {
        address _proxy = _getProxy(PROXY_REGISTRY, msg.sender);

        if(_proxy == address(0)){
            _proxy = _createProxy(PROXY_REGISTRY, msg.sender);
        }

        Proxy(_proxy).execute(address(this), _callArgs);
    }

    /**
     * @dev delegate call from proxy
     */
    function _proxyCall(bytes memory _subCalls) 
        private // @TODO: If delegate call usage, can internal be used, or public/external/private?
    {
        /* Check length of _callArgs */
        (
            address[] memory callAdapters,
            string[] memory callSigs,
            bytes[] memory callArgs
        ) = abi.decode(_subCalls, ( address[], string[], bytes[] ));

        for (uint256 i = 0; i < callAdapters.length; i++) {
            __executeCall(callAdapters[i], callSigs[i], callArgs[i]);
        }
    }

    function createProxy(address PROXY_REGISTRY, bytes memory _callArgs)
        public
        payable
        returns (address)
    {
        return _createProxy(PROXY_REGISTRY, msg.sender); // proxy to be to open CDP - proxy holds all the CDPs, which allows to be transferred
    }

    function getProxy(address PROXY_REGISTRY, bytes memory _callArgs)
        public
        view
        returns (address)
    {
        return _getProxy(PROXY_REGISTRY, msg.sender);
    }

    /* --- Internal --- */
    function _createProxy(address PROXY_REGISTRY, address usr)
        internal
        returns (address)
    {
        return ProxyRegistryInterface(PROXY_REGISTRY).build(usr); // @TODO: fix msg.sender to work with stacker.sol
    }

    function _getProxy(address proxyRegistry, address usr) internal view returns(address) 
    {
        return ProxyRegistryLike(proxyRegistry).proxies(usr);
    }
}

abstract contract Proxy {
    function execute(address _target, bytes memory _data) virtual public payable returns (bytes32);
    function setOwner(address owner_) virtual public;
}
