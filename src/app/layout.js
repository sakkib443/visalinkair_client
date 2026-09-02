import "./globals.css";
import ClientProviders from "@/components/ClientProviders";

export const metadata = {
  title: {
    template: "%s | Visalink Air",
    default: "Visalink Air | Journey Beyond Borders",
  },
  description:
    "Visalink Air Consultancy & Migration - Your trusted partner for visa processing, flight booking, hotel reservation, Hajj & Umrah packages, and tour planning. Based in Dhaka, Bangladesh.",
  keywords: [
    "visa processing",
    "visa consultancy",
    "flight booking",
    "hotel reservation",
    "hajj umrah",
    "tour packages",
    "Bangladesh travel",
    "immigration",
    "tourist visa",
    "working visa",
    "Visalink Air",
  ],
  authors: [{ name: "Visalink Air Consultancy & Migration" }],
  creator: "Visalink Air",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Visalink Air",
  },
  twitter: {
    card: "summary_large_image",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google Fonts - Preconnect for speed */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Load Teko, Poppins, and Hind Siliguri from Google Fonts CDN */}
        <link
          href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@300;400;500;600;700&family=Poppins:wght@100;200;300;400;500;600;700;800;900&family=Teko:wght@300..700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen" suppressHydrationWarning>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}

