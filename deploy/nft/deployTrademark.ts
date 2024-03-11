import { deployContract } from "../utils";

export default async function () {
  await deployContract("TrademarkNFT", [process.env.WITNESS_ADDRESS], {
    noVerify: false
  });
}
