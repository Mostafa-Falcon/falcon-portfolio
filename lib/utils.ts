import { clsx, type ClassValue } from "clsx"
import { Metadata } from "next"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}




export function constructMetadata({
  title = 'Mostafa Falcon',
  description = "I'm Mostafa Falcon, a mobile app developer using Flutter and a full-stack web developer with Next.js & TailwindCSS. I build high-performance digital products with great UX. Let's turn your idea into a successful app or website.",
  image = '/thumbnail.png',
  icons = '/favicon.ico',
}: {
  title?: string
  description?: string
  image?: string
  icons?: string
} = {}): Metadata {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: image }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
      creator: '@MostafaFalcon',
    },
    icons,
    metadataBase: new URL("https://mostafa-falcon.vercel.app/")
  }
}
