// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^4.0.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyNFT is ERC721, ERC721Burnable, Ownable {
    uint256 private _nextTokenId;

    constructor() ERC721("MyToken", "MTK") {}

    function mint(address to) public onlyOwner {
        uint256 tokenId = _nextTokenId++;
        _mint(to, tokenId);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override {
        require(from == address(0), "Token not transferable");
        super._beforeTokenTransfer(from, to, tokenId);
    }
}
