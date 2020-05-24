interface Token {
  network: number;
  ticker: string;
  lookup: string;
  name: string;
  address: string;
}

export const BAT: Token = {
  network: 1,
  ticker: 'BAT',
  lookup: 'BAT',
  name: 'Basic Attention Token',
  address: '0x0D8775F648430679A709E98d2b0Cb6250d2887EF'
};

export const DAI: Token = {
  network: 1,
  ticker: 'DAI',
  lookup: 'DAI',
  name: 'Dai',
  address: '0x89d24A6b4CcB1B6fAA2625fE562bDD9a23260359'
};

export const REP: Token = {
  network: 1,
  ticker: 'REP',
  lookup: 'REP',
  name: 'Augur',
  address: '0x1985365e9f78359a9B6AD760e32412f4a445E862'
};

export const WETH: Token = {
  network: 1,
  ticker: 'WETH',
  lookup: 'ETH',
  name: 'Wrapped Ether',
  address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
};

export const ZRX: Token = {
  network: 1,
  ticker: 'ZRX',
  lookup: 'ZRX',
  name: '0x',
  address: '0xe41d2489571d322189246dafa5ebde1f4699f498'
};
