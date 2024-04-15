// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {ERC1155PreAuthUpgradeable} from "./ERC1155PreAuthUpgradeable.sol";
import {ECDSAUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/cryptography/ECDSAUpgradeable.sol";

contract NovaBoosterPhaseIINFT is ERC1155PreAuthUpgradeable, UUPSUpgradeable {
    bytes32 public constant MINT_COMMON_AUTH_TYPE_HASH =
        keccak256(
            "MintCommonAuth(address to,uint256 nonce,uint256 tokenId,uint256 amount,uint256 expiry,uint256 mintType)"
        );

    mapping(uint256 => mapping(address => uint256)) public mintNoncesMap;

    mapping(address => uint256) public numMintNonces;

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

    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal virtual override {
        require(from == address(0) || to == address(0), "Token not transferable");
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
    }

    function setURI(uint256 tokenId, string memory newURI) external onlyOwner {
        _setURI(tokenId, newURI);
    }

    function safeMintCommon(
        address to,
        uint256 nonce,
        uint256 tokenId,
        uint256 amount,
        uint256 expiry,
        bytes calldata signature,
        uint256 mintType
    ) external nonReentrant whenNotPaused {
        _checkMintCommonAuthorization(to, nonce, tokenId, amount, expiry, mintType, signature);
        _mint(to, tokenId, amount, "");
        mintNonces[to] += 1;
        numMintNonces[to] += 1;
        mintNoncesMap[mintType][to] += 1;
    }

    function getMintNonceOne(address user) public view returns (uint256) {
        uint256 nonceOne = mintNonces[user];
        if (uint256(nonceOne) == 0) {
            return nonceOne;
        }

        return nonceOne - numMintNonces[user];
    }

    function _checkMintCommonAuthorization(
        address to,
        uint256 nonce,
        uint256 tokenId,
        uint256 amount,
        uint256 expiry,
        uint256 mintType,
        bytes calldata signature
    ) internal {
        require(block.timestamp <= expiry, "Signature has expired");
        bytes32 mintAuthHash = keccak256(
            abi.encode(MINT_COMMON_AUTH_TYPE_HASH, to, nonce, tokenId, amount, expiry, mintType)
        );
        require(!signatures[mintAuthHash], "Used Signature");

        address witnessAddress = ECDSAUpgradeable.recover(_hashTypedDataV4(mintAuthHash), signature);
        _checkRole(WITNESS_ROLE, witnessAddress);
        signatures[mintAuthHash] = true;
    }
}
