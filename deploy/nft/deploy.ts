import { deployContract } from "../utils";

// This script is used to deploy an NFT contract
// as well as verify it on Block Explorer if possible for the network
export default async function () {
  // const name = "My new NFT";
  // const symbol = "MYNFT";
  // const baseTokenURI = "https://mybaseuri.com/token/";
  await deployContract("NovaNFT", ["0xe269B18099A71599994312757fEf8DEBE7518C31"], {
    noVerify: false
  });
}
