pragma solidity ^0.6.0;

import "../../../../node_modules/cdpsaver-contracts/contracts/mcd/general/SaverProxyActions.sol";
import "../../../../node_modules/cdpsaver-contracts/contracts/DS/DSMath.sol";
import "./ExtendedProxyActions.sol";
import "../constants/ConstantAddresses.sol";
//import "../interfaces/IERC20.sol";
import "../mcd/Vat.sol";

contract CustomProxyActions is SaverProxyActions, ExtendedProxyActions, ConstantAddresses {
    mapping(address => address) public tokenToJoin;

    address public UNISWAP_ADAPTER;
    address public KYBER_ADAPTER;
    address public AAVE_ADAPTER;

    function __executeCall(
        address _callAdapter,
        string memory _callSig,
        bytes memory _callArgs
    )
        internal
    {
        if(_callAdapter == address(this)){
            address(this).delegatecall(abi.encode(_callSig, _callArgs));
        }
    }

    // @TODO: include msg.value in all eth calls


    /* ------------------------------ ETH Entry ------------------------------ */
    /// @notice creates vault, and then locks ETH && returns DAI to sender
    function openVaultWithETHAndWithdrawDraw(bytes memory _callArgs)
        private
    {
        (
            /* percentage of liquidity */
            bytes32 ilk,        //  collateral type. rate: stablecoin debt multiplier (accumulated stability fees). take: collateral balance multiplier. Ink: total collateral balance. Art: total normalized stablecoin debt.
            uint wadD           // 18 digits of precision. daiAmount  : exit amount desired
        ) = abi.decode(_callArgs, ( bytes32, uint ));

        openLockETHAndDraw(CDP_MANAGER, MCD_JUG, MCD_JOIN_ETH_A, MCD_JOIN_DAI, ilk, wadD);
    }

    /// @notice locks ETH in pre-existing vault && returns DAI to sender
    function depositEthAndWithdraw(bytes memory _callArgs)
        private
    {
        (
            uint cdp,           // cdp index
            uint wadD           // 18 digits of precision. daiAmount  : exit amount desired
        ) = abi.decode(_callArgs, ( uint, uint ));

        if(cdp == 0){ // then new has just been created, and front-end can't pass this in
            cdp = 1;
        }

        lockETHAndDraw(CDP_MANAGER, MCD_JUG, MCD_JOIN_ETH_A, MCD_JOIN_DAI, cdp, wadD);
    }

    /// @notice locks ETH in pre-existing vault && DAI stays in vault.
    function depositEth(bytes memory _callArgs)
        private
    {
        (
            uint cdp            // cdp index
        ) = abi.decode(_callArgs, ( uint ));

        if(cdp == 0){ // then new has just been created, and front-end can't pass this in
            cdp = 1;
        }

        lockETH(CDP_MANAGER, MCD_JOIN_ETH_A,cdp);
    }

    /// @notice withdraws X amount of ETH from vault, and sends to msg.sender.
    function withdrawDepositedEth(bytes memory _callArgs)
        private
    {
        (
            uint ethWithdrawalAmount,           // Amount of ETH to withdraw from the vault
            uint cdp                            // cdp index
        ) = abi.decode(_callArgs, ( uint, uint ));

        if(cdp == 0){ // then new has just been created, and front-end can't pass this in
            cdp = 1;
        }

        freeETH(CDP_MANAGER, MCD_JOIN_ETH_A, cdp, ethWithdrawalAmount);
    }

    // /// @notice withdraws all ETH from vault, and sends to msg.sender.
    // function withdrawAllDepositedEth(bytes memory _callArgs)
    //     private
    // {
    //     (
    //         uint ethWithdrawalAmount,           // Amount of ETH to withdraw from the vault
    //         uint cdp                            // cdp index
    //     ) = abi.decode(_callArgs, ( uint, uint ));

    //     if(cdp == 0){ // then new has just been created, and front-end can't pass this in
    //         cdp = 1;
    //     }

    //     exitETH(CDP_MANAGER, MCD_JOIN_ETH_A, cdp, ethWithdrawalAmount);
    // }

    /* ------------------------------ ERC20 Entry ------------------------------ */
    /// @notice creates vault, and then locks GEM(ERC20 - BAT/DAI/USDC) && returns DAI to sender
    function openVaultWithERC20AndDraw(bytes memory _callArgs)
        private
    {
        (
            address wadCToken,                      // address of entry point token(BAT/USDC/DAI/WBTC)
            bytes32 ilk,                            // collateral type. rate: stablecoin debt multiplier (accumulated stability fees). take: collateral balance multiplier. Ink: total collateral balance. Art: total normalized stablecoin debt.
            uint depositTokenAmount,                // 18 digits of precision. BAT/USDC/DAI/WBTC : deposit point amount
            uint daiExitAmount,                     // 18 digits of precision. daiAmount    : exit amount desired
            bool transferFrom                       // transferFrom : true || false.  I.e. if the tokens were approved before.
        ) = abi.decode(_callArgs, ( address, bytes32, uint, uint, bool ));

        openLockGemAndDraw(CDP_MANAGER, MCD_JUG, getJoin(wadCToken), MCD_JOIN_DAI, ilk, depositTokenAmount, daiExitAmount, transferFrom);
    }

    /// @notice locks ERC20 in pre-existing vault && returns DAI to sender
    function depositERC20AndWithdraw(bytes memory _callArgs)
        private
    {
        (
            address depositTokenAddress,            // address of entry point token(BAT/USDC/DAI/WBTC)
            uint cdp,                               // cdp index
            uint depositTokenAmount,                // 18 digits of precision. BAT/USDC/DAI/WBTC : deposit point amount
            uint daiExitAmount,                     // 18 digits of precision. daiAmount    : exit amount desired
            bool transferFrom                       // transferFrom : true || false.  I.e. if the tokens were approved before.
        ) = abi.decode(_callArgs, ( address, uint, uint, uint, bool ));

        // if(cdp == 0){ // then new has just been created, and front-end can't pass this in
        //     // get recent
        // }

        lockGemAndDraw(CDP_MANAGER, MCD_JUG, getJoin(depositTokenAddress), MCD_JOIN_DAI, cdp, depositTokenAmount, daiExitAmount, transferFrom);
    }

    /// @notice locks ERC20 in pre-existing vault && DAI stays in vault.
    function depositERC20(bytes memory _callArgs)
        private
    {
        (
            address depositTokenAddress,            // address of entry point token(BAT/USDC/DAI/WBTC)
            uint cdp,                               // cdp index
            uint depositTokenAmount,                // 18 digits of precision. BAT/USDC/DAI/WBTC : deposit point amount
            bool transferFrom                       // transferFrom : true || false.  I.e. if the tokens were approved before.
        ) = abi.decode(_callArgs, ( address, uint, uint, bool ));

        // if(cdp == 0){ // then new has just been created, and front-end can't pass this in
        //     // get recent
        // }

        lockGem(CDP_MANAGER, getJoin(depositTokenAddress), cdp, depositTokenAmount, transferFrom);
    }

    /// @notice withdraws X amount of ERC20 from vault, and sends to msg.sender.
    function withdrawDepositedERC20(bytes memory _callArgs)
        private
    {
        (
            address depositTokenAddress,            // address of entry point token(BAT/USDC/DAI/WBTC)
            uint ERC20WithdrawalAmount,             // amount of entry point token(BAT/USDC/DAI/WBTC) to withdraw
            uint cdp                                // cdp index
        ) = abi.decode(_callArgs, ( address, uint, uint ));

        freeGem(CDP_MANAGER, getJoin(depositTokenAddress), cdp, ERC20WithdrawalAmount);
    }

    // /// @notice withdraws all ERC20 from vault, and sends to msg.sender.
    // function withdrawAllDepositedERC20(bytes memory _callArgs)
    //     private
    // {
    //     (
    //         address depositTokenAddress,            // address of entry point token(BAT/USDC/DAI/WBTC)
    //         uint ERC20WithdrawalAmount,             // amount of entry point token(BAT/USDC/DAI/WBTC) to withdraw
    //         uint cdp                                // cdp index
    //     ) = abi.decode(_callArgs, ( uint, uint ));

    //     if(cdp == 0){ // then new has just been created, and front-end can't pass this in
    //         cdp = 1;
    //     }

    //     exitGem(CDP_MANAGER, getJoin(depositTokenAddress), cdp, ERC20WithdrawalAmount);
    // }


    /* ------------------------------ Custom ------------------------------ */

    /*
        1. *Maker: getOutStandingDebt() amount of current CDP
        2. Aave: use getOutStandingDebt() value to take out flashloan of this dai debt amount in ETH just
        3. UniSwap: convert eth via uniswap to dai
        4. Maker: use newly converted dai to paybackFullDebt() of the CDP, collateral will be returned when paybackFullDebt() is called
        5. UniSwap: use returned collateral to call uniswap to convert from old collateral type into new collateral type.
        6.  Maker:openCDP with new collateral type obtained from previous uniswap 
        7. Aave : pay back flash loan
    */


    /*
        1. *Maker: getOutStandingDebt() amount of current CDP
        2. Aave: use getOutStandingDebt() value to take out flashloan of this dai debt amount in ETH 
        3. UniSwap: convert eth via uniswap to dai
    */
    
    /// @notice assumes that the DAI is in the proxy
    function changeUnderlyingCollatoralType(bytes memory _callArgs)
        private
    {
        (
            address _gateway,
            uint _cdpId,
            bytes32 _ilk,
            uint _daiAmount,
            uint _srcPercent,
            address _owner,
            address _previousCollatoral,
            address _desiredCollatoral
        ) = abi.decode(_callArgs, ( address, uint, bytes32, uint, uint, address, address, address ));
        /* msg.sender */
        (uint collatoral, uint debt) = getCdpInfo(CDP_MANAGER, _cdpId, _ilk); // the contract may have left over dai

        paybackDebt(abi.encodePacked(_cdpId, _ilk, debt, _owner));

        IUniswapAdapter(UNISWAP_ADAPTER).takeOrder(_gateway, abi.encodePacked(_previousCollatoral, collatoral, _srcPercent, _desiredCollatoral));

        GemLike(_desiredCollatoral).approve(MCD_JOIN_DAI, _daiAmount);

        lockGemAndDraw(CDP_MANAGER, MCD_JUG, getJoin(_previousCollatoral), MCD_JOIN_DAI, _cdpId, collatoral, _daiAmount, true);
    }

    /*
        vault - CDP
        CDP collatoral: eth, USDC, BAT, WBTC
        DAI

        eth(volatile) collatoral into USDC(not volatile)
    */


    function paybackDebt(bytes memory _callArgs)
        private
    {
        (
            uint _cdpId,
            bytes32 _ilk,
            uint _daiAmount,        // amount to pay back
            address _owner
        ) = abi.decode(_callArgs, ( uint, bytes32, uint, address ));

        address urn = ManagerLike(CDP_MANAGER).urns(_cdpId);

        uint wholeDebt = getAllDebtCDP(MCD_VAT, urn, urn, _ilk);

        if (_daiAmount > wholeDebt) {
            GemLike(DAI_TOKEN).transfer(_owner, sub(_daiAmount, wholeDebt));
            _daiAmount = wholeDebt;
        }
        GemLike(DAI_TOKEN).approve(MCD_JOIN_DAI, _daiAmount);
        DaiJoinLike(MCD_JOIN_DAI).join(urn, _daiAmount);

        ManagerLike(CDP_MANAGER).frob(_cdpId, 0, normalizePaybackAmount(MCD_VAT, urn, _ilk));
    }


    function getAllDebtCDP(address _vat, address _usr, address _urn, bytes32 _ilk) internal view returns (uint daiAmount) {
        (, uint rate,,,) = Vat(_vat).ilks(_ilk);
        (, uint art) = Vat(_vat).urns(_ilk, _urn);
        uint dai = Vat(_vat).dai(_usr);

        uint rad = sub(mul(art, rate), dai);
        daiAmount = rad / RAY;

        daiAmount = mul(daiAmount, RAY) < rad ? daiAmount + 1 : daiAmount;
    }

    /// @notice Converts a uint to int and checks if positive
    /// @param _x Number to be converted
    function toPositiveInt(uint _x) internal pure returns (int y) {
        y = int(_x);
        require(y >= 0, "int-overflow");
    }

    /* Can just do a default mapping at constructor */
    function getJoin(address _depositTokenAddress)
        public
        view
        returns (address)
    {
        return tokenToJoin[_depositTokenAddress];
    }

    /// @notice Gets CDP info (collateral, debt)
    /// @param _manager Manager contract
    /// @param _cdpId Id of the CDP
    /// @param _ilk Ilk of the CDP
    function getCdpInfo(address _manager, uint _cdpId, bytes32 _ilk) public view returns (uint, uint) {
        address vat = ManagerLike(CDP_MANAGER).vat();
        address urn = ManagerLike(CDP_MANAGER).urns(_cdpId);

        (uint collateral, uint debt) = Vat(vat).urns(_ilk, urn);
        (,uint rate,,,) = Vat(vat).ilks(_ilk);

        return (collateral, rmul(debt, rate));
    }

    function add(uint256 x, uint256 y) internal pure returns (uint256 z) {
        require((z = x + y) >= x);
    }

    function rmul(uint256 x, uint256 y) internal pure returns (uint256 z) {
        z = add(mul(x, y), RAY / 2) / RAY;
    }

    /// @notice Gets Dai amount in Vat which can be added to Cdp
    /// @param _vat Address of Vat contract
    /// @param _urn Urn of the Cdp
    /// @param _ilk Ilk of the Cdp
    function normalizePaybackAmount(address _vat, address _urn, bytes32 _ilk) internal view returns (int amount) {
        uint dai = Vat(_vat).dai(_urn);

        (, uint rate,,,) = Vat(_vat).ilks(_ilk);
        (, uint art) = Vat(_vat).urns(_ilk, _urn);

        amount = toPositiveInt(dai / rate);
        amount = uint(amount) <= art ? - amount : - toPositiveInt(art);
    }
}


interface IUniswapAdapter {
    function takeOrder(address _gateway, bytes calldata _callArgs) external returns(address[] memory);
}
