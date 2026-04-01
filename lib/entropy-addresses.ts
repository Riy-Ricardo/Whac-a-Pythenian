/**
 * Deployed EntropyArenaConsumer — set in `.env.local` after deployment.
 */
export function getConsumerAddress(): `0x${string}` | undefined {
  const raw = process.env.NEXT_PUBLIC_ARENA_CONSUMER_ADDRESS;
  if (!raw || raw === "0x" || !raw.startsWith("0x")) return undefined;
  return raw as `0x${string}`;
}
