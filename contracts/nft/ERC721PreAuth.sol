// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Context.sol";

contract ERC721PreAuth is
    Context,
    AccessControlEnumerable,
    ERC721Enumerable,
    ERC721Burnable
{
    using Counters for Counters.Counter;

    bytes32 public constant WITNESS_ROLE = keccak256("WITNESS_ROLE");

    Counters.Counter private _tokenIdTracker;

    string private _baseTokenURI;

    mapping(bytes32 => bool) public signatures;

    constructor(
        string memory name,
        string memory symbol,
        string memory baseTokenURI,
        address defaultWitness
    ) ERC721(name, symbol)
    {
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
    ) internal {
        bytes32 hash = keccak256(abi.encodePacked(to, nonce, expiry));
        address witnessAddress = ECDSA.recover(hash, signature);
        return hasRole(WITNESS_ROLE, witnessAddress);
    }

    function safeMint(
        address to,
        uint256 nonce,
        uint256 expiry,
        bytes calldata signature
    ) public {
        _checkMintAuthorization(to, nonce, expiry, signature);

        // We cannot just use balanceOf to create the new tokenId because tokens
        // can be burned (destroyed), so we need a separate counter.
        _safeMint(to, _tokenIdTracker.current());
        _tokenIdTracker.increment();
    }

    function safeMint(
        uint256 nonce,
        uint256 expiry,
        bytes calldata signature
    ) external {
        safeMint(msg.sender, nonce, expiry, signature);
    }

    function _checkMintAuthorization(
        address to,
        uint256 nonce,
        uint256 expiry,
        bytes calldata signature
    ) internal {
        require(block.timestamp <= expiry, "Signature has expired");
        bytes32 hash = keccak256(abi.encodePacked(to, nonce, expiry));
        require(!signatures[hash], "Used Signature");

        address witnessAddress = ECDSA.recover(hash, signature);
        _checkRole(WITNESS_ROLE, witnessAddress);
        signatures[hash] = true;
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 firstTokenId,
        uint256 batchSize
    ) internal virtual override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, firstTokenId, batchSize);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(AccessControlEnumerable, ERC721, ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
