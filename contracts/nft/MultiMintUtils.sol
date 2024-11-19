// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/Ownable2StepUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/StringsUpgradeable.sol";
import {EIP712Upgradeable} from "@openzeppelin/contracts-upgradeable/utils/cryptography/EIP712Upgradeable.sol";
import {ICuboMultiMint} from "../interfaces/ICuboMultiMint.sol";

abstract contract MultiMintUtils is
    ICuboMultiMint,
    UUPSUpgradeable,
    EIP712Upgradeable,
    ERC721Upgradeable,
    Ownable2StepUpgradeable
{
    bytes32 public constant MINT_AUTH_TYPE_HASH =
        keccak256("MintAuth(address to,uint256 tokenId,uint256 amount,uint256 nonce,uint256 expiry,string stage)");

    using StringsUpgradeable for uint256;

    /// @dev Record the max supply that has been set.
    uint256 _totalStageSupply;
    uint256 public totalSupply;

    address public admin;

    /// @dev Track the used signature digests.
    mapping(bytes32 => bool) public _usedDigest;

    /// @dev Limit the transfer address of contract.
    mapping(address => bool) public senderAllowlist;
    mapping(address => bool) public recipientAllowlist;

    /// @dev Stage to single stage mint information.
    mapping(string => StageMintInfo) public stageToMint;

    /// @dev Active server signers.
    mapping(address => bool) public activeSigner;

    /// @dev have minted for each stage.
    mapping(string => uint256) public stageToTotalSupply;

    GlobalInfo public globalInfo;

    modifier onlyAdminOrOwner() {
        if (msg.sender != admin && msg.sender != owner()) {
            revert InvalidAdminOrOwner();
        }
        _;
    }

    modifier stageExist(string calldata stage) {
        bytes memory nameBytes = bytes(stageToMint[stage].stage); // Convert string to bytes
        if (nameBytes.length == 0) {
            revert NonExistStage();
        }

        _;
    }

    /**
     * *  View   ************************************************
     */
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        _requireMinted(tokenId);
        return
            bytes(globalInfo.baseUri).length > 0
                ? string(abi.encodePacked(globalInfo.baseUri, tokenId.toString()))
                : "";
    }

    /**
     * *  Config   ************************************************
     */
    function setStageMintInfo(StageMintInfo calldata stageMintInfo) external onlyAdminOrOwner {
        string memory stage = stageMintInfo.stage;
        uint32 maxSupplyForStage = stageMintInfo.maxSupplyForStage;

        //new total stage supply that be configure
        uint256 updatedTotalStageSupply = _totalStageSupply + maxSupplyForStage - stageToMint[stage].maxSupplyForStage;

        //Must be greater than the quantity already mint in the stage
        //After new stage supply update, _totalStageSupply must less than global maxSupply
        if (
            (maxSupplyForStage > 0 && maxSupplyForStage < stageToTotalSupply[stage]) ||
            updatedTotalStageSupply > globalInfo.maxSupply
        ) {
            revert InvalidConfig();
        }

        _totalStageSupply = updatedTotalStageSupply;
        stageToMint[stageMintInfo.stage] = stageMintInfo;

        emit StageMintInfoSet(stageMintInfo);
    }

    function removeStage(string calldata stage) external onlyOwner stageExist(stage) {
        if (isStageActive(stage)) {
            revert StageActive();
        }

        _totalStageSupply -= stageToMint[stage].maxSupplyForStage;
        delete stageToMint[stage];
    }

    function setStagePayment(
        string calldata stage,
        address payeeAddress,
        address paymentToken,
        uint256 price
    ) external onlyAdminOrOwner stageExist(stage) {
        if (isStageActive(stage)) {
            revert InvalidConfig();
        }

        // if (payeeAddress == address(0) || price == 0) {
        //     revert InvalidConfig();
        // }

        stageToMint[stage].payeeAddress = payeeAddress;
        stageToMint[stage].paymentToken = paymentToken;
        stageToMint[stage].price = price;

        emit StagePaymentSet(stage, payeeAddress, paymentToken, price);
    }

    function setStageMintTime(
        string calldata stage,
        uint64 startTime,
        uint64 endTime
    ) external onlyAdminOrOwner stageExist(stage) {
        stageToMint[stage].startTime = startTime;
        stageToMint[stage].endTime = endTime;

        emit StageMintTimeSet(stage, startTime, endTime);
    }

    function setStageMaxSupply(string calldata stage, uint32 maxSupply) external onlyAdminOrOwner stageExist(stage) {
        //new total stage supply that be configure
        uint256 updatedTotalStageSupply = _totalStageSupply + maxSupply - stageToMint[stage].maxSupplyForStage;

        if (maxSupply < stageToTotalSupply[stage] || updatedTotalStageSupply > globalInfo.maxSupply) {
            revert InvalidConfig();
        }

        _totalStageSupply = updatedTotalStageSupply;
        stageToMint[stage].maxSupplyForStage = maxSupply;

        emit StageMaxSupplySet(stage, maxSupply);
    }

    function setStageMintLimitationPerAddress(
        string calldata stage,
        uint8 mintLimitationPerAddress
    ) external onlyAdminOrOwner stageExist(stage) {
        stageToMint[stage].limitationForAddress = mintLimitationPerAddress;

        emit StageMintLimitationPerAddressSet(stage, mintLimitationPerAddress);
    }

    function setStageEnableSig(string calldata stage, bool enableSig) external onlyAdminOrOwner stageExist(stage) {
        stageToMint[stage].enableSig = enableSig;

        emit StageEnableSigSet(stage, enableSig);
    }

    function setStageAllowListRoot(string calldata stage, bytes32 merkleRoot) external onlyOwner stageExist(stage) {
        stageToMint[stage].allowListMerkleRoot = merkleRoot;

        emit AllowListSet(stage, merkleRoot);
    }

    function setActiveSigner(address signer, bool status) external onlyAdminOrOwner {
        activeSigner[signer] = status;

        emit UpdateSigner(signer, status);
    }

    function setBaseUri(string calldata baseUri) external onlyAdminOrOwner {
        globalInfo.baseUri = baseUri;

        emit BaseUriSet(baseUri);
    }

    function setAdmin(address admin_) external onlyOwner {
        if (admin_ == address(0)) {
            revert InvalidConfig();
        }
        admin = admin_;

        emit AdminSet(admin);
    }

    function setMaxsupply(uint32 maxSupply) external onlyAdminOrOwner {
        if (maxSupply <= totalSupply) {
            revert InvalidConfig();
        }
        globalInfo.maxSupply = maxSupply;

        emit MaxSupplySucessSet(maxSupply);
    }

    function setTransferRestrict(
        bool isTransferRestricted_,
        uint64 startTime,
        uint64 endTime
    ) external onlyAdminOrOwner {
        if (startTime >= endTime) {
            revert InvalidConfig();
        }
        globalInfo.isTransferRestricted = isTransferRestricted_;
        globalInfo.transferStartTime = startTime;
        globalInfo.transferEndTime = endTime;

        emit TransferRestrictSet(isTransferRestricted_, startTime, endTime);
    }

    function setIsCheckAllowlist(bool isCheckAllowlist_) external onlyAdminOrOwner {
        globalInfo.isCheckAllowlist = isCheckAllowlist_;

        emit IsCheckAllowlistSet(isCheckAllowlist_);
    }

    function setSenderAllowlist(address[] calldata allowlist, bool knob) external onlyAdminOrOwner {
        uint256 len = allowlist.length;
        for (uint256 i = 0; i < len; i++) {
            // Already set the same value
            if (senderAllowlist[allowlist[i]] == knob) {
                continue;
            }
            senderAllowlist[allowlist[i]] = knob;
        }

        emit SenderAllowlistSet(allowlist, knob);
    }

    function setRecipientAllowlist(address[] calldata allowlist, bool knob) external onlyAdminOrOwner {
        uint256 len = allowlist.length;
        for (uint256 i = 0; i < len; i++) {
            // Already set the same value
            if (recipientAllowlist[allowlist[i]] == knob) {
                continue;
            }
            recipientAllowlist[allowlist[i]] = knob;
        }

        emit RecipientAllowlistSet(allowlist, knob);
    }

    function isStageActive(string calldata stage) public view returns (bool) {
        return
            uint256(stageToMint[stage].startTime) <= block.timestamp &&
            uint256(stageToMint[stage].endTime) >= block.timestamp;
    }

    function _cast(bool b) internal pure returns (uint256 u) {
        assembly {
            u := b
        }
    }
}
