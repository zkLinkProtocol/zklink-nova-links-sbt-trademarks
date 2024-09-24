// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {ERC721PhaseIIIPreAuthUpgradeable} from "./ERC721PhaseIIIPreAuthUpgradeable.sol";

contract NovaGenesisPassPhaseIIINFT is ERC721PhaseIIIPreAuthUpgradeable, UUPSUpgradeable {
    uint256 public hardtopLimit;
    mapping(address => bool) public isMinted;

    event HardtopLimitChanged(uint256 newHardtopLimit);

    constructor() {
        _disableInitializers();
    }

    receive() external payable {}

    function initialize(
        string memory _name,
        string memory _symbol,
        string memory _baseTokenURI,
        uint256 _hardtopLimit,
        address _defaultWitness
    ) external initializer {
        __UUPSUpgradeable_init_unchained();

        __ERC721PreAuth_init_unchained(_name, _symbol, _baseTokenURI, _defaultWitness);

        _setHardtopLimit(_hardtopLimit);
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    function publicMint(
        address to,
        uint256 tokenId,
        uint256 amount,
        uint256 nonce,
        uint256 expiry,
        bytes calldata signature
    ) public nonReentrant whenNotPaused payable{
        require(totalSupply() < hardtopLimit, "Hardtop limit reached");
        require(!isMinted[to], "Has Minted");
        require(msg.value > 0.0001 ether, "Need to pay 0.0001ETH");
        isMinted[to] = true;
        _safeMint(to, tokenId, amount, nonce, expiry, signature);
    }

    function setHardtopLimit(uint256 _newHardtopLimit) external onlyOwner {
        _setHardtopLimit(_newHardtopLimit);
    }

    function _setHardtopLimit(uint256 _newHardtopLimit) internal {
        require(_newHardtopLimit >= totalSupply(), "Hardtop limit cannot be less than current supply");
        hardtopLimit = _newHardtopLimit;

        emit HardtopLimitChanged(_newHardtopLimit);
    }

    function baseTokenURI() public view returns (string memory) {
        return _baseURI();
    }
}
