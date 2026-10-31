import { z } from "zod";
import { InfraiClient, infrai } from "./infrai-client.ts";

export const MatchRequest = z.object({
  roomName: z.string().min(1),
  identity: z.string().min(1),
  displayName: z.string().min(1),
  region: z.string().min(1)
});
export type MatchRequest = z.infer<typeof MatchRequest>;

export async function createDeveloperRoom(input: unknown, client: InfraiClient) {
  const request = MatchRequest.parse(input);
  const room = await client.request<{ room: string }>(infrai.rtc.room.create, "POST", {
    name: request.roomName,
    max_participants: 8,
    empty_timeout_s: 300,
    region: request.region
  });
  const token = await client.request<{ token: string }>(infrai.rtc.token.issue, "POST", {
    room: room.room,
    identity: request.identity,
    display_name: request.displayName,
    ttl_s: 900,
    can_publish: true,
    can_subscribe: true
  });
  await client.request(infrai.realtime.publish, "POST", {
    channel: `room:${room.room}`,
    event: "room.created",
    data: { room: room.room, identity: request.identity },
    account_id: request.identity
  });
  return { room: room.room, clientToken: token.token, state: "matched" as const };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const key = process.env.INFRAI_API_KEY;
  if (!key) throw new Error("INFRAI_API_KEY is required");
  const result = await createDeveloperRoom({
    roomName: "editor-session",
    identity: "maintainer-1",
    displayName: "Maintainer",
    region: "us-east"
  }, new InfraiClient(key));
  console.log(JSON.stringify(result, null, 2));
}
