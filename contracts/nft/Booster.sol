// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/AccessControlDefaultAdminRules.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

import "@openzeppelin/contracts/utils/Strings.sol";

import "./MysteryBoxNFT.sol";
import "../Checkable.sol";

contract BoosterNFT is ERC721Burnable, ERC721Enumerable, AccessControlDefaultAdminRules, Checkable {
    MysteryBoxNFT public mysteryBoxNFT;

    uint256 public nextTokenId;

    mapping(uint256 => string) public boosterMapping;

    constructor(
        address defaultWitness,
        address boxAddress
    ) ERC721("NovaBoosterNFT", "NOVA-BOOSTER-NFT") AccessControlDefaultAdminRules(0, msg.sender) {
        _setupRole(WITNESS_ROLE, defaultWitness);
        mysteryBoxNFT = MysteryBoxNFT(boxAddress);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(ERC721, ERC721Enumerable, AccessControlDefaultAdminRules) returns (bool) {
        return
            ERC721.supportsInterface(interfaceId) ||
            AccessControlDefaultAdminRules.supportsInterface(interfaceId) ||
            ERC721Enumerable.supportsInterface(interfaceId);
    }

    // to = alice
    // original_nft_id0 = 'NovaMysteryBox100'
    // original_nft_id1 = 'NovaMysteryBox101'
    // original_nft_id2 = 'NovaMysteryBox103'
    //     type_of_booster = 'ABC'
    //  nonce = 89
    // expiry = 800
    // signature = witness_key.sign([to, type_of_booster, nonce])
    //
    // safeMint(to, original_nft_id0, type_of_booster, nonce, signature)
    // 销毁original_nft_id0， 让to得到BOOSTER0

    // safeMint(to, original_nft_id2, type_of_booster, nonce, signature)
    // 销毁original_nft_id2， 让to得到BOOSTER0

    function safeMint(
        address to,
        uint256 original_nft_id,
        string memory typeOfBooster,
        string memory nonce,
        uint256 expiry,
        bytes calldata signature
    ) public {
        string memory nftId = string.concat("NOVA-BOOSTER-SBT-", typeOfBooster, "-", nonce);

        check(to, nftId, expiry, signature);
        require(mysteryBoxNFT.ownerOf(original_nft_id) == to, "Not owner of BOX");
        // fixme attacker can burn any other nft of the [original_nft_id owner]  if the signature of `to` leakage
        mysteryBoxNFT.burn(original_nft_id);

        uint256 tokenId = nextTokenId++;
        _safeMint(to, tokenId);
        boosterMapping[tokenId] = typeOfBooster;
    }

    function safeMint(
        uint256 original_nft_id,
        string memory type_of_booster,
        string memory nonce,
        uint256 expiry,
        bytes calldata signature
    ) external {
        safeMint(msg.sender, original_nft_id, type_of_booster, nonce, expiry, signature);
    }

    // Soul Bound Token
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 firstTokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Enumerable) {
        require(from == address(0) || to == address(0), "Token not transferable");
        ERC721Enumerable._beforeTokenTransfer(from, to, firstTokenId, batchSize);
    }

    function _baseURI() internal pure override returns (string memory) {
        return "ipfs://QmTEhRPzKsUhMWRjWiXDZC2LzJZnNXvgupJLGEEDmajJA8/";
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(tokenId < nextTokenId, "Token not exists");
        return string.concat(_baseURI(), boosterMapping[tokenId]);
    }
}
