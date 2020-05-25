import * as tokens from "./tokens";
import ethers from "ethers";
import IERC20 from "../contracts/IERC20.json";
import * as addresses from "../lib/addresses";


export async function createDaiContract(provider: ethers.providers.Web3Provider) {
  const signer = provider.getSigner(0);
  return new ethers.Contract(tokens.DAI.address, IERC20.abi, signer);
}

export async function approveDai(provider: ethers.providers.Web3Provider, stackerAddress: string, amountInWei: string) {
  const contract = await createDaiContract(provider);
  const value = ethers.utils.parseUnits(amountInWei, "wei");
  await contract.approve(stackerAddress, value);
}

export async function getInitialDai(provider: ethers.providers.Web3Provider) {
  const daiContract = await createDaiContract(provider);

  const walletSigner = provider.getSigner(0);
  const walletSignerAddress = walletSigner.getAddress();

  const daiSigner = await provider.getSigner(addresses.UNISWAP_DAI_EXCHANGE);
  // const daiSignerAddress = await daiSigner.getAddress();

  const amount = ethers.utils.parseEther("100");
  await daiContract.connect(daiSigner).transfer(walletSignerAddress, amount);
}
