import type { Metadata } from "next";
import "./globals.css";
import "../public/css/sb-admin-2.min.css";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Tableau de bord avec Next.js et Bootstrap",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="stylesheet" href="/css/sb-admin-2.min.css" />
        <link rel="stylesheet" href="/vendor/fontawesome-free/css/all.min.css" />
      </head>
      <body>
        {children}
        <script src="/vendor/jquery/jquery.min.js"></script>
        <script src="/vendor/bootstrap/js/bootstrap.bundle.min.js"></script>
        <script src="/js/sb-admin-2.min.js"></script>
      </body>
    </html>
  );
}
