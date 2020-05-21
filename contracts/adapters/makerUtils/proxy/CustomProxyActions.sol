pragma solidity ^0.6.0;

import "../../../../node_modules/cdpsaver-contracts/contracts/mcd/general/SaverProxyActions.sol";
import "../constants/ConstantAddresses.sol";


contract CustomProxyActions is SaverProxyActions, ConstantAddresses {
    mapping(address => address) public tokenToJoin;

    constructor() public {
        tokenToJoin[BAT_TOKEN] = MCD_JOIN_BAT_A;
        tokenToJoin[USDC_TOKEN] = MCD_JOIN_USDC_A;
        tokenToJoin[WBTC_TOKEN] = MCD_JOIN_BAT_A;
        tokenToJoin[DAI_TOKEN] = MCD_JOIN_DAI;
    }

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

        if(cdp == 0){ // then new has just been created, and front-end can't pass this in
            cdp = 1;
        }

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

        if(cdp == 0){ // then new has just been created, and front-end can't pass this in
            cdp = 1;
        }

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

        if(cdp == 0){ // then new has just been created, and front-end can't pass this in
            cdp = 1;
        }

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

    /* Can just do a default mapping at constructor */
    function getJoin(address _depositTokenAddress)
        public
        view
        returns (address)
    {
        return tokenToJoin[_depositTokenAddress];
    }
}