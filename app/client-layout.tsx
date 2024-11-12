"use client";
import "./globals.css";
import "@reservoir0x/relay-kit-ui/styles.css";
import { Providers } from "@/app/providers/providers";
import { usePathname } from "next/navigation";
import { IBM_Plex_Sans } from "next/font/google";
import { WagmiProvider } from "@/app/providers/wagmiProvider";
import { DynamicProvider } from "@/app/providers/DynamicProvider";
import { WalletFilterProvider } from "@/app/providers/WalletFilterProvider";
import { GasProviders } from "@/app/providers/GasProviders";

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const passGlobalLayout = pathname === "/gas-station";
  if (passGlobalLayout) {
    return (
      <WagmiProvider>
        {() => {
          return (
            <GasProviders>
              <body className={ibmPlexSans.className}>{children}</body>
            </GasProviders>
          );
        }}
      </WagmiProvider>
    );
  }

  return (
    <html lang="en" className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <WalletFilterProvider>
        <WagmiProvider>
          {({ chains }) => {
            return (
              <DynamicProvider chains={chains}>
                <body className={ibmPlexSans.className}>
                  <Providers chains={chains}>{children}</Providers>
                </body>
              </DynamicProvider>
            );
          }}
        </WagmiProvider>
      </WalletFilterProvider>
    </html>
  );
}
