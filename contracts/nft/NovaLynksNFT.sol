// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {ERC721PreAuthUpgradeable} from "./ERC721PreAuthUpgradeable.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {ERC1155BurnableUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/ERC1155BurnableUpgradeable.sol";
import {EnumerableSetUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/structs/EnumerableSetUpgradeable.sol";

contract NovaLynksNFT is ERC721PreAuthUpgradeable, UUPSUpgradeable {
    IERC721 public immutable NOVA_SBT;
    ERC1155BurnableUpgradeable public immutable NOVA_TRADEMARK;

    // The tokenId of the trademark NFT that needs to be burned
    uint256[4] public trademarkTokenIds;

    using EnumerableSetUpgradeable for EnumerableSetUpgradeable.AddressSet;
    EnumerableSetUpgradeable.AddressSet private blackList;

    constructor(IERC721 _sbt, ERC1155BurnableUpgradeable _trademark) {
        _disableInitializers();

        NOVA_SBT = _sbt;
        NOVA_TRADEMARK = _trademark;
    }

    function initialize(
        string memory _name,
        string memory _symbol,
        string memory _baseTokenURI,
        address _defaultWitness
    ) public initializer {
        __UUPSUpgradeable_init_unchained();

        __ERC721PreAuth_init_unchained(_name, _symbol, _baseTokenURI, _defaultWitness);
    }
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    function safeMintWithAuth(
        address to,
        uint256 nonce,
        uint256 expiry,
        bytes calldata signature
    ) public nonReentrant whenNotPaused {
        _safeMint(to, nonce, expiry, signature);
    }

    function safeMintWithAuth(uint256 nonce, uint256 expiry, bytes calldata signature) external {
        safeMintWithAuth(msg.sender, nonce, expiry, signature);
    }

    function safeMint() external {
        safeMint(msg.sender);
    }

    function safeMint(address to) public nonReentrant whenNotPaused {
        require(NOVA_SBT.balanceOf(msg.sender) > 0, "Only nova SBT holders can mint");
        uint256[] memory _burnAmounts = new uint256[](trademarkTokenIds.length);
        uint256[] memory _burnTokenIds = new uint256[](trademarkTokenIds.length);
        unchecked {
            for (uint256 i = 0; i < trademarkTokenIds.length; i++) {
                require(trademarkTokenIds[i] != 0, "Invalid trademark token id");
                _burnAmounts[i] = 1;
                _burnTokenIds[i] = trademarkTokenIds[i];
            }
        }
        NOVA_TRADEMARK.burnBatch(msg.sender, _burnTokenIds, _burnAmounts);

        _safeMint(to);
    }

    function setTrademarkTokenIds(uint256[4] memory _trademarkTokenIds) external onlyOwner {
        trademarkTokenIds = _trademarkTokenIds;
    }

    function baseTokenURI() public view returns (string memory) {
        return _baseURI();
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 firstTokenId,
        uint256 batchSize
    ) internal virtual override {
        if (from != address(0) && to != address(0)) {
            if (blackList.contains(from)) {
                revert("Accounts in the blacklist cannot be transferred");
            } else if (balanceOf(from) >= 10) {
                revert("Accounts with a balance greater than 10 cannot be transferred out");
            }
        }
        super._beforeTokenTransfer(from, to, firstTokenId, batchSize);
    }

    function addToBlackList(address account) external onlyOwner {
        require(blackList.add(account), "Failed to add account to blackList");
    }

    function batchAddToBlackList(address[] memory accounts) external onlyOwner {
        for (uint i = 0; i < accounts.length; i++) {
            blackList.add(accounts[i]);
        }
    }

    function removeFromBlackList(address account) external onlyOwner {
        require(blackList.remove(account), "Failed to remove account from blackList");
    }

    function batchRemoveFromBlackList(address[] memory accounts) external onlyOwner {
        for (uint i = 0; i < accounts.length; i++) {
            blackList.remove(accounts[i]);
        }
    }

    function getBlackList() public view returns (address[] memory) {
        return blackList.values();
    }
}
