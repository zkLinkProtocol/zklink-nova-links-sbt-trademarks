// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/AccessControlDefaultAdminRules.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "../Checkable.sol";

contract MysteryBoxNFT is ERC721Burnable, ERC721Enumerable, Checkable {
    uint256 public nextTokenId;

    mapping(address => uint256) public nonces;

    constructor(
        address defaultWitness
    ) ERC721("NovaMysteryBox", "NOVA-MYSTERY-BOX") AccessControlDefaultAdminRules(0, msg.sender) {
        _setupRole(WITNESS_ROLE, defaultWitness);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(ERC721, ERC721Enumerable, AccessControlDefaultAdminRules) returns (bool) {
        return
            ERC721.supportsInterface(interfaceId) ||
            AccessControlDefaultAdminRules.supportsInterface(interfaceId) ||
            ERC721Enumerable.supportsInterface(interfaceId);
    }

    function safeMint(address to, bytes calldata signature, string memory nonce, uint256 expiry) public {
        string memory nftId = string.concat("NOVA-MYSTERY-BOX-", nonce);
        check(to, nftId, expiry, signature);

        uint256 tokenId = nextTokenId++;
        _safeMint(to, tokenId);
    }

    function safeMint(bytes calldata signature, string memory nonce, uint256 expiry) external {
        safeMint(msg.sender, signature, nonce, expiry);
    }

    // todo do we need to override this function
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 firstTokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Enumerable) {
        ERC721Enumerable._beforeTokenTransfer(from, to, firstTokenId, batchSize);
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(tokenId < nextTokenId, "Token not exists");
        return "ipfs://QmVP55kqNJp7TBtgga2JUYikKrUguH2L8RcBcy3CDKqpht";
    }
}
