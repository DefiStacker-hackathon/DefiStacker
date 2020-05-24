import * as tokens from "./tokens";
import ethers from "ethers";
import IERC20 from "../contracts/IERC20.json";
import * as addresses from "../lib/addresses";

export async function createDaiContract(provider: ethers.ethers.providers.JsonRpcProvider) {
  const signer = provider.getSigner(0);
  return new ethers.Contract(tokens.DAI.address, IERC20.abi, signer);
}

export async function approveDai(provider: ethers.ethers.providers.JsonRpcProvider, stackerAddress: string, amountInWei: string) {
  const contract = await createDaiContract(provider);
  const value = ethers.utils.parseUnits(amountInWei, "wei");
  await contract.approve(stackerAddress, value);
}

export async function getInitialDai(provider: ethers.ethers.providers.JsonRpcProvider) {
  const daiContract = await createDaiContract(provider);
  const amount = ethers.utils.formatEther("100");
  const account = provider.getSigner(0);
  await daiContract.transfer(account, amount, { from: addresses.UNISWAP_DAI_EXCHANGE });
}
