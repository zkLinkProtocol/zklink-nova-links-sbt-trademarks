// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {ERC721PhaseIIIPreAuthUpgradeable} from "./ERC721PhaseIIIPreAuthUpgradeable.sol";

contract NovaGenesisPassPhaseIIINFT is ERC721PhaseIIIPreAuthUpgradeable, UUPSUpgradeable {
    uint256 public hardtopLimit;
    mapping(address => bool) public isMinted;
    uint256 public mintPrice;

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
        address _defaultWitness,
        uint256 _mintPrice
    ) external initializer {
        __UUPSUpgradeable_init_unchained();

        __ERC721PreAuth_init_unchained(_name, _symbol, _baseTokenURI, _defaultWitness);

        _setHardtopLimit(_hardtopLimit);

        _setMintPrice(_mintPrice);
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
        require(!isMinted[to], "Has Minted");
        require(msg.value >= mintPrice * 1 gwei, "Not enough ETH sent");
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

    function setMintPrice(uint256 _mintPrice) external onlyOwner {
        _setMintPrice(_mintPrice);
    }

    function _setMintPrice(uint256 _mintPrice) internal {
        mintPrice = _mintPrice;
    }

    function withdraw(address account, uint256 amount) external onlyOwner nonReentrant whenNotPaused{
        require(account != address(0), "Invalid address");
        require(amount > 0, "Invalid amount");
        require(amount <= address(this).balance, "Insufficient balance");

        (bool success, ) = account.call{value: amount}("");
        require(success, "Transfer failed");
        emit Withdraw(account, amount); 
    }

    function withdrawAll(address account) external onlyOwner nonReentrant whenNotPaused{
        require(account != address(0), "Invalid address");
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");

        (bool success, ) = account.call{value: balance}("");
        require(success, "Transfer failed");
        emit WithdrawAll(account, balance); 
    }
}
