import { Analytics } from '@vercel/analytics/next';
import localFont from "next/font/local";
import "./globals.css";



const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "Regex Generator Builder | Create, Test & Validate Custom Regex Patterns",
  description: `Explore our powerful Regex Generator tool to create, test, and validate custom regular expressions in real time. Whether you're matching email addresses, URLs, phone numbers, or building complex search patterns, our intuitive builder helps developers and non-developers alike craft precise regex with detailed explanations and instant feedback.`,
  keywords: [
    "regex",
    "regex builder",
    "regular expressions",
    "regex generator",
    "pattern matcher",
    "regex tester",
    "JavaScript regex",
    "validation",
    "Next.js"
  ],
  authors: [{ name: "Amin", url: "https://regex-gen-eight.vercel.app/builder" }],
  openGraph: {
    title: "Regex Generator Builder | Create, Test & Validate Custom Regex Patterns",
    description:
      "Build, preview, and share advanced regex patterns using our dynamic and user-friendly regex generator. Understand regex syntax, avoid common mistakes, and streamline your text validation tasks with ease.",
    url: "https://regex-gen-eight.vercel.app/builder",
    siteName: "Regex Builder",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Regex Generator Builder | Create, Test & Validate Custom Regex Patterns",
    description:
      "Build and test regular expressions with ease. Regex Builder helps you understand, validate, and debug patterns in real time with a clean UI and live feedback.",
    creator: "@Amin",
  },
};


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
