export function getContractFunctionGasLimit(fnName = "") {
  const limits = { createRoom: 150000, joinRoom: 100000, settleRoom: 250000, sendDailyReward: 90000 };
  return limits[fnName] || 120000;
}
