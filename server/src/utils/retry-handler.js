export async function retryWithBackoff(fn, retries = 3, delay = 500) {
  try {
    return await fn();
  } catch (err) {
    if (retries <= 1) throw err;
    await new Promise((r) => setTimeout(r, delay));
    return retryWithBackoff(fn, retries - 1, delay * 2);
  }
}
