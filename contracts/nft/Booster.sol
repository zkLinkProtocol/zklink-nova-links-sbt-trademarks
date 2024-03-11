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

contract BoosterNFT is
    ERC721Burnable,
    ERC721Enumerable,
    AccessControlDefaultAdminRules
{
    MysteryBoxNFT mysteryBoxNFT;

    uint256 private _nextTokenId;
    bytes32 public constant WITNESS_ROLE = keccak256("WITNESS_ROLE");

    mapping(uint256 => string) public boosterMapping;

    constructor(
        address defaultWitness,
        address boxAddress
    )
        ERC721("FullNovaSBT", "FULL-NOVA-SBT")
        AccessControlDefaultAdminRules(1, msg.sender)
    {
        _setupRole(WITNESS_ROLE, defaultWitness);
        mysteryBoxNFT = MysteryBoxNFT(boxAddress);
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(ERC721, ERC721Enumerable, AccessControlDefaultAdminRules)
        returns (bool)
    {
        return
            ERC721.supportsInterface(interfaceId) ||
            AccessControlDefaultAdminRules.supportsInterface(interfaceId) ||
            ERC721Enumerable.supportsInterface(interfaceId);
    }

    function safeMint(
        address to,
        uint256 original_nft_id,
        string memory type_of_booster,
        bytes calldata signature
    ) public {
        address witnessAddress = ECDSA.recover(
            keccak256(abi.encodePacked(to, "NOVA-BOOSTER-SBT-1")),
            signature
        );
        _checkRole(WITNESS_ROLE, witnessAddress);
        mysteryBoxNFT.burn(original_nft_id);

        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        boosterMapping[tokenId] = type_of_booster;
    }

    function safeMint(
        uint256 original_nft_id,
        string memory type_of_booster,
        bytes calldata signature
    ) external {
        safeMint(msg.sender, original_nft_id, type_of_booster, signature);
    }

    // Soul Bound Token
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 firstTokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Enumerable) {
        require(
            from == address(0) || to == address(0),
            "Token not transferable"
        );
        ERC721Enumerable._beforeTokenTransfer(
            from,
            to,
            firstTokenId,
            batchSize
        );
    }

    function _baseURI() internal pure override returns (string memory) {
        return "ipfs://QmTEhRPzKsUhMWRjWiXDZC2LzJZnNXvgupJLGEEDmajJA8/";
    }

    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        require(tokenId < _nextTokenId, "Token not exists");
        return string.concat(_baseURI(), boosterMapping[tokenId]);
    }
}
