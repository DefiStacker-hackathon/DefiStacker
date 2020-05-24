const EMPTY_ADDRESS = '0x0000000000000000000000000000000000000000';

const GATEWAY_ADDRESSES = {
  AAVE: '0x24a42fD28C976A61Df5D00D0599C34c4f90748c8',
  COMPOUND: EMPTY_ADDRESS, // Gateway via individual cToken
  KYBER: '0x818E6FECD516Ecc3849DAf6845e3EC868087B755',
  UNISWAP: '0xc0a47dFe034B400B47bDaD5FecDa2621de6c4d95'
};

const TOKEN_ADDRESSES = {
  CDAI: '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643',
  CETH: '0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5',
  DAI: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
  ETH: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
};

const UNISWAP_DAI_EXCHANGE = '0x2a1530C4C41db0B0b2bB646CB5Eb1A67b7158667';

const ENCODING_SCHEMAS = {
  AAVE: {
    // reserve, amount, SUBSEQUENT_CALLS
    FLASH_LOAN: ['address', 'uint256', 'bytes'],
    // callAdapters, callSigs, callArgs
    SUBSEQUENT_CALLS: ['address[]', 'string[]', 'bytes[]']
  },
  COMPOUND: {
    // token (e.g., DAI), tokenAmount, tokenPercentage, cToken (e.g., cDAI)
    LEND: ['address', 'uint256', 'uint256', 'address'],
    // cToken (e.g., cDAI), cTokenAmount, cTokenPercentage, token (e.g., DAI)
    REDEEM: ['address', 'uint256', 'uint256', 'address'],
  },
  KYBER: {
    // srcToken, srcAmount, srcPercentage, destToken
    TAKE_ORDER: ['address', 'uint256', 'uint256', 'address'],
  },
  UNISWAP: {
    // srcToken, srcAmount, srcPercentage, destToken
    TAKE_ORDER: ['address', 'uint256', 'uint256', 'address']
  }
}

module.exports = {
  EMPTY_ADDRESS,
  ENCODING_SCHEMAS,
  GATEWAY_ADDRESSES,
  TOKEN_ADDRESSES,
  UNISWAP_DAI_EXCHANGE
};
