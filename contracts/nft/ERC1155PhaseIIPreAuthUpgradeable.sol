// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {PausableUpgradeable} from "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import {AccessControlEnumerableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/AccessControlEnumerableUpgradeable.sol";
import {ERC1155Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import {ERC1155BurnableUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/ERC1155BurnableUpgradeable.sol";
import {ERC1155SupplyUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/ERC1155SupplyUpgradeable.sol";
import {ERC1155URIStorageUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/ERC1155URIStorageUpgradeable.sol";
import {ECDSAUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/cryptography/ECDSAUpgradeable.sol";
import {EIP712Upgradeable} from "@openzeppelin/contracts-upgradeable/utils/cryptography/EIP712Upgradeable.sol";

contract ERC1155PhaseIIPreAuthUpgradeable is
    Initializable,
    OwnableUpgradeable,
    ReentrancyGuardUpgradeable,
    PausableUpgradeable,
    AccessControlEnumerableUpgradeable,
    ERC1155BurnableUpgradeable,
    ERC1155SupplyUpgradeable,
    ERC1155URIStorageUpgradeable,
    EIP712Upgradeable
{
    bytes32 public constant WITNESS_ROLE = keccak256("WITNESS_ROLE");

    bytes32 public constant MINT_AUTH_TYPE_HASH =
        keccak256("MintAuth(address to,uint256 nonce,uint256 tokenId,uint256 amount,uint256 expiry,uint256 mintType)");

    bytes32 public constant BATCH_MINT_AUTH_TYPE_HASH =
        keccak256(
            "BatchMintAuth(address to,uint256 nonce,uint256[] tokenIds,uint256[] amounts,uint256 expiry,uint256 mintType)"
        );

    mapping(bytes32 => bool) public signatures;

    // mintType => address => nonce
    mapping(uint256 => mapping(address => uint256)) public mintNoncesMap;

    function __ERC1155PreAuth_init(
        string memory name,
        string memory baseTokenURI,
        address defaultWitness
    ) internal onlyInitializing {
        __ERC1155PreAuth_init_unchained(name, baseTokenURI, defaultWitness);
    }

    function __ERC1155PreAuth_init_unchained(
        string memory name,
        string memory baseTokenURI,
        address defaultWitness
    ) internal onlyInitializing {
        __Context_init_unchained();
        __Ownable_init_unchained();
        __ReentrancyGuard_init_unchained();
        __Pausable_init_unchained();
        __AccessControlEnumerable_init_unchained();
        __ERC1155_init_unchained(baseTokenURI);
        __ERC1155Burnable_init_unchained();
        __ERC1155Supply_init_unchained();
        __ERC1155URIStorage_init_unchained();
        __EIP712_init_unchained(name, "0");

        _setBaseURI(baseTokenURI);

        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _setupRole(WITNESS_ROLE, defaultWitness);
    }

    function isMintAuthorized(
        address to,
        uint256 nonce,
        uint256 tokenId,
        uint256 amount,
        uint256 expiry,
        uint256 mintType,
        bytes calldata signature
    ) external view returns (bool) {
        bytes32 mintAuthHash = keccak256(abi.encode(MINT_AUTH_TYPE_HASH, to, nonce, tokenId, amount, expiry, mintType));
        address witnessAddress = ECDSAUpgradeable.recover(_hashTypedDataV4(mintAuthHash), signature);
        return hasRole(WITNESS_ROLE, witnessAddress);
    }

    function isBatchMintAuthorized(
        address to,
        uint256 nonce,
        uint256[] memory tokenIds,
        uint256[] memory amounts,
        uint256 expiry,
        uint256 mintType,
        bytes calldata signature
    ) external view returns (bool) {
        bytes32 tokenIdsHash = keccak256(abi.encodePacked(tokenIds));
        bytes32 amountsHash = keccak256(abi.encodePacked(amounts));
        bytes32 mintAuthHash = keccak256(
            abi.encode(BATCH_MINT_AUTH_TYPE_HASH, to, nonce, tokenIdsHash, amountsHash, expiry, mintType)
        );
        address witnessAddress = ECDSAUpgradeable.recover(_hashTypedDataV4(mintAuthHash), signature);
        return hasRole(WITNESS_ROLE, witnessAddress);
    }

    function _safeMint(
        address to,
        uint256 nonce,
        uint256 tokenId,
        uint256 amount,
        uint256 expiry,
        uint256 mintType,
        bytes calldata signature
    ) internal {
        _checkMintAuthorization(to, nonce, tokenId, amount, expiry, mintType, signature);

        _mint(to, tokenId, amount, "");
        mintNoncesMap[mintType][to] += 1;
    }

    function _safeBatchMint(
        address to,
        uint256 nonce,
        uint256[] memory tokenIds,
        uint256[] memory amounts,
        uint256 expiry,
        uint256 mintType,
        bytes calldata signature
    ) internal {
        _checkBatchMintAuthorization(to, nonce, tokenIds, amounts, expiry, mintType, signature);

        _mintBatch(to, tokenIds, amounts, "");
        mintNoncesMap[mintType][to] += 1;
    }

    function _checkMintAuthorization(
        address to,
        uint256 nonce,
        uint256 tokenId,
        uint256 amount,
        uint256 expiry,
        uint256 mintType,
        bytes calldata signature
    ) internal {
        require(block.timestamp <= expiry, "Signature has expired");
        bytes32 mintAuthHash = keccak256(abi.encode(MINT_AUTH_TYPE_HASH, to, nonce, tokenId, amount, expiry, mintType));
        require(!signatures[mintAuthHash], "Used Signature");

        address witnessAddress = ECDSAUpgradeable.recover(_hashTypedDataV4(mintAuthHash), signature);
        _checkRole(WITNESS_ROLE, witnessAddress);
        signatures[mintAuthHash] = true;
    }

    function _checkBatchMintAuthorization(
        address to,
        uint256 nonce,
        uint256[] memory tokenIds,
        uint256[] memory amounts,
        uint256 expiry,
        uint256 mintType,
        bytes calldata signature
    ) internal {
        require(block.timestamp <= expiry, "Signature has expired");
        bytes32 tokenIdsHash = keccak256(abi.encodePacked(tokenIds));
        bytes32 amountsHash = keccak256(abi.encodePacked(amounts));
        bytes32 mintAuthHash = keccak256(
            abi.encode(BATCH_MINT_AUTH_TYPE_HASH, to, nonce, tokenIdsHash, amountsHash, expiry, mintType)
        );
        require(!signatures[mintAuthHash], "Used Signature");

        address witnessAddress = ECDSAUpgradeable.recover(_hashTypedDataV4(mintAuthHash), signature);
        _checkRole(WITNESS_ROLE, witnessAddress);
        signatures[mintAuthHash] = true;
    }

    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal virtual override(ERC1155Upgradeable, ERC1155SupplyUpgradeable) {
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(ERC1155Upgradeable, AccessControlEnumerableUpgradeable) returns (bool) {
        return
            ERC1155Upgradeable.supportsInterface(interfaceId) ||
            AccessControlEnumerableUpgradeable.supportsInterface(interfaceId);
    }

    function uri(
        uint256 tokenId
    ) public view virtual override(ERC1155URIStorageUpgradeable, ERC1155Upgradeable) returns (string memory) {
        return super.uri(tokenId);
    }

    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
     */
    uint256[48] private __gap;
}
