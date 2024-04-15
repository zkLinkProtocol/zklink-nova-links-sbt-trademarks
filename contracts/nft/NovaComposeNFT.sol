// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {ERC721PhaseIIPreAuthUpgradeable} from "./ERC721PhaseIIPreAuthUpgradeable.sol";
import {ERC1155BurnableUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/ERC1155BurnableUpgradeable.sol";
import {console} from "hardhat/console.sol";
contract NovaComposeNFT is ERC721PhaseIIPreAuthUpgradeable, UUPSUpgradeable {
    ERC1155BurnableUpgradeable public immutable NOVA_MEME;
    uint256 public maxSupply;
    uint256 public burnCount;
    mapping(uint256 => bool) public novaMemeIdMap;

    constructor(ERC1155BurnableUpgradeable _meme) {
        _disableInitializers();

        NOVA_MEME = _meme;
    }

    function initialize(
        string memory _name,
        string memory _symbol,
        string memory _baseTokenURI,
        address _defaultWitness,
        uint256 _maxSupply,
        uint256 _burnCount
    ) public initializer {
        __UUPSUpgradeable_init_unchained();

        __ERC721PreAuth_init_unchained(_name, _symbol, _baseTokenURI, _defaultWitness);
        maxSupply = _maxSupply;
        burnCount = _burnCount;
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    function setMaxSupply(uint256 _maxSupply) public onlyOwner {
        maxSupply = _maxSupply;
    }

    function setBurnCount(uint256 _burnCount) public onlyOwner {
        burnCount = _burnCount;
    }

    function safeMintWithAuth(
        address to,
        uint256 nonce,
        uint256 expiry,
        uint256 mintType,
        bytes calldata signature
    ) public nonReentrant whenNotPaused {
        require(totalSupply() + 1 <= maxSupply, "Exceeds max supply");

        _safeMint(to, nonce, expiry, mintType, signature);
    }

    function safeMintWithAuth(uint256 nonce, uint256 expiry, uint256 mintType, bytes calldata signature) external {
        safeMintWithAuth(msg.sender, nonce, expiry, mintType, signature);
    }

    function safeMint(uint256[] calldata tokenIds, uint256[] calldata amounts, uint256 mintType) external {
        safeMint(msg.sender, tokenIds, amounts, mintType);
    }

    function safeMint(
        address to,
        uint256[] calldata tokenIds,
        uint256[] calldata amounts,
        uint256 mintType
    ) public nonReentrant whenNotPaused {
        require(tokenIds.length == amounts.length, "Invalid tokenIds and amounts");
        require(totalSupply() + 1 <= maxSupply, "Exceeds max supply");
        uint256 totalAmount = 0;
        for (uint i = 0; i < amounts.length; i++) {
            require(amounts[i] > 0, "Invalid amount");
            require(novaMemeIdMap[tokenIds[i]], "Invalid tokenId");
            totalAmount += amounts[i];
        }
        require(totalAmount == burnCount, "Total amount must equal to burnCount");

        NOVA_MEME.burnBatch(msg.sender, tokenIds, amounts);
        _safeMintNormal(to, mintType);
    }

    function setMemeTokenIds(uint256 tokenId) external onlyOwner {
        novaMemeIdMap[tokenId] = true;
    }

    function baseTokenURI() public view returns (string memory) {
        return _baseURI();
    }
}
