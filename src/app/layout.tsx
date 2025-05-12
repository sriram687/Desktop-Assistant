import type {Metadata} from 'next';
import { Inter } from 'next/font/google'; // Changed from Geist to Inter as per common practice for sans-serif
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  variable: '--font-inter-sans', // Updated variable name
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Gemini Desktop Assistant',
  description: 'AI Assistant powered by Google Gemini',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased bg-background text-foreground`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
