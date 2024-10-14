// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {ERC721PhaseIIIPreAuthUpgradeable} from "./ERC721PhaseIIIPreAuthUpgradeable.sol";

contract NovaGenesisPassPhaseIINFT is ERC721PhaseIIIPreAuthUpgradeable, UUPSUpgradeable {
    uint256 public hardtopLimit;
    mapping(address => bool) public isMinted;
    mapping(address => uint256) public userMintedCount;
    uint256 public mintPrice;
    uint256 public mintLimit;

    event HardtopLimitChanged(uint256 newHardtopLimit);
    event Withdraw(address indexed to, uint256 amount);
    event WithdrawAll(address indexed to, uint256 amount);

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
    ) public payable nonReentrant whenNotPaused {
        require(totalSupply() < hardtopLimit, "Hardtop limit reached");
        require(userMintedCount[to] < mintLimit, "User exceeded mint limit");
        require(msg.value >= mintPrice * 1 gwei, "Not enough ETH sent");
        userMintedCount[to] ++;
        _safeMint(to, tokenId, amount, nonce, expiry, signature);
    }

    function getUserMintedCount(address user) public view returns (uint256) {
        return userMintedCount[user];
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

    function setMintPrice(uint256 _mintPrice) external onlyOwner {
        _setMintPrice(_mintPrice);
    }

    function _setMintPrice(uint256 _mintPrice) internal {
        mintPrice = _mintPrice;
    }

     function setMintLimit(uint256 _mintLimit) external onlyOwner {
        _setMintLimit(_mintLimit);
    }

    function _setMintLimit(uint256 _mintLimit) internal {
        mintLimit = _mintLimit;
    }

    function withdraw(address account, uint256 amount) external onlyOwner nonReentrant whenNotPaused {
        require(account != address(0), "Invalid address");
        require(amount > 0, "Invalid amount");
        require(amount <= address(this).balance, "Insufficient balance");

        (bool success, ) = payable(account).call{value: amount}("");
        require(success, "Transfer failed");
        emit Withdraw(account, amount);
    }

    function withdrawAll(address account) external onlyOwner nonReentrant whenNotPaused {
        require(account != address(0), "Invalid address");
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");

        (bool success, ) = payable(account).call{value: balance}("");
        require(success, "Transfer failed");
        emit WithdrawAll(account, balance);
    }
}
