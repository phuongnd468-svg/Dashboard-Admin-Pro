import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Ant Design Next Starter',
  description: 'Next.js 16 starter with Ant Design 6 and English/Vietnamese support',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
