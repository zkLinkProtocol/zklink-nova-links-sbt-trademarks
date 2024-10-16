// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

interface ICuboMultiMint {
    event AdminSet(address newAdmin);
    event ChangeMintTime(uint256 startTime, uint256 endTime);
    event ChangeTransferTime(uint256 startTime, uint256 endTime);
    event BaseUriSet(string uri);
    event SenderAllowlistSet(address[] accounts, bool knob);
    event RecipientAllowlistSet(address[] accounts, bool knob);
    event AllowListRootSet(bytes32 merkleRoot);
    event MintTypeSet(MintType mintType);
    event UpdateSigner(address, bool);
    event IsCheckAllowlistSet(bool);

    event PaymentSet(address, address, uint256);
    event MaxSupplySet(uint256);
    event StageMintInfoSet(StageMintInfo stageMintInfo);
    event StageMintTimeSet(string stage, uint64 startTime, uint64 endTime);
    event StageMaxSupplySet(string stage, uint32 maxSupply);
    event StagePaymentSet(string stage, address payeeAddress, address paymentToken, uint256 price);
    event StageMintLimitationPerAddressSet(string stage, uint8 mintLimitationPerAddress);
    event StageEnableSigSet(string stage, bool enableSig);
    event AllowListSet(string stage, bytes32 merkleRoot);
    event TransferRestrictSet(bool isTransferRestricted, uint64 startTime, uint64 endTime);
    event MaxSupplySucessSet(uint32 maxSupply);
    event ReduceSourceStageMaxSupplyToTarget(string sourceStage, string targetStage, uint256 amount);

    error InvalidAdminOrOwner();
    error NotActive();
    error ExceedPerAddressLimit();
    error ExceedMaxSupply();
    error InvalidProof();
    error ExpiredSignature();
    error UsedSignature();
    error InactiveSigner();
    error IncorrectPayment();
    error IncorrectValue();
    error NotInAllowlist();
    error InvalidConfig();
    error InvalidMintType();
    error LimitedTransfer();
    error ExceedMaxSupplyForStage();
    error NonExistStage();
    error IncorrectERC20();
    error StageAlreadyExist();
    error StageActive();

    enum MintType {
        Public,
        Allowlist
    }

    /**
     * @notice The mint details for each stage
     *
     * @param enableSig                If needs server signature.
     * @param limitationForAddress     The mint amountlimitation for each address in a stage.
     * @param maxSupplyForStage        The max supply for a stage.
     * @param startTime                The start time of a stage.
     * @param endTime                  The end time of a stage.
     * @param price                    The mint price in a stage.
     * @param paymentToken             The mint paymentToken in a stage.
     * @param payeeAddress             The payeeAddress in a stage.
     * @param allowListMerkleRoot      The allowListMerkleRoot in a stage.
     * @param stage                    The tag of the stage.
     * @param mintType                 Mint type. e.g.Public,Allowlist,Signd
     */
    struct StageMintInfo {
        bool enableSig; //8bits
        uint8 limitationForAddress; //16bits
        uint32 maxSupplyForStage; //48bits
        uint64 startTime; //112bits
        uint64 endTime; //176bits
        uint256 price;
        address paymentToken;
        address payeeAddress;
        bytes32 allowListMerkleRoot;
        string stage;
        MintType mintType;
    }

    /**
     * @notice The global mint information.
     *
     * @param maxSupply        The max supply for total mint.
     * @param name             The name of 721.
     * @param symbol           The symbol of 721.
     * @param baseUri          The baseUri of 721.
     */
    struct GlobalInfo {
        bool isCheckAllowlist; //8bits
        bool isTransferRestricted; //16bits
        uint32 maxSupply; //48bits
        uint64 transferStartTime; //112bits
        uint64 transferEndTime; //176bits
        string name;
        string symbol;
        string baseUri;
    }

    /**
     * @notice The parameter of mint.
     *
     * @param amount     The amount of mint.
     * @param tokenId    Unused.
     * @param nonce      Random number.For server signature, only used in enableSig is true.
     * @param expiry     The expiry of server signature, only used in enableSig is true.
     * @param to         The to address of the mint.
     */
    struct MintParams {
        uint256 amount;
        uint256 tokenId;
        uint256 nonce;
        uint256 expiry;
        address to;
    }

    function setStageMintInfo(StageMintInfo calldata stageMintInfo) external;

    function setStageMintTime(string calldata stage, uint64 startTime, uint64 endTime) external;

    function setStageMaxSupply(string calldata stage, uint32 maxSupply) external;

    function setStagePayment(string calldata stage, address payeeAddress, address paymentToken, uint256 price) external;

    function setStageMintLimitationPerAddress(string calldata stage, uint8 mintLimitationPerAddress_) external;

    function setStageEnableSig(string calldata stage, bool enableSig) external;

    function setActiveSigner(address signer, bool status) external;

    function mint(
        string calldata stage,
        bytes calldata signature,
        bytes32[] calldata proof,
        MintParams calldata mintparams
    ) external payable;
}
