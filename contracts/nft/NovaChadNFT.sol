// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {ERC721PhaseIIPreAuthUpgradeable} from "./ERC721PhaseIIPreAuthUpgradeable.sol";
import {ERC1155BurnableUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/ERC1155BurnableUpgradeable.sol";

contract NovaChadNFT is ERC721PhaseIIPreAuthUpgradeable, UUPSUpgradeable {
    ERC1155BurnableUpgradeable public immutable NOVA_INFINITY_STONES;
    uint256 public maxSupply;

    mapping(uint256 => uint256) public burnCountMapping;

    uint256[] public levels;

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

    function setBurnCount(uint256 level, uint256 burnCount) public onlyOwner {
        burnCountMapping[level] = burnCount;
    }

    function setLevels(uint256 level) public onlyOwner {
        levels.push(level);
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
        uint256 currentTokenId = _tokenIdTracker._value;
        for (uint i = 0; i < levels.length; i++) {
            if (currentTokenId + 1 <= levels[i]) {
                require(tokenIds.length == burnCountMapping[levels[i]], "Invalid tokenIds");
                break;
            }
        }

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

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 firstTokenId,
        uint256 batchSize
    ) internal virtual override {
        if (from != address(0) && to != address(0)) {
            revert("unable transfer");
        }
        super._beforeTokenTransfer(from, to, firstTokenId, batchSize);
    }
}
