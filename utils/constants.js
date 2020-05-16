const EMPTY_ADDRESS = '0x0000000000000000000000000000000000000000';

const GATEWAY_ADDRESSES = {
  AAVE: '0x24a42fD28C976A61Df5D00D0599C34c4f90748c8',
  KYBER: '0x818E6FECD516Ecc3849DAf6845e3EC868087B755',
  UNISWAP: '0xc0a47dFe034B400B47bDaD5FecDa2621de6c4d95'
};

const TOKEN_ADDRESSES = {
  DAI: '0x6b175474e89094c44da98b954eedeac495271d0f',
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
  KYBER: {
    // srcToken, srcAmount, srcPercentage, destAmount
    TAKE_ORDER: ['address', 'uint256', 'uint256', 'address'],
  },
  UNISWAP: {
    // srcToken, srcAmount, srcPercentage, destAmount
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
