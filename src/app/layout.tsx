import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Caveat_Brush, Outfit } from "next/font/google";
import { Providers } from "@/components/providers";
import { siteConfig } from "@/config/site";
import { BRAND_THEME_STORAGE_KEY } from "@/components/theme/brand-themes";
import "./globals.css";

const outfit = Outfit({ variable: "--font-outfit", subsets: ["latin"] });
const bricolage = Bricolage_Grotesque({ variable: "--font-bricolage", subsets: ["latin"], weight: ["500", "600", "700", "800"] });
const caveatBrush = Caveat_Brush({ variable: "--font-caveat-brush", subsets: ["latin"], weight: "400" });

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: `${siteConfig.name} · ${siteConfig.tagline}`, template: `%s · ${siteConfig.name}` },
  description: siteConfig.description,
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    type: "website",
    locale: "en_GB",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#120d0b" },
  ],
};

const brandThemeScript = `try{var t=localStorage.getItem("${BRAND_THEME_STORAGE_KEY}");if(t&&t!=="crystal")document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en-GB"
      suppressHydrationWarning
      className={`${outfit.variable} ${bricolage.variable} ${caveatBrush.variable} h-full`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: brandThemeScript }} />
      </head>
      <body className="flex min-h-full flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
