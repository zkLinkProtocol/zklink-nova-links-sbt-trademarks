import { deployContract } from "./utils";

export default async function () {
    await deployContract("BoxDemo", [], {
        noVerify: false,
        upgradable: true,
    }, ['42']);
}
