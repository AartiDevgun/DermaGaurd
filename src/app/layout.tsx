import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "DermaGuard — Dermoscopic image screening",
    template: "%s | DermaGuard"
  },
  description:
    "A two-stage dermoscopic image screening research project, combining image-quality assessment with lesion-pattern classification.",
  applicationName: "DermaGuard",
  category: "health"
};

export const viewport: Viewport = {
  themeColor: "#070711",
  colorScheme: "dark"
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <div className="shard-field" aria-hidden="true">
          {Array.from({ length: 18 }, (_, index) => (
            <span className={`shard shard--${index % 6}`} key={index} />
          ))}
        </div>
        {children}
      </body>
    </html>
  );
}
