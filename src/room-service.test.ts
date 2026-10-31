import assert from "node:assert/strict";
import test from "node:test";
import { MatchRequest } from "./room-service.ts";

test("match input keeps a named room and identity before any remote call", () => {
  const parsed = MatchRequest.parse({
    roomName: "editor-session",
    identity: "maintainer-1",
    displayName: "Maintainer",
    region: "us-east"
  });
  assert.equal(parsed.roomName, "editor-session");
  assert.throws(() => MatchRequest.parse({ roomName: "", identity: "maintainer-1", displayName: "Maintainer", region: "us-east" }));
});
