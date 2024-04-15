// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {ERC721PhaseIIPreAuthUpgradeable} from "./ERC721PhaseIIPreAuthUpgradeable.sol";
import {ERC1155BurnableUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/ERC1155BurnableUpgradeable.sol";
import {console} from "hardhat/console.sol";
contract NovaComposeNFT is ERC721PhaseIIPreAuthUpgradeable, UUPSUpgradeable {
    ERC1155BurnableUpgradeable public immutable NOVA_MEME;
    uint256 public maxSupply;
    uint256[] public novaMemeIds;
    mapping(uint256 => uint256) public novaMemeIdMap;

    constructor(ERC1155BurnableUpgradeable _meme) {
        _disableInitializers();

        NOVA_MEME = _meme;
    }

    function initialize(
        string memory _name,
        string memory _symbol,
        string memory _baseTokenURI,
        address _defaultWitness,
        uint256 _maxSupply
    ) public initializer {
        __UUPSUpgradeable_init_unchained();

        __ERC721PreAuth_init_unchained(_name, _symbol, _baseTokenURI, _defaultWitness);
        maxSupply = _maxSupply;
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    function setMaxSupply(uint256 _maxSupply) external onlyOwner {
        maxSupply = _maxSupply;
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

    function safeMint() external {
        safeMint(msg.sender);
    }

    function safeMint(address to) public nonReentrant whenNotPaused {
        require(totalSupply() + 1 <= maxSupply, "Exceeds max supply");
        uint256[] memory _burnTokenIds = new uint256[](novaMemeIds.length);
        uint256[] memory _burnAmounts = new uint256[](novaMemeIds.length);

        for (uint i = 0; i < novaMemeIds.length; i++) {
            _burnTokenIds[i] = novaMemeIds[i];
            _burnAmounts[i] = novaMemeIdMap[novaMemeIds[i]];
        }

        NOVA_MEME.burnBatch(msg.sender, _burnTokenIds, _burnAmounts);
        _safeMintNormal(to, 1);
    }

    function setMemeTokenIds(uint256 tokenId, uint256 amount) external onlyOwner {
        novaMemeIdMap[tokenId] = amount;
        novaMemeIds.push(tokenId);
    }

    function baseTokenURI() public view returns (string memory) {
        return _baseURI();
    }
}
