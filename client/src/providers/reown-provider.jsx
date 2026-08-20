import { createAppKit } from "@reown/appkit/react";
import { celo } from "@reown/appkit/networks";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { APP_URL, REOWN_PROJECT_ID } from "../config/app-config.js";

const metadata = {
  name: "WordPot",
  description: "MiniPay-first multiplayer word game on Celo",
  url: APP_URL,
  icons: [
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'%3E%3Crect width='120' height='120' rx='26' fill='%230b1220'/%3E%3Ctext x='50%25' y='56%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial,sans-serif' font-size='42' font-weight='700' fill='%23f8f9fa'%3EWP%3C/text%3E%3C/svg%3E",
  ],
};

const networks = [celo];
const queryClient = new QueryClient();

const wagmiAdapter = new WagmiAdapter({
  projectId: REOWN_PROJECT_ID,
  networks,
  ssr: false,
});

createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId: REOWN_PROJECT_ID,
  metadata,
  features: {
    analytics: false,
    email:false,
    socials: false,
    emailShowWallets: false,
    swaps: false,
    onramp: false,
    history: false,
  },
});
export function ReownProvider({ children }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
