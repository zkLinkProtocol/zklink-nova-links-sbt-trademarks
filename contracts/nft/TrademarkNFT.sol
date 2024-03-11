// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/AccessControlDefaultAdminRules.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract TrademarkNFT is
    ERC721Burnable,
    ERC721Enumerable,
    AccessControlDefaultAdminRules
{
    uint256 private _nextTokenId;
    bytes32 public constant WITNESS_ROLE = keccak256("WITNESS_ROLE");

    mapping(uint256 => string) public tradeMarksMapping;

    constructor(
        address defaultWitness
    )
        ERC721("NovaTradeMark", "NOVA-TRADE-MARK")
        AccessControlDefaultAdminRules(1, msg.sender)
    {
        _setupRole(WITNESS_ROLE, defaultWitness);
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
        string memory type_of_trademark,
        bytes calldata signature
    ) public {
        address witnessAddress = ECDSA.recover(
            keccak256(abi.encodePacked(to, "NOVA-TradeMark-1")),
            signature
        );
        _checkRole(WITNESS_ROLE, witnessAddress);

        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        tradeMarksMapping[tokenId] = type_of_trademark;
    }

    function safeMint(
        string memory type_of_trademark,
        bytes calldata signature
    ) external {
        safeMint(msg.sender, type_of_trademark, signature);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 firstTokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Enumerable) {
        ERC721Enumerable._beforeTokenTransfer(
            from,
            to,
            firstTokenId,
            batchSize
        );
    }

    function _baseURI() internal pure override returns (string memory) {
        return "ipfs://QmTvyy4BTNdNrs9TNCxPnyeVzEtJhQV1Ef4mTSK8onNAWu/";
    }

    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        require(tokenId < _nextTokenId, "Token not exists");
        return string.concat(_baseURI(), tradeMarksMapping[tokenId]);
    }
}
