import * as ethers from 'ethers';

export function getProvider(): ethers.ethers.providers.Web3Provider | null {
  // TODO: fix typing on this
  if (typeof window.ethereum !== 'undefined') {
    // Ethereum user detected. You can now use the provider.
    // const provider = new ethers.providers.JsonRpcProvider();
    const provider = window['ethereum'];
    provider.enable().then((data: any) => console.log("enable data", data));
    const web3Provider = new ethers.providers.Web3Provider(provider);
    const signer = web3Provider.getSigner(0);
    signer.getAddress().then((data) => {
      web3Provider.getBalance(data).then(function (balance) {
        var etherString = ethers.utils.formatEther(balance);
        console.log('Balance: ' + etherString);
      });
    });
    return web3Provider;
  }
  return null;
}

export async function sendEth(
  provider: ethers.providers.Web3Provider,
  to: string,
  amountInEth: string
) {
  const signer = await provider.getSigner(0);
  let tx = {
    to: to,
    value: ethers.utils.parseEther(amountInEth),
    gasLimit: 42000,
  }
  await signer.sendTransaction(tx);
}
