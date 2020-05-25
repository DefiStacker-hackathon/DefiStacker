import * as tokens from "./tokens";
import ethers from "ethers";
import IERC20 from "../contracts/IERC20.json";
import IStacker from "../contracts/IStacker.json";
import Stacker from "../contracts/Stacker.json";
import IUniswapExchange from "../contracts/IUniswapExchange.json";
import IUniswapFactory from "../contracts/IUniswapFactory.json";
import * as addresses from "../lib/addresses";

const stackerAddress = "0xfF516E872A6CF764287E976dd49054d2607DcC23";

export async function createDaiContract(provider: ethers.providers.Web3Provider) {
  const signer = provider.getSigner(0);
  return new ethers.Contract(tokens.DAI.address, IERC20.abi, signer);
}

export async function createStackerContract(provider: ethers.providers.Web3Provider) {
  const signer = provider.getSigner(0);
  return new ethers.Contract(stackerAddress, IStacker.abi, signer);
}

export async function approveDai(provider: ethers.providers.Web3Provider, amountInWei: string) {
  const contract = await createDaiContract(provider);
  const value = ethers.utils.parseUnits(amountInWei, "wei");
  await contract.approve(stackerAddress, value);
}

export async function getInitialDai(provider: ethers.providers.Web3Provider) {
  const daiContract = await createDaiContract(provider);

  const walletSigner = provider.getSigner(0);
  const walletSignerAddress = await walletSigner.getAddress();

  const daiSigner = await provider.getSigner(addresses.UNISWAP_DAI_EXCHANGE);
  console.log(daiSigner);
  const daiSignerAddress = await daiSigner.getAddress();

  const amount = ethers.utils.parseEther("1");
  console.log(walletSignerAddress, amount);
  await daiContract.connect(daiSigner).transfer(walletSignerAddress, amount);
}

export async function swapForInitialDai(provider: ethers.providers.Web3Provider) {
  const signer = provider.getSigner(0);
  const uniswapFactory = new ethers.Contract(addresses.UNISWAP_GATEWAY_ADDRESS, IUniswapFactory.abi, signer);
  const daiExchangeAddress = await uniswapFactory.getExchange(tokens.DAI.address);
  const daiExchangeContract = new ethers.Contract(daiExchangeAddress, IUniswapExchange.abi, signer);
  await daiExchangeContract.ethToTokenSwapInput("1", Math.round((new Date()).getTime() / 1000) + 300);
  console.log("swapped");

  const address = signer.getAddress();
  const daiContract = await createDaiContract(provider);
  const balance = await daiContract.balanceOf(address);
  console.log(balance);
}

export async function getDaiFromStacker(provider: ethers.providers.Web3Provider) {
  const amount = ethers.utils.parseEther("10");

  const uniswapCallArgs = ethers.utils.defaultAbiCoder.encode(
    ['address', 'uint256', 'uint256', 'address'],
    [tokens.ETH.address, amount, 0, tokens.DAI.address]
  );
  // const uniswapTakeOrder = contracts.UNISWAP_1.takeOrder(addresses.UNISWAP_GATEWAY_ADDRESS, uniswapCallArgs);
  const uniswapCallSig = `takeOrder(address,bytes)`;
  const adapterAddress = "0xB00b4cA6B28C48922A0B344B1FA7369De26b7648";

  const stackerInstance = await createStackerContract(provider);
  const res = await stackerInstance.executeStack(
    [tokens.ETH.address],
    [amount], 
    [adapterAddress],
    [uniswapCallSig],
    [`${uniswapCallArgs}`],
    { value: amount }
  );
  console.log(res);
}
