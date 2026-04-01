// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.20;

/// Deploy (Foundry): configure `foundry.toml` remappings, then from repo root:
/// `forge build`
/// `forge create contracts/src/EntropyArenaConsumer.sol:EntropyArenaConsumer --rpc-url $MONAD_RPC --private-key $PK --broadcast --constructor-args $PYTH_ENTROPY_ADDRESS 200000`
/// Use the Entropy contract address for your network from https://docs.pyth.network/entropy/chainlist

import {IEntropyConsumer} from "@pythnetwork/entropy-sdk-solidity/IEntropyConsumer.sol";
import {IEntropyV2} from "@pythnetwork/entropy-sdk-solidity/IEntropyV2.sol";

/// @title EntropyArenaConsumer
/// @notice One `buySessionEntropy` payment → one Pyth Entropy V2 callback → `sessionSeed[player]` stored on-chain.
/// @dev Derive every in-game spawn off-chain with keccak256(abi.encodePacked(seed, roundIndex)) (see `lib/derive-spawn.ts`).
contract EntropyArenaConsumer is IEntropyConsumer {
    IEntropyV2 public immutable ENTROPY;
    /// @notice Gas passed to `requestV2` for `entropyCallback` — raise if callback reverts on-chain.
    uint32 public immutable CALLBACK_GAS;

    mapping(uint64 => address) public sequenceToPlayer;
    mapping(address => bytes32) public sessionSeed;
    mapping(address => bool) public sessionPending;

    event SessionRequested(address indexed player, uint64 sequence);
    event SessionReady(address indexed player, bytes32 seed);

    error InsufficientFee();
    error PendingSession();

    constructor(address entropyAddr, uint32 callbackGas) {
        ENTROPY = IEntropyV2(entropyAddr);
        CALLBACK_GAS = callbackGas == 0 ? 200_000 : callbackGas;
    }

    function getEntropy() internal view override returns (address) {
        return address(ENTROPY);
    }

    /// @notice Current Pyth fee in native token (MON on Monad) for one session.
    function quoteSessionFee() external view returns (uint128) {
        return ENTROPY.getFeeV2(CALLBACK_GAS);
    }

    /// @notice Pay once per session; after reveal delay (~2 blocks) `sessionSeed[msg.sender]` is set.
    function buySessionEntropy() external payable {
        if (sessionPending[msg.sender]) revert PendingSession();
        uint128 fee = ENTROPY.getFeeV2(CALLBACK_GAS);
        if (msg.value < fee) revert InsufficientFee();

        delete sessionSeed[msg.sender];

        uint64 seq = ENTROPY.requestV2{value: fee}(CALLBACK_GAS);
        sequenceToPlayer[seq] = msg.sender;
        sessionPending[msg.sender] = true;

        uint256 refund = msg.value - uint256(fee);
        if (refund > 0) {
            (bool okRefund,) = payable(msg.sender).call{value: refund}("");
            if (!okRefund) {
                // excess stays in contract; avoids reverting after entropy request
            }
        }

        emit SessionRequested(msg.sender, seq);
    }

    function entropyCallback(
        uint64 sequence,
        address /* provider */,
        bytes32 randomNumber
    ) internal override {
        address player = sequenceToPlayer[sequence];
        if (player == address(0)) {
            return;
        }
        delete sequenceToPlayer[sequence];
        sessionSeed[player] = randomNumber;
        sessionPending[player] = false;
        emit SessionReady(player, randomNumber);
    }

    /// @notice Clear local seed so a new session can be purchased (optional UX).
    function clearMySeed() external {
        delete sessionSeed[msg.sender];
    }
}
