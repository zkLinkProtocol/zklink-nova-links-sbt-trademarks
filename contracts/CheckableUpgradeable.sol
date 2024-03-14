// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlDefaultAdminRulesUpgradeable.sol";

// import "@openzeppelin/contracts/access/AccessControlDefaultAdminRules.sol";

abstract contract CheckableUpgradeable is
    AccessControlDefaultAdminRulesUpgradeable
{
    mapping(bytes => bool) public signatures;
    bytes32 public constant WITNESS_ROLE = keccak256("WITNESS_ROLE");

    function check(
        address to,
        bytes calldata signature,
        string memory nonce,
        uint256 expiry,
        string memory projectId
    ) public {
        require(block.timestamp <= expiry, "Signature has expired");
        require(!signatures[signature], "Used Signature");

        address witnessAddress = ECDSA.recover(
            keccak256(
                abi.encodePacked(to, string(abi.encodePacked(projectId, nonce)))
            ),
            signature
        );
        _checkRole(WITNESS_ROLE, witnessAddress);
        signatures[signature] = true;
    }
}
