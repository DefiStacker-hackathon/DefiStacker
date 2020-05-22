import { AdapterMethod } from './adapter';

export const swapUniswap = <AdapterMethod>{
  label: 'swap',
  parameters: [
    'gatewayAddress',
    ['tokenYouHave', 'amountToSwap', 'tokenYouWant'],
  ],
  description: 'Swaps the token you have for the token you want',
};
