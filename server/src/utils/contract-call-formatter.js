export function formatContractCallLogs(functionName, args = [], hash = "") {
  return `[Contract Call] ${functionName}(${args.join(", ")}) -> tx: ${hash}`;
}
