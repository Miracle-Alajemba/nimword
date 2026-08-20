// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title WordPotArena
/// @notice Holds room entry fees, keeps a treasury cut, and allows score-based reward claims.
/// @dev This is a simple hackathon-focused escrow contract for WordPot rounds on Celo.
contract WordPotArena {
    uint256 public constant BPS_DENOMINATOR = 10_000;

    address public owner;
    address public treasury;
    uint256 public treasuryFeeBps;
    uint256 public nextRoomId = 1;

    struct Room {
        uint256 entryFee;
        uint256 totalPot;
        uint256 rewardPool;
        uint256 treasuryAmount;
        uint256 totalScore;
        uint256 playerCount;
        bool settled;
        bool cancelled;
    }

    mapping(uint256 => Room) public rooms;
    mapping(uint256 => mapping(address => bool)) public joinedRoom;
    mapping(uint256 => mapping(address => uint256)) public playerScore;
    mapping(uint256 => mapping(address => bool)) public claimedReward;
    mapping(uint256 => mapping(address => bool)) public roomPlayerSettled;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event TreasuryUpdated(address indexed treasury);
    event TreasuryFeeUpdated(uint256 feeBps);
    event RoomCreated(uint256 indexed roomId, uint256 entryFee);
    event RoomJoined(uint256 indexed roomId, address indexed player, uint256 amount);
    event RoomSettled(
        uint256 indexed roomId,
        uint256 totalPot,
        uint256 treasuryAmount,
        uint256 rewardPool,
        uint256 totalScore
    );
    event RewardClaimed(uint256 indexed roomId, address indexed player, uint256 amount);
    event RoomCancelled(uint256 indexed roomId);
    event DailyRewardSent(address indexed player, uint256 amount);
    event Withdrawn(address indexed recipient, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "WordPot: owner only");
        _;
    }

    constructor(address treasury_, uint256 treasuryFeeBps_) {
        require(treasury_ != address(0), "WordPot: treasury required");
        require(treasuryFeeBps_ < BPS_DENOMINATOR, "WordPot: invalid fee");
        owner = msg.sender;
        treasury = treasury_;
        treasuryFeeBps = treasuryFeeBps_;
        emit OwnershipTransferred(address(0), msg.sender);
        emit TreasuryUpdated(treasury_);
        emit TreasuryFeeUpdated(treasuryFeeBps_);
    }

    receive() external payable {}

    function createRoom(uint256 entryFee) external onlyOwner returns (uint256 roomId) {
        require(entryFee > 0, "WordPot: entry fee required");
        roomId = nextRoomId++;
        rooms[roomId].entryFee = entryFee;
        emit RoomCreated(roomId, entryFee);
    }

    function joinRoom(uint256 roomId) external payable {
        Room storage room = rooms[roomId];
        require(room.entryFee > 0, "WordPot: room missing");
        require(!room.settled, "WordPot: room settled");
        require(!room.cancelled, "WordPot: room cancelled");
        require(!joinedRoom[roomId][msg.sender], "WordPot: already joined");
        require(msg.value == room.entryFee, "WordPot: wrong entry fee");

        joinedRoom[roomId][msg.sender] = true;
        room.playerCount += 1;
        room.totalPot += msg.value;

        emit RoomJoined(roomId, msg.sender, msg.value);
    }

    function settleRoom(
        uint256 roomId,
        address[] calldata players,
        uint256[] calldata scores
    ) external onlyOwner {
        Room storage room = rooms[roomId];
        require(room.entryFee > 0, "WordPot: room missing");
        require(!room.settled, "WordPot: already settled");
        require(!room.cancelled, "WordPot: room cancelled");
        require(players.length == scores.length, "WordPot: length mismatch");

        uint256 aggregateScore = 0;
        for (uint256 i = 0; i < players.length; i++) {
            address player = players[i];
            require(joinedRoom[roomId][player], "WordPot: player missing");
            require(!roomPlayerSettled[roomId][player], "WordPot: duplicate player");

            roomPlayerSettled[roomId][player] = true;
            playerScore[roomId][player] = scores[i];
            aggregateScore += scores[i];
        }

        room.totalScore = aggregateScore;
        if (aggregateScore > 0) {
            room.treasuryAmount = (room.totalPot * treasuryFeeBps) / BPS_DENOMINATOR;
        } else {
            room.treasuryAmount = 0;
        }
        room.rewardPool = room.totalPot - room.treasuryAmount;
        room.settled = true;

        if (room.treasuryAmount > 0) {
            (bool treasuryOk, ) = treasury.call{value: room.treasuryAmount}("");
            require(treasuryOk, "WordPot: treasury transfer failed");
        }

        emit RoomSettled(
            roomId,
            room.totalPot,
            room.treasuryAmount,
            room.rewardPool,
            room.totalScore
        );
    }

    function claimReward(uint256 roomId) external {
        Room storage room = rooms[roomId];
        require(room.settled, "WordPot: not settled");
        require(!room.cancelled, "WordPot: room cancelled");
        require(joinedRoom[roomId][msg.sender], "WordPot: player missing");
        require(!claimedReward[roomId][msg.sender], "WordPot: already claimed");

        claimedReward[roomId][msg.sender] = true;

        uint256 payout = _payoutFor(roomId, msg.sender);
        require(payout > 0, "WordPot: nothing to claim");

        (bool ok, ) = msg.sender.call{value: payout}("");
        require(ok, "WordPot: payout failed");

        emit RewardClaimed(roomId, msg.sender, payout);
    }

    function cancelRoom(uint256 roomId, address[] calldata players) external onlyOwner {
        Room storage room = rooms[roomId];
        require(room.entryFee > 0, "WordPot: room missing");
        require(!room.settled, "WordPot: already settled");
        require(!room.cancelled, "WordPot: already cancelled");

        room.cancelled = true;

        for (uint256 i = 0; i < players.length; i++) {
            address player = players[i];
            if (!joinedRoom[roomId][player]) continue;
            joinedRoom[roomId][player] = false;
            (bool ok, ) = player.call{value: room.entryFee}("");
            require(ok, "WordPot: transfer failed");
        }

        emit RoomCancelled(roomId);
    }

    function sendDailyReward(
        address payable player,
        uint256 amount
    ) external onlyOwner {
        require(player != address(0), "WordPot: invalid address");
        require(amount > 0, "WordPot: amount required");
        require(
            address(this).balance >= amount,
            "WordPot: insufficient balance for daily reward"
        );
        (bool ok, ) = player.call{value: amount}("");
        require(ok, "WordPot: daily reward transfer failed");
        emit DailyRewardSent(player, amount);
    }

    function withdrawTo(address payable recipient) external onlyOwner {
        require(recipient != address(0), "WordPot: invalid recipient");
        uint256 balance = address(this).balance;
        require(balance > 0, "WordPot: nothing to withdraw");
        (bool ok, ) = recipient.call{value: balance}("");
        require(ok, "WordPot: withdraw failed");
        emit Withdrawn(recipient, balance);
    }

    function payoutFor(uint256 roomId, address player) external view returns (uint256) {
        return _payoutFor(roomId, player);
    }

    function updateTreasury(address newTreasury) external onlyOwner {
        require(newTreasury != address(0), "WordPot: treasury required");
        treasury = newTreasury;
        emit TreasuryUpdated(newTreasury);
    }

    function updateTreasuryFee(uint256 newFeeBps) external onlyOwner {
        require(newFeeBps < BPS_DENOMINATOR, "WordPot: invalid fee");
        treasuryFeeBps = newFeeBps;
        emit TreasuryFeeUpdated(newFeeBps);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "WordPot: owner required");
        address previousOwner = owner;
        owner = newOwner;
        emit OwnershipTransferred(previousOwner, newOwner);
    }

    function _payoutFor(uint256 roomId, address player) internal view returns (uint256) {
        Room storage room = rooms[roomId];
        if (room.cancelled || !room.settled) return 0;

        if (room.totalScore == 0) {
            return joinedRoom[roomId][player] ? room.entryFee : 0;
        }

        uint256 score = playerScore[roomId][player];
        if (score == 0) return 0;

        return (room.rewardPool * score) / room.totalScore;
    }
}
