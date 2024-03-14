// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
// import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721BurnableUpgradeable.sol";
// import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";
import "@openzeppelin/contracts/access/AccessControlDefaultAdminRules.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlDefaultAdminRulesUpgradeable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "../CheckableUpgradeable.sol";

contract NovaNFT is
    ERC721BurnableUpgradeable,
    ERC721EnumerableUpgradeable,
    AccessControlDefaultAdminRulesUpgradeable,
    CheckableUpgradeable
{
    uint256 private _nextTokenId;

    mapping(uint256 => string) public charactersMapping;

    function initialize(address defaultWitness) public initializer {
        __ERC721_init("NovaSBT", "NOVA-SBT");
        __AccessControlDefaultAdminRules_init(1, msg.sender);
        _setupRole(WITNESS_ROLE, defaultWitness);
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(
            ERC721Upgradeable,
            ERC721EnumerableUpgradeable,
            // AccessControlDefaultAdminRules,
            AccessControlDefaultAdminRulesUpgradeable
        )
        returns (bool)
    {
        return
            ERC721Upgradeable.supportsInterface(interfaceId) ||
            AccessControlDefaultAdminRulesUpgradeable.supportsInterface(
                interfaceId
            ) ||
            ERC721EnumerableUpgradeable.supportsInterface(interfaceId);
    }

    function safeMint(
        address to,
        string memory type_of_character,
        bytes calldata signature,
        string memory nonce,
        uint256 expiry
    ) public {
        check(to, signature, nonce, expiry, "NOVA-SBT-1-");
        require(balanceOf(to) == 0, "You already have a character");

        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        charactersMapping[tokenId] = type_of_character;
    }

    function safeMint(
        string memory type_of_character,
        bytes calldata signature,
        string memory nonce,
        uint256 expiry
    ) external {
        safeMint(msg.sender, type_of_character, signature, nonce, expiry);
    }

    // Soul Bound Token
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 firstTokenId,
        uint256 batchSize
    ) internal override(ERC721Upgradeable, ERC721EnumerableUpgradeable) {
        require(
            from == address(0) || to == address(0),
            "Token not transferable"
        );
        ERC721EnumerableUpgradeable._beforeTokenTransfer(
            from,
            to,
            firstTokenId,
            batchSize
        );
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
