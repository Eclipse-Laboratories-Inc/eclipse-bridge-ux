import { Metadata } from 'next';
import ClientLayout from './client-layout';

export const metadata: Metadata = {
  title: process.env.WEBSITE_TITLE,
  description: process.env.WEBSITE_DESCRIPTION,
  icons: [
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '200x200',
      url: process.env.NEXT_PUBLIC_CURRENT_CHAIN === 'mainnet' ? '/eclipse-favicon.png'  : '/testnet-favicon.png',
    }
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientLayout>{children}</ClientLayout>;
}
