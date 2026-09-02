import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0b1120" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1120" },
  ],
  viewportFit: "cover",
  colorScheme: "dark",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://deallyhub.com"),
  title: {
    default: "Deallyhub – Marketplace | Buy, Sell & Discover Local Deals",
    template: "%s | Deallyhub",
  },
  description:
    "Deallyhub is your modern marketplace. Buy and sell items across 25 categories: electronics, cars, real estate, pets, jobs, home & garden, and more. Post advertisements for free or download the Deally Android mobile app.",
  keywords: [
    "Deallyhub",
    "Deally",
    "marketplace",
    "classifieds",
    "buy and sell",
    "ogłoszenia",
    "kupię sprzedam",
    "darmowe ogłoszenia",
    "free classifieds",
    "cars for sale",
    "real estate",
    "electronics deals",
    "local marketplace",
    "Android APK",
    "Deally APK",
  ],
  authors: [{ name: "Deallyhub Team", url: "https://deallyhub.com" }],
  creator: "Deallyhub",
  publisher: "Deallyhub",
  alternates: {
    canonical: "https://deallyhub.com",
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/logo.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png" }, { url: "/logo.png" }],
    shortcut: ["/favicon.ico"],
  },
  manifest: "/manifest.json",
  verification: {
    google: "googleaf4f33ce5f01eea5",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Deallyhub – Modern Marketplace | Buy, Sell & Discover Deals",
    description:
      "Buy, sell, and discover thousands of deals on Deallyhub. Browse 25 categories, chat directly with sellers, and post your ads for free.",
    url: "https://deallyhub.com",
    siteName: "Deallyhub",
    images: [
      {
        url: "/logo.png",
        width: 800,
        height: 800,
        alt: "Deallyhub Marketplace Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Deallyhub – Modern Marketplace | Buy, Sell & Discover Deals",
    description:
      "Find local deals on electronics, cars, fashion, pets, and more. Post advertisements for free on Deallyhub.",
    images: ["/logo.png"],
  },
};

import { LanguageProvider } from "@/context/LanguageContext";
import { ThemeProvider } from "@/context/ThemeContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLdWebsite = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Deallyhub",
    alternateName: "Deally",
    url: "https://deallyhub.com",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://deallyhub.com/?search={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  const jsonLdOrg = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Deallyhub",
    url: "https://deallyhub.com",
    logo: "https://deallyhub.com/logo.png",
    sameAs: ["https://github.com/aucikkosmonaucik-boop/deallyhub"],
  };

  const jsonLdApp = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Deally",
    operatingSystem: "Android",
    applicationCategory: "ShoppingApplication",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    downloadUrl:
      "https://github.com/aucikkosmonaucik-boop/deallyhub/releases/latest/download/Deally.apk",
  };

  const jsonLdFaq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How do I install the Deally APK on my Android phone?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Download Deally.apk from deallyhub.com, open the downloaded file from your notifications or downloads folder, allow installation from this source in Android settings, and tap Install.",
        },
      },
      {
        "@type": "Question",
        name: "Is it safe to install this APK directly?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, 100% safe. The APK is built automatically from our open-source GitHub repository via official GitHub Actions pipelines with zero adware or malware.",
        },
      },
      {
        "@type": "Question",
        name: "Will my listings, messages, and saved items sync?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, instantly. Both the website and the Flutter Android app are connected to the exact same PostgreSQL database in real time.",
        },
      },
      {
        "@type": "Question",
        name: "Is an iOS / iPhone version available?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "An iOS release is in development. iPhone users can use deallyhub.com in Safari and tap Share -> Add to Home Screen for a native app experience.",
        },
      },
    ],
  };

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${geistSans.className} dark h-full antialiased`}
      data-theme="dark"
      style={{ colorScheme: "dark" }}
    >
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('deallyhub_theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  var isLight = saved === 'light' || (saved === 'system' && !prefersDark);
                  if (isLight) {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.setAttribute('data-theme', 'light');
                    document.documentElement.style.colorScheme = 'light';
                  } else {
                    document.documentElement.classList.add('dark');
                    document.documentElement.setAttribute('data-theme', 'dark');
                    document.documentElement.style.colorScheme = 'dark';
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebsite) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrg) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdApp) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }}
        />
        <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
        <Script src="https://connect.facebook.net/en_US/sdk.js" strategy="lazyOnload" />
      </head>
      <body className={`${geistSans.className} min-h-full flex flex-col font-sans antialiased text-[#002f34] dark:text-slate-100 bg-white dark:bg-[#0b1120] transition-colors duration-150`}>
        <ThemeProvider>
          <LanguageProvider>{children}</LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
