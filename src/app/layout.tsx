import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/common/Header";
import Footer from "@/components/common/Footer";
// import { Navigation } from "@/components/common/Navigation";
import { getCryptoRates } from "@/lib/crypto"; // Import the data fetching function

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Crypto Analysis Platform - Professional Price Predictions",
  description: "Professional cryptocurrency price predictions using advanced technical analysis, market sentiment, and multi-factor algorithms. Get data-driven insights for Bitcoin, Ethereum, and 250+ cryptocurrencies.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const initialCryptoData = await getCryptoRates(); // Fetch data on the server

  return (
    <html lang="en">
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <Header initialData={initialCryptoData} /> {/* Pass data to the header */}
        {/* <Navigation /> */}
        <main className="container mx-auto p-4 flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
