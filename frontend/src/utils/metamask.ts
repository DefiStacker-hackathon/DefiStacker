import * as ethers from 'ethers';

export function getProvider(): ethers.ethers.providers.JsonRpcProvider | null {
  // TODO: fix typing on this
  if (typeof window.ethereum !== 'undefined') {
    // Ethereum user detected. You can now use the provider.
    // const provider = new ethers.providers.JsonRpcProvider();
    const provider = window['ethereum'];
    provider.enable().then((data: any) => console.log(data));
    const web3Provider = new ethers.providers.Web3Provider(provider);
    const signer = web3Provider.getSigner(0);
    signer.getAddress().then((data) => {
      console.log(data);
      web3Provider.getBalance(data).then(function (balance) {
        var etherString = ethers.utils.formatEther(balance);
        console.log('Balance: ' + etherString);
      });
    });
    return web3Provider;
  }
  return null;
}
