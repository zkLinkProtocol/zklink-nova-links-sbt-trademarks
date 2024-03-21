// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {ERC721PreAuthUpgradeable} from "./ERC721PreAuthUpgradeable.sol";

contract NovaGenesisPassNFT is ERC721PreAuthUpgradeable, UUPSUpgradeable {
    uint256 public hardtopLimit;

    event HardtopLimitChanged(uint256 newHardtopLimit);

    function initialize(
        string memory _name,
        string memory _symbol,
        string memory _baseTokenURI,
        uint256 _hardtopLimit,
        address _defaultWitness
    ) external initializer {
        __UUPSUpgradeable_init();

        __ERC721PreAuth_init(_name, _symbol, _baseTokenURI, _defaultWitness);

        _setHardtopLimit(_hardtopLimit);
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    function safeMint(
        address to,
        uint256 nonce,
        uint256 expiry,
        bytes calldata signature
    ) public nonReentrant whenNotPaused {
        require(_totalSupply() < hardtopLimit, "Hardtop limit reached");
        _safeMint(to, nonce, expiry, signature);
    }

    function safeMint(uint256 nonce, uint256 expiry, bytes calldata signature) external {
        safeMint(msg.sender, nonce, expiry, signature);
    }

    function setHardtopLimit(uint256 _newHardtopLimit) external onlyOwner {
        _setHardtopLimit(_newHardtopLimit);
    }

    function _setHardtopLimit(uint256 _newHardtopLimit) internal {
        require(_newHardtopLimit >= _totalSupply(), "Hardtop limit cannot be less than current supply");
        hardtopLimit = _newHardtopLimit;

        emit HardtopLimitChanged(_newHardtopLimit);
    }

    function baseTokenURI() public view returns (string memory) {
        return _baseURI();
    }

    function burn(uint256 tokenId) public override nonReentrant whenNotPaused {
        _burn(tokenId);
    }

    function totalSupply() public view override returns (uint256) {
        return _totalSupply();
    }
}
