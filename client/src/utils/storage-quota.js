export async function getStorageQuotaInfo() {
  if (typeof navigator !== "undefined" && navigator.storage?.estimate) {
    return await navigator.storage.estimate();
  }
  return { quota: 0, usage: 0 };
}
