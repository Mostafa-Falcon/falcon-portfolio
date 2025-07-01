import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./Provider";


const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Mostafa Falcon',
  description: "I'm Mostafa Falcon, a mobile app developer using Flutter and a full-stack web developer with Next.js & TailwindCSS. I build high-performance digital products with great UX. Let's turn your idea into a successful app or website.",
  openGraph: {
    title: 'Mostafa Falcon',
  description: "I'm Mostafa Falcon, a mobile app developer using Flutter and a full-stack web developer with Next.js & TailwindCSS. I build high-performance digital products with great UX. Let's turn your idea into a successful app or website.",
    url: 'https://mostafa-falcon.vercel.app/', // ضع دومين موقعك هنا
    siteName: 'Mostafa Falcon',
    images: [
      {
        url: '/thumbnail.png', // المسار النسبي للصورة
        width: 1200,
        height: 630,
        alt: 'Mostafa Falcon Portfolio',
      },
    ],
    type: 'website',
    locale: 'en_US',
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
