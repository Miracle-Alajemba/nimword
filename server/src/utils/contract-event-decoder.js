export function isSupportedContractEvent(eventName = "") {
  return ["RoomCreated", "RoomJoined", "RoomSettled", "RewardClaimed", "DailyRewardSent"].includes(eventName);
}
