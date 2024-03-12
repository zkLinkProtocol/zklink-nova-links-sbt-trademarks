// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/AccessControlDefaultAdminRules.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "../Checkable.sol";

contract MysteryBoxNFT is
    ERC721Burnable,
    ERC721Enumerable,
    AccessControlDefaultAdminRules,
    Checkable
{
    uint256 private _nextTokenId;
    // bytes32 public constant WITNESS_ROLE = keccak256("WITNESS_ROLE");

    mapping(address => uint256) nonces;

    constructor(
        address defaultWitness
    )
        ERC721("NovaMysteryBox", "NOVA-MYSTERY-BOX")
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
        bytes calldata signature,
        string memory nonce,
        uint256 expiry
    ) public {
        check(to, signature, nonce, expiry, "NOVA-MYSTERY-BOX-1");

        // require(block.timestamp <= expiry, "Signature has expired");
        // require(nonce == nonces[to] + 1, "Invalid nonce");
        // address witnessAddress = ECDSA.recover(
        //     keccak256(abi.encodePacked(to, "NOVA-MYSTERY-BOX-1")),
        //     signature
        // );
        // _checkRole(WITNESS_ROLE, witnessAddress);

        // nonces[to] = nonce;

        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
    }

    function safeMint(
        bytes calldata signature,
        string memory nonce,
        uint256 expiry
    ) external {
        safeMint(msg.sender, signature, nonce, expiry);
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

    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        require(tokenId < _nextTokenId, "Token not exists");
        return "ipfs://QmVP55kqNJp7TBtgga2JUYikKrUguH2L8RcBcy3CDKqpht";
    }
}
