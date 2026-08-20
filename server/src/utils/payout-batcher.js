export function batchPayouts(payouts = [], maxBatchSize = 10) {
  const batches = [];
  for (let i = 0; i < payouts.length; i += maxBatchSize) {
    batches.push(payouts.slice(i, i + maxBatchSize));
  }
  return batches;
}
