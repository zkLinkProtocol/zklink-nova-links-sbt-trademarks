// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/AccessControlDefaultAdminRules.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

import "@openzeppelin/contracts/utils/Strings.sol";

import "./NovaNFT.sol";

interface ITrademark is IERC721 {
    function tradeMarksMapping(uint256) external returns (string memory);

    function burn(uint256) external;
}

contract FullNovaNFT is
    ERC721Burnable,
    ERC721Enumerable,
    AccessControlDefaultAdminRules
{
    error TrademarkMismatch(string type_of_trademark, uint256 tokenId);

    ITrademark tradeMark;
    NovaNFT novaNFT;
    uint256 private _nextTokenId;
    bytes32 public constant WITNESS_ROLE = keccak256("WITNESS_ROLE");

    mapping(uint256 => string) public charactersMapping;

    constructor(
        address defaultWitness,
        address trademarkAddress,
        address novaNFTAddress
    )
        ERC721("FullNovaSBT", "FULL-NOVA-SBT")
        AccessControlDefaultAdminRules(1, msg.sender)
    {
        _setupRole(WITNESS_ROLE, defaultWitness);
        tradeMark = ITrademark(trademarkAddress);
        novaNFT = NovaNFT(novaNFTAddress);
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

    function check(
        address to,
        uint256 trademark1,
        uint256 trademark2,
        uint256 trademark3,
        uint256 trademark4
    ) public {
        require(balanceOf(to) == 0, "You already have a character");
        if (!Strings.equal(tradeMark.tradeMarksMapping(trademark1), "0")) {
            revert TrademarkMismatch("0", trademark1);
        }
        if (!Strings.equal(tradeMark.tradeMarksMapping(trademark2), "1")) {
            revert TrademarkMismatch("1", trademark1);
        }
        if (!Strings.equal(tradeMark.tradeMarksMapping(trademark3), "2")) {
            revert TrademarkMismatch("2", trademark1);
        }
        if (!Strings.equal(tradeMark.tradeMarksMapping(trademark4), "3")) {
            revert TrademarkMismatch("3", trademark1);
        }
    }

    function decode_address(
        address to,
        bytes calldata signature
    ) public pure returns (address) {
        address witnessAddress = ECDSA.recover(
            keccak256(abi.encodePacked(to, "NOVA-FINAL-SBT-1")),
            signature
        );

        return witnessAddress;
    }

    function safeMint(
        address to,
        uint256 original_nft_id,
        string memory type_of_character,
        uint256 trademark1,
        uint256 trademark2,
        uint256 trademark3,
        uint256 trademark4,
        bytes calldata signature
    ) public {
        check(to, trademark1, trademark2, trademark3, trademark4);

        address witnessAddress = ECDSA.recover(
            keccak256(abi.encodePacked(to, "NOVA-FINAL-SBT-1")),
            signature
        );
        _checkRole(WITNESS_ROLE, witnessAddress);
        novaNFT.burn(original_nft_id);

        tradeMark.burn(trademark1);
        tradeMark.burn(trademark2);
        tradeMark.burn(trademark3);
        tradeMark.burn(trademark4);

        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        charactersMapping[tokenId] = type_of_character;
    }

    function safeMint(
        uint256 original_nft_id,
        string memory type_of_character,
        uint256 trademark1,
        uint256 trademark2,
        uint256 trademark3,
        uint256 trademark4,
        bytes calldata signature
    ) external {
        safeMint(
            msg.sender,
            original_nft_id,
            type_of_character,
            trademark1,
            trademark2,
            trademark3,
            trademark4,
            signature
        );
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
        return "ipfs://QmTLVSrRdZBE61dH2sX2FfVkER3htFVreEZNUUHg3Wi2oS/";
    }

    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        require(tokenId < _nextTokenId, "Token not exists");
        return string.concat(_baseURI(), charactersMapping[tokenId]);
    }
}
