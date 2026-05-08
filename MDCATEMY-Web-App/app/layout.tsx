import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

export const metadata: Metadata = {
  title: "MDCATEMY | Train Like a Warrior. Score Like a Legend.",
  description:
    "Join the Study Tribe — Pakistan's most intensive MDCAT preparation system. Veteran coaching, personalized plans, and the accountability system built to get you into a medical college.",
  keywords: ["MDCAT", "MDCAT preparation", "Study Tribe", "MDCATEMY", "medical college Pakistan"],
  openGraph: {
    title: "MDCATEMY | MDCAT is a War. Prepare Like a Warrior.",
    description:
      "Join the Study Tribe — the only MDCAT prep system that pairs you with a Veteran coach, a family of 5, and a daily accountability system.",
    type: "website",
  },
};

// Runs before React hydrates so we don't flash the wrong theme.
const themeInitScript = `
(function() {
  try {
    var stored = localStorage.getItem('theme');
    var theme = stored === 'light' || stored === 'dark'
      ? stored
      : (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    document.documentElement.classList.add(theme);
  } catch (e) {
    document.documentElement.classList.add('dark');
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-warrior-black text-white font-inter antialiased overflow-x-hidden">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
