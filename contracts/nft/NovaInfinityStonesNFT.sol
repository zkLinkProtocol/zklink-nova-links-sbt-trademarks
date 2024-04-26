// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {ERC1155PhaseIIPreAuthUpgradeable} from "./ERC1155PhaseIIPreAuthUpgradeable.sol";
import {ECDSAUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/cryptography/ECDSAUpgradeable.sol";

contract NovaInfinityStonesNFT is ERC1155PhaseIIPreAuthUpgradeable, UUPSUpgradeable {
    mapping(address => mapping(uint256 => bool)) public mintRecord;
    constructor() {
        _disableInitializers();
    }

    function initialize(
        string memory _name,
        string memory _baseTokenURI,
        address _defaultWitness
    ) external initializer {
        __UUPSUpgradeable_init_unchained();

        __ERC1155PreAuth_init_unchained(_name, _baseTokenURI, _defaultWitness);
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    function safeMint(
        address to,
        uint256 nonce,
        uint256 tokenId,
        uint256 amount,
        uint256 expiry,
        uint256 mintType,
        bytes calldata signature
    ) public nonReentrant whenNotPaused {
        require(mintRecord[to][tokenId] == false, "TokenId already minted");
        mintRecord[to][tokenId] = true;
        _safeMint(to, nonce, tokenId, amount, expiry, mintType, signature);
    }

    function safeBatchMint(
        address to,
        uint256 nonce,
        uint256[] memory tokenIds,
        uint256[] memory amounts,
        uint256 expiry,
        uint256 mintType,
        bytes calldata signature
    ) public nonReentrant whenNotPaused {
        for (uint256 i = 0; i < tokenIds.length; i++) {
            require(mintRecord[to][tokenIds[i]] == false, "TokenId already minted");
            mintRecord[to][tokenIds[i]] = true;
        }
        _safeBatchMint(to, nonce, tokenIds, amounts, expiry, mintType, signature);
    }

    function safeMint(
        uint256 nonce,
        uint256 tokenId,
        uint256 amount,
        uint256 expiry,
        uint256 mintType,
        bytes calldata signature
    ) external {
        safeMint(msg.sender, nonce, tokenId, amount, expiry, mintType, signature);
    }

    function safeBatchMint(
        uint256 nonce,
        uint256[] memory tokenIds,
        uint256[] memory amounts,
        uint256 expiry,
        uint256 mintType,
        bytes calldata signature
    ) external {
        safeBatchMint(msg.sender, nonce, tokenIds, amounts, expiry, mintType, signature);
    }

    function setURI(uint256 tokenId, string memory newURI) external onlyOwner {
        _setURI(tokenId, newURI);
    }
}
