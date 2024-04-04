// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {ERC721PreAuthUpgradeable} from "./ERC721PreAuthUpgradeable.sol";

contract NovaMysteryBoxPhaseIINFT is UUPSUpgradeable, ERC721PreAuthUpgradeable {
    // The nonce of the burn transaction
    mapping(address => uint256) public burnNonces;

    function initialize(
        string memory _name,
        string memory _symbol,
        string memory _baseTokenURI,
        address _defaultWitness
    ) external initializer {
        __UUPSUpgradeable_init();

        __ERC721PreAuth_init(_name, _symbol, _baseTokenURI, _defaultWitness);
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    function safeMint(
        address to,
        uint256 nonce,
        uint256 expiry,
        bytes calldata signature
    ) public nonReentrant whenNotPaused {
        _safeMint(to, nonce, expiry, signature);
    }

    function safeMint(uint256 nonce, uint256 expiry, bytes calldata signature) external {
        safeMint(msg.sender, nonce, expiry, signature);
    }

    function baseTokenURI() public view returns (string memory) {
        return _baseURI();
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireMinted(tokenId);
        return _baseURI();
    }

    function burn(uint256 tokenId) public override {
        //solhint-disable-next-line max-line-length
        require(_isApprovedOrOwner(_msgSender(), tokenId), "ERC721: caller is not token owner or approved");
        burnNonces[_msgSender()] += 1;
        _burn(tokenId);
    }
}
