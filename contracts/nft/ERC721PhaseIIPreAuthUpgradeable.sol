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

contract ERC721PhaseIIPreAuthUpgradeable is
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
    bytes32 public constant MINT_AUTH_TYPE_HASH =
        keccak256("MintAuth(address to,uint256 nonce,uint256 expiry,uint256 mintType)");

    bytes32 public constant COMPOSITE_AUTH_TYPE_HASH =
        keccak256(
            "CompositeAuth(address to,uint256 nonce,uint256[] tokenIds,uint256[] amounts,uint256 expiry,uint256 mintType)"
        );

    CountersUpgradeable.Counter public _tokenIdTracker;

    string private _baseTokenURI;

    mapping(bytes32 => bool) public signatures;

    mapping(uint256 => mapping(address => uint256)) public mintNoncesMap;

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
        uint256 mintType,
        bytes calldata signature
    ) external view returns (bool) {
        bytes32 mintAuthHash = keccak256(abi.encode(MINT_AUTH_TYPE_HASH, to, nonce, expiry, mintType));
        address witnessAddress = ECDSAUpgradeable.recover(_hashTypedDataV4(mintAuthHash), signature);
        return hasRole(WITNESS_ROLE, witnessAddress);
    }

    function isCompositeAuthorized(
        address to,
        uint256 nonce,
        uint256[] calldata tokenIds,
        uint256[] calldata amounts,
        uint256 expiry,
        uint256 mintType,
        bytes calldata signature
    ) public view returns (bool) {
        bytes32 tokenIdsHash = keccak256(abi.encodePacked(tokenIds));
        bytes32 amountsHash = keccak256(abi.encodePacked(amounts));
        bytes32 compositeAuthHash = keccak256(
            abi.encode(COMPOSITE_AUTH_TYPE_HASH, to, nonce, tokenIdsHash, amountsHash, expiry, mintType)
        );
        address witnessAddress = ECDSAUpgradeable.recover(_hashTypedDataV4(compositeAuthHash), signature);
        return hasRole(WITNESS_ROLE, witnessAddress);
    }

    function exists(uint256 tokenId) external view returns (bool) {
        return _exists(tokenId);
    }

    function _safeMint(address to, uint256 nonce, uint256 expiry, uint256 mintType, bytes calldata signature) internal {
        _checkMintAuthorization(to, nonce, expiry, mintType, signature);

        _safeMintNormal(to, mintType);
    }

    function _compositeMint(
        address to,
        uint256 nonce,
        uint256[] calldata tokenIds,
        uint256[] calldata amounts,
        uint256 expiry,
        uint256 mintType,
        bytes calldata signature
    ) internal {
        _checkCompositeAuthorization(to, nonce, tokenIds, amounts, expiry, mintType, signature);
        _safeMintNormal(to, mintType);
    }

    function _safeMintNormal(address to, uint256 mintType) internal {
        // We cannot just use balanceOf to create the new tokenId because tokens
        // can be burned (destroyed), so we need a separate counter.
        _safeMint(to, _tokenIdTracker.current());
        _tokenIdTracker.increment();
        mintNoncesMap[mintType][to] += 1;
    }

    function _checkMintAuthorization(
        address to,
        uint256 nonce,
        uint256 expiry,
        uint256 mintType,
        bytes calldata signature
    ) internal {
        require(block.timestamp <= expiry, "Signature has expired");
        bytes32 mintAuthHash = keccak256(abi.encode(MINT_AUTH_TYPE_HASH, to, nonce, expiry, mintType));
        require(!signatures[mintAuthHash], "Used Signature");

        address witnessAddress = ECDSAUpgradeable.recover(_hashTypedDataV4(mintAuthHash), signature);
        _checkRole(WITNESS_ROLE, witnessAddress);
        signatures[mintAuthHash] = true;
    }

    function _checkCompositeAuthorization(
        address to,
        uint256 nonce,
        uint256[] calldata tokenIds,
        uint256[] calldata amounts,
        uint256 expiry,
        uint256 mintType,
        bytes calldata signature
    ) internal {
        require(block.timestamp <= expiry, "Signature has expired");
        bytes32 tokenIdsHash = keccak256(abi.encodePacked(tokenIds));
        bytes32 amountsHash = keccak256(abi.encodePacked(amounts));
        bytes32 compositeAuthHash = keccak256(
            abi.encode(COMPOSITE_AUTH_TYPE_HASH, to, nonce, tokenIdsHash, amountsHash, expiry, mintType)
        );
        require(!signatures[compositeAuthHash], "Used Signature");

        address witnessAddress = ECDSAUpgradeable.recover(_hashTypedDataV4(compositeAuthHash), signature);
        _checkRole(WITNESS_ROLE, witnessAddress);
        signatures[compositeAuthHash] = true;
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

    function setDefaultRoyalty(address receiver, uint96 feeNumerator) public onlyOwner {
        super._setDefaultRoyalty(receiver, feeNumerator);
    }

    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
     */
    uint256[46] private __gap;
}
