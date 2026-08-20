import { SOUND_EVENTS } from "./sound-effects-config.js";
describe("Sound Effects Config", () => {
  test("exports sound event constants", () => {
    expect(SOUND_EVENTS.TILE_CLICK).toBe("click");
  });
});
