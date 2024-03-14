import { deployContract } from "../utils";

export default async function () {
  // await deployContract("NovaNFT", [process.env.WITNESS_ADDRESS], {
  //   noVerify: false
  // });
  await deployContract("NovaNFT", [], {
    noVerify: false,
    upgradable: true,
  }, [process.env.WITNESS_ADDRESS]);
}
