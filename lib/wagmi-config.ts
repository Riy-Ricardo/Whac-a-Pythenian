import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { monad } from "viem/chains";
import { createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";

const raw = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID?.trim() ?? "";

/** Reown/WalletConnect rejects all-zero IDs (403). Treat empty or placeholder as "no WC". */
function isValidWalletConnectProjectId(id: string): boolean {
  if (!id) return false;
  const hex = id.replace(/^0x/i, "");
  if (/^0+$/.test(hex)) return false;
  if (id === "00000000000000000000000000000000") return false;
  return true;
}

const useWalletConnect = isValidWalletConnectProjectId(raw);

/**
 * With a real ID from https://cloud.reown.com — add `http://localhost:3000` under App → Allowed domains
 * or you will see "Origin not found on Allowlist".
 */
export const wagmiConfig = useWalletConnect
  ? getDefaultConfig({
      appName: "PYTHENIAN | Entropy Arena",
      appDescription: "Provably fair sync arena on Monad",
      chains: [monad],
      transports: {
        [monad.id]: http(),
      },
      projectId: raw,
      ssr: true,
    })
  : createConfig({
      chains: [monad],
      connectors: [injected()],
      transports: {
        [monad.id]: http(),
      },
      ssr: true,
    });

export const walletConnectEnabled = useWalletConnect;
