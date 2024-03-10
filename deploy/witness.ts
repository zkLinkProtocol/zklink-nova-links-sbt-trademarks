import { concat, ethers, getBytes, hexlify, keccak256 } from "ethers";
import { ec as EC } from "elliptic";
import { arrayify, hexZeroPad, splitSignature } from "@ethersproject/bytes";

export function getSignature(
  addr: string,
  projectId: string,
  WITNESS_SINGER_PRIVATE_KEY: string
): string {
  const ec = new EC("secp256k1");
  const keypair = ec.keyFromPrivate(arrayify(WITNESS_SINGER_PRIVATE_KEY));
  const signature = keypair.sign(arrayify(digest(addr, projectId)), {
    canonical: true,
  });
  const splitSig = splitSignature({
    recoveryParam: signature.recoveryParam,
    r: hexZeroPad("0x" + signature.r.toString(16), 32),
    s: hexZeroPad("0x" + signature.s.toString(16), 32),
  });

  const signatureHex = hexlify(
    concat([splitSig.r, splitSig.s, signature.recoveryParam ? "0x1c" : "0x1b"])
  );
  console.log("signatureHex", signatureHex);
  return signatureHex;
}
function digest(addr: string, projectId: string) {
  const a = encodePacked([
    ["address", getChecksumAddress(addr)],
    ["string", projectId],
  ]);
  return keccak256(a);
}

function getChecksumAddress(address: string): string {
  address = address.toLowerCase();

  const chars = address.substring(2).split("");

  const expanded = new Uint8Array(40);
  for (let i = 0; i < 40; i++) {
    expanded[i] = chars[i].charCodeAt(0);
  }

  const hashed = getBytes(keccak256(expanded));

  for (let i = 0; i < 40; i += 2) {
    if (hashed[i >> 1] >> 4 >= 8) {
      chars[i] = chars[i].toUpperCase();
    }
    if ((hashed[i >> 1] & 0x0f) >= 8) {
      chars[i + 1] = chars[i + 1].toUpperCase();
    }
  }

  return "0x" + chars.join("");
}

function encodePacked(params: any[] = []) {
  let types: any[] = [];
  let values: any[] = [];

  params.forEach((itemArray) => {
    types.push(itemArray[0]);
    values.push(itemArray[1]);
  });

  return ethers.solidityPacked(types, values);
}
