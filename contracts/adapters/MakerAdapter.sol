pragma solidity ^0.6.6;

import "../../node_modules/@openzeppelin/contracts/math/SafeMath.sol";
import "../../node_modules/@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "../../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./makerUtils/interfaces/GetCdps.sol";
//import "./makerUtils/proxy/DSProxy.sol";


import "./makerUtils/proxy/CustomProxyActions.sol";


contract MakerAdapter is CustomProxyActions {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    uint256 constant MAX_PERCENTAGE = 10 ** 18; // 100%
    address constant MAKER_ETH = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;

    address immutable ADAPTER_ADDRESS;

    constructor(address _stacker, address _uniswap, address _kyber, address _aave) public payable {
        tokenToJoin[BAT_TOKEN] = MCD_JOIN_BAT_A;
        tokenToJoin[USDC_TOKEN] = MCD_JOIN_USDC_A;
        tokenToJoin[WBTC_TOKEN] = MCD_JOIN_BAT_A;
        tokenToJoin[DAI_TOKEN] = MCD_JOIN_DAI;
        ADAPTER_ADDRESS = address(this);
        UNISWAP_ADAPTER = _uniswap;
        KYBER_ADAPTER = _kyber;
        AAVE_ADAPTER = _aave;
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

interface Proxy {
    function execute(address _target, bytes calldata _data) external payable returns (bytes32);
    function setOwner(address owner_) external;
}
