// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "@/styles/globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Academic Twin — Your AI Learning Companion",
  description:
    "Upload your study materials and get a personalized AI academic assistant that answers questions, generates quizzes, creates flashcards, and tracks your progress.",
  keywords: ["AI", "education", "learning", "study", "quiz", "flashcards", "RAG"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.variable} font-sans antialiased`}>{children}</body>
      </html>
    </ClerkProvider>
  );
}
