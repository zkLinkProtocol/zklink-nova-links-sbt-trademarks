// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {ERC721PhaseIIPreAuthUpgradeable} from "./ERC721PhaseIIPreAuthUpgradeable.sol";
import {ERC1155BurnableUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/ERC1155BurnableUpgradeable.sol";

contract NovaChadNFT is ERC721PhaseIIPreAuthUpgradeable, UUPSUpgradeable {
    ERC1155BurnableUpgradeable public immutable NOVA_INFINITY_STONES;
    uint256 public maxSupply;

    constructor(ERC1155BurnableUpgradeable _infinityStones) {
        _disableInitializers();

        NOVA_INFINITY_STONES = _infinityStones;
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

    function setMaxSupply(uint256 _maxSupply) public onlyOwner {
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

    function compositeWithAuth(
        address to,
        uint256 nonce,
        uint256[] calldata tokenIds,
        uint256[] calldata amounts,
        uint256 expiry,
        uint256 mintType,
        bytes calldata signature
    ) external {
        require(totalSupply() + 1 <= maxSupply, "Exceeds max supply");
        require(tokenIds.length == amounts.length, "Invalid tokenIds and amounts");

        _compositeMint(to, nonce, tokenIds, amounts, expiry, mintType, signature);

        NOVA_INFINITY_STONES.burnBatch(msg.sender, tokenIds, amounts);
    }

    function baseTokenURI() public view returns (string memory) {
        return _baseURI();
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireMinted(tokenId);

        return _baseURI();
    }
}
