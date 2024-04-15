// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {ERC721PhaseIIPreAuthUpgradeable} from "./ERC721PhaseIIPreAuthUpgradeable.sol";
import {ERC1155BurnableUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/ERC1155BurnableUpgradeable.sol";

contract NovaComposeNFT is ERC721PhaseIIPreAuthUpgradeable, UUPSUpgradeable {
    ERC1155BurnableUpgradeable public immutable NOVA_MEME;
    uint256 public maxSupply;
    uint256 public burnCount;

    mapping(uint256 => uint256) public burnCountMap;


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

    function safeMint(uint256[] calldata tokenIds) external {
        safeMint(msg.sender, tokenIds);
    }

    function safeMint(
        address to,
        uint256[] calldata tokenIds
    ) public nonReentrant whenNotPaused {
        require(totalSupply() + 1 <= maxSupply, "Exceeds max supply");
        require(tokenIds.length == burnCount, "TokenIds length must equal to burnCount");
        uint256[] memory burnAmounts = new uint256[](tokenIds.length);
        uint256[] memory sortedId = bubbleSort(tokenIds);
        uint256 lastTokenId = sortedId[0];
        for (uint i = 0; i < sortedId.length; i++) {
            if (i > 0) {
                require(sortedId[i] > lastTokenId, "TokenId repeat");
            }
            require(burnCountMap[sortedId[i]] > 0, "Invalid tokenId");
            burnAmounts[i] = burnCountMap[sortedId[i]];
            lastTokenId = sortedId[i];
        }

        NOVA_MEME.burnBatch(msg.sender, sortedId, burnAmounts);
        _safeMintNormal(to, 1);
    }

    function setMemeTokenIds(uint256 tokenId, uint256 amount) external onlyOwner {
        burnCountMap[tokenId] = amount;
    }

    function baseTokenURI() public view returns (string memory) {
        return _baseURI();
    }

    function bubbleSort(uint256[] memory arr) public pure returns (uint256[] memory) {
        uint n = arr.length;
        for (uint i = 0; i < n - 1; i++) {
            for (uint j = 0; j < n - i - 1; j++) {
                if (arr[j] > arr[j + 1]) {
                    // Swap elements
                    (arr[j], arr[j + 1]) = (arr[j + 1], arr[j]);
                }
            }
        }
        return arr;
    }
}