// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^4.0.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// import "@openzeppelin/contracts/utils/Strings.sol";
// import "@openzeppelin/contracts/utils/Base64.sol";

contract NovaNFT is ERC721, ERC721Burnable, Ownable {
    // using Strings for uint256;
    // using Base64 for bytes;

    uint256 private _nextTokenId;

    mapping(uint256 => string) public charactersMapping;

    constructor() ERC721("Nova", "NOVA") {
        // TODO: Remove this part
        // safeMint(msg.sender, "ISTP");
        // safeMint(msg.sender, "ESFJ");
        // safeMint(msg.sender, "INFJ");
        // safeMint(msg.sender, "ENTP");
    }

    function safeMint(
        address to,
        string memory type_of_character
    ) public onlyOwner {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        charactersMapping[tokenId] = type_of_character;
    }

    // Soul Bound Token
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override {
        require(
            from == address(0) || to == address(0),
            "Token not transferable"
        );
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function _baseURI() internal pure override returns (string memory) {
        return "ipfs://QmYY5RWPzGEJEjRYhGvBhycYhZxRMxCSkHNTxtVrrjUzQf/";
    }

    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        require(tokenId < _nextTokenId, "Token not exists");
        return string.concat(_baseURI(), charactersMapping[tokenId]);
    }
}
