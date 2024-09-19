import { Metadata } from 'next';
import ClientLayout from './client-layout';

export const metadata: Metadata = {
  title: 'Eclipse Bridge',
  description: 'Official Eclipse bridge.',
  icons: [
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '200x200',
      url: '../public/eclipse-favicon.png',
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
