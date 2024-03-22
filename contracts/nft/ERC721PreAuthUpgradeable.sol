// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import {AccessControlEnumerableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/AccessControlEnumerableUpgradeable.sol";
import {ERC721Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import {ERC721BurnableUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721BurnableUpgradeable.sol";
import {ERC721EnumerableUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";
import {ERC721RoyaltyUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721RoyaltyUpgradeable.sol";
import {ECDSAUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/cryptography/ECDSAUpgradeable.sol";
import {CountersUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import {EIP712Upgradeable} from "@openzeppelin/contracts-upgradeable/utils/cryptography/EIP712Upgradeable.sol";

contract ERC721PreAuthUpgradeable is
    Initializable,
    OwnableUpgradeable,
    ReentrancyGuardUpgradeable,
    PausableUpgradeable,
    AccessControlEnumerableUpgradeable,
    ERC721EnumerableUpgradeable,
    ERC721BurnableUpgradeable,
    ERC721RoyaltyUpgradeable,
    EIP712Upgradeable
{
    using CountersUpgradeable for CountersUpgradeable.Counter;

    bytes32 public constant WITNESS_ROLE = keccak256("WITNESS_ROLE");
    bytes32 public constant MINT_AUTH_TYPE_HASH = keccak256("MintAuth(address to,uint256 nonce,uint256 expiry)");

    CountersUpgradeable.Counter private _tokenIdTracker;

    string private _baseTokenURI;

    mapping(bytes32 => bool) public signatures;

    function __ERC721PreAuth_init(
        string memory name,
        string memory symbol,
        string memory baseTokenURI,
        address defaultWitness
    ) internal onlyInitializing {
        __ERC721PreAuth_init_unchained(name, symbol, baseTokenURI, defaultWitness);
    }

    function __ERC721PreAuth_init_unchained(
        string memory name,
        string memory symbol,
        string memory baseTokenURI,
        address defaultWitness
    ) internal onlyInitializing {
        __Context_init_unchained();
        __Ownable_init_unchained();
        __ReentrancyGuard_init_unchained();
        __Pausable_init_unchained();
        __AccessControlEnumerable_init_unchained();
        __ERC721_init_unchained(name, symbol);
        __ERC721Enumerable_init_unchained();
        __ERC721Burnable_init_unchained();
        __ERC721Royalty_init_unchained();
        __EIP712_init_unchained(name, "0");

        _baseTokenURI = baseTokenURI;

        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _setupRole(WITNESS_ROLE, defaultWitness);
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    }

    function isMintAuthorized(
        address to,
        uint256 nonce,
        uint256 expiry,
        bytes calldata signature
    ) external view returns (bool) {
        bytes32 mintAuthHash = keccak256(abi.encode(MINT_AUTH_TYPE_HASH, to, nonce, expiry));
        address witnessAddress = ECDSAUpgradeable.recover(_hashTypedDataV4(mintAuthHash), signature);
        return hasRole(WITNESS_ROLE, witnessAddress);
    }

    function _safeMint(address to, uint256 nonce, uint256 expiry, bytes calldata signature) internal {
        _checkMintAuthorization(to, nonce, expiry, signature);

        // We cannot just use balanceOf to create the new tokenId because tokens
        // can be burned (destroyed), so we need a separate counter.
        _safeMint(to, _tokenIdTracker.current());
        _tokenIdTracker.increment();
    }

    function _checkMintAuthorization(address to, uint256 nonce, uint256 expiry, bytes calldata signature) internal {
        require(block.timestamp <= expiry, "Signature has expired");
        bytes32 mintAuthHash = keccak256(abi.encode(MINT_AUTH_TYPE_HASH, to, nonce, expiry));
        require(!signatures[mintAuthHash], "Used Signature");

        address witnessAddress = ECDSAUpgradeable.recover(_hashTypedDataV4(mintAuthHash), signature);
        _checkRole(WITNESS_ROLE, witnessAddress);
        signatures[mintAuthHash] = true;
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 firstTokenId,
        uint256 batchSize
    ) internal virtual override(ERC721Upgradeable, ERC721EnumerableUpgradeable) {
        super._beforeTokenTransfer(from, to, firstTokenId, batchSize);
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(
            ERC721Upgradeable,
            AccessControlEnumerableUpgradeable,
            ERC721EnumerableUpgradeable,
            ERC721RoyaltyUpgradeable
        )
        returns (bool)
    {
        return
            ERC721Upgradeable.supportsInterface(interfaceId) ||
            AccessControlEnumerableUpgradeable.supportsInterface(interfaceId) ||
            ERC721EnumerableUpgradeable.supportsInterface(interfaceId) ||
            ERC721RoyaltyUpgradeable.supportsInterface(interfaceId);
    }

    function _burn(uint256 tokenId) internal virtual override(ERC721Upgradeable, ERC721RoyaltyUpgradeable) {
        super._burn(tokenId);
    }

    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
     */
    uint256[47] private __gap;
}
