/** PFP targets — shown randomly per spawn (entropy-derived or arcade fallback). */
export const MOLE_IMAGES = [
  "/derrpa.jpg",
  "/noname.jpg",
  "/ploncky.jpg",
  "/borys.jpg",
  "/ricardo.png",
] as const;

export type MoleImage = (typeof MOLE_IMAGES)[number];

export function pickRandomMoleSrc(): string {
  const u = new Uint8Array(1);
  crypto.getRandomValues(u);
  return MOLE_IMAGES[u[0] % MOLE_IMAGES.length];
}
