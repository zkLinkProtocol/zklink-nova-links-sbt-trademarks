// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/AccessControlDefaultAdminRules.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "../Checkable.sol";

contract TrademarkNFT is
    ERC721Burnable,
    ERC721Enumerable,
    AccessControlDefaultAdminRules,
    Checkable
{
    uint256 private _nextTokenId;

    mapping(uint256 => string) public tradeMarksMapping;

    mapping(address => uint256) public num_of_mint;

    constructor(
        address defaultWitness
    )
        ERC721("NovaTradeMark", "NOVA-TRADEMARK")
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
        bytes calldata signature,
        string memory nonce,
        uint256 expiry
    ) public {
        // NOVA-Trademark-0
        string memory projectId = concatenateStrings(
            "NOVA-TradeMark-",
            type_of_trademark
        );

        // NOVA-Trademark-0-
        projectId = concatenateStrings(projectId, "-");
        check(to, signature, nonce, expiry, projectId);

        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        tradeMarksMapping[tokenId] = type_of_trademark;

        // Add the number of mint in the contract database
        // So that backend can reduce the count of remaining mint using this number
        num_of_mint[msg.sender]++;
    }

    function safeMint(
        string memory type_of_trademark,
        bytes calldata signature,
        string memory nonce,
        uint256 expiry
    ) external {
        safeMint(msg.sender, type_of_trademark, signature, nonce, expiry);
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
        return "ipfs://QmXH8EArX1w5T65q2KuqA2JVtZSVVJ9bTqYBLSSmPKcT6i/";
    }

    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        require(tokenId < _nextTokenId, "Token not exists");
        return string.concat(_baseURI(), tradeMarksMapping[tokenId]);
    }
}
