// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/access/AccessControlDefaultAdminRules.sol";

abstract contract Checkable is AccessControlDefaultAdminRules {
    mapping(bytes32 => bool) public signatures;
    bytes32 public constant WITNESS_ROLE = keccak256("WITNESS_ROLE");

    function check(address to, string memory nftId, uint256 expiry, bytes calldata signature) public {
        require(block.timestamp <= expiry, "Signature has expired");
        bytes32 hash = keccak256(abi.encodePacked(to, nftId, expiry));
        require(!signatures[hash], "Used Signature");

        address witnessAddress = ECDSA.recover(hash, signature);
        _checkRole(WITNESS_ROLE, witnessAddress);
        signatures[hash] = true;
    }
}
