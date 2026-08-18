const test = require("node:test");
const assert = require("node:assert/strict");

test("export download targets include pack and unique apps", async () => {
  const { exportDownloadTargets, uniqueAppIds } = await import(
    "../utils/exportDownloadTargets.js"
  );

  assert.deepEqual(
    uniqueAppIds([
      { _id: "Mozilla.Firefox" },
      { _id: "VideoLAN.VLC" },
      { _id: "Mozilla.Firefox" },
      {},
      null,
    ]),
    ["Mozilla.Firefox", "VideoLAN.VLC"]
  );

  assert.deepEqual(
    exportDownloadTargets({
      packId: "pack_1",
      apps: [{ _id: "Mozilla.Firefox" }, { _id: "VideoLAN.VLC" }],
    }),
    { packId: "pack_1", appIds: ["Mozilla.Firefox", "VideoLAN.VLC"] }
  );

  assert.deepEqual(
    exportDownloadTargets({
      apps: [{ _id: "Microsoft.VisualStudioCode" }],
    }),
    { packId: null, appIds: ["Microsoft.VisualStudioCode"] }
  );
});
