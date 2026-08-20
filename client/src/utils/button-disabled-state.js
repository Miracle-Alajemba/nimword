export function getSubmitButtonText(busy = false, text = "") {
  if (busy) return "Processing...";
  if (!text) return "Select Word";
  return "Claim Word";
}
