// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {ERC1155PreAuthUpgradeable} from "./ERC1155PreAuthUpgradeable.sol";

contract NovaTrademarkNFT is ERC1155PreAuthUpgradeable, UUPSUpgradeable {
    mapping(address => uint256) public mintNonces2;

    mapping(uint256 => bool) public typeMinted;

    mapping(uint256 => mapping(address => uint256)) public mintNoncesMap;

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
        bytes calldata signature
    ) public nonReentrant whenNotPaused {
        _safeMint(to, nonce, tokenId, amount, expiry, signature);
    }

    function safeBatchMint(
        address to,
        uint256 nonce,
        uint256[] memory tokenIds,
        uint256[] memory amounts,
        uint256 expiry,
        bytes calldata signature
    ) public nonReentrant whenNotPaused {
        _safeBatchMint(to, nonce, tokenIds, amounts, expiry, signature);
    }

    function safeMint(
        uint256 nonce,
        uint256 tokenId,
        uint256 amount,
        uint256 expiry,
        bytes calldata signature
    ) external {
        safeMint(msg.sender, nonce, tokenId, amount, expiry, signature);
    }

    function safeBatchMint(
        uint256 nonce,
        uint256[] memory tokenIds,
        uint256[] memory amounts,
        uint256 expiry,
        bytes calldata signature
    ) external {
        safeBatchMint(msg.sender, nonce, tokenIds, amounts, expiry, signature);
    }

    function setURI(uint256 tokenId, string memory newURI) external onlyOwner {
        _setURI(tokenId, newURI);
    }

    function safeMint2(
        address to,
        uint256 nonce,
        uint256 tokenId,
        uint256 amount,
        uint256 expiry,
        bytes calldata signature
    ) public nonReentrant whenNotPaused {
        _safeMint(to, nonce, tokenId, amount, expiry, signature);
        mintNonces2[to] += 1;
    }

    function subMintNonce2(address to) public view returns (uint256) {
        return mintNonces[to] - mintNonces2[to];
    }

    function safeMintCommon(
        address to,
        uint256 nonce,
        uint256 tokenId,
        uint256 amount,
        uint256 expiry,
        bytes calldata signature,
        uint256 mintType
    ) public nonReentrant whenNotPaused {
        _safeMint(to, nonce, tokenId, amount, expiry, signature);
        mintNoncesMap[mintType][to] += 1;
        if (typeMinted[mintType] == false) {
            typeMinted[mintType] = true;
        }
    }

    function getMintNonceOne(address user) public view returns (uint256) {
        uint256 nonceOne = mintNonces[user] - mintNonces2[user];
        for (uint256 i = 3; ; i++) {
            if (typeMinted[i] == false) {
                break;
            }
            nonceOne -= mintNoncesMap[i][user];
        }

        return nonceOne;
    }
}
