import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./Provider";


const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Mostafa Falcon',
  description: "I'm Mostafa Falcon, a mobile app developer using Flutter and a full-stack web developer with Next.js & TailwindCSS. I build high-performance digital products with great UX. Let's turn your idea into a successful app or website.",
  icons: {
    icon: '/myIcon.ico'
  },
  openGraph: {
    title: 'Mostafa Falcon',
    description: "I'm Mostafa Falcon, a mobile app developer using Flutter and a full-stack web developer with Next.js & TailwindCSS. I build high-performance digital products with great UX. Let's turn your idea into a successful app or website.",
    images: [
      {
        url: '/thumbnail.png',
        width: 1200,
        height: 630,
        alt: 'Mostafa Falcon - Mobile and Web Developer'
      }
    ],
    type: 'website',
    locale: 'en_US',
    siteName: 'Mostafa Falcon',
    url: 'https://mostafa-falcon.vercel.app/',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
