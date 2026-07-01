import type { Metadata } from "next";
import { Inter, Syne } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "@/styles/globals.css";
import CursorEffect from "@/components/layout/CursorEffect";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const syne = Syne({ subsets: ["latin"], variable: "--font-syne", weight: ["400","600","700","800"] });

export const metadata: Metadata = {
  title: "Academic Twin — AI-Powered Study Platform",
  description: "Upload your study materials and get a personalized AI academic assistant that answers questions, generates quizzes, creates flashcards, and tracks your progress.",
  keywords: ["AI", "education", "learning", "study", "quiz", "flashcards", "RAG"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.variable} ${syne.variable} font-sans antialiased`}>
          <CursorEffect />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
