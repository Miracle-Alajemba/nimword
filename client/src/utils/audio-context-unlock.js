export function unlockAudioContext(ctx) {
  if (ctx && ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }
}
