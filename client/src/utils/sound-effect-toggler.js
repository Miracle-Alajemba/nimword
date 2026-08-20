export function isSoundEffectEnabled(settings = {}) {
  return settings.soundEffects !== false && settings.muted !== true;
}
