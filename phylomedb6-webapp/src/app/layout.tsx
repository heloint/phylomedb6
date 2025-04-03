import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/footer/Footer";
import CookieConsent from "@/components/cookie-consent/CookieConsent";
import {
    checkIsAuthenticated,
    checkIsAuthenticatedAsAdmin,
} from "@/auth/checkSession";

export const metadata: Metadata = {
    title: "PhylomeDB 6",
    description:
        "PhylomeDB is a public database for complete catalogs of gene phylogenies (phylomes). It allows users to interactively explore the evolutionary history of genes and proteins.",
    keywords:
        "PhylomeDB, gene phylogenies, evolutionary history, biology, genes, phylogenetic tree",
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const isLoggedIn = await checkIsAuthenticated();

    const isAdmin = await checkIsAuthenticatedAsAdmin();

    return (
        <html lang="en">
            <body
                className={`relative bg-fixed bg-[url('/background-images/forest-bg-4-75-opacity.webp')] bg-cover bg-repeat-y bg-opacity-35`}
            >
                <Navbar
                    userEmail={isLoggedIn?.user_email_address}
                    isAdmin={isAdmin}
                />
                <main className="pt-20  pb-6 min-h-[80vh]">{children}</main>
                <Footer />
                <CookieConsent variant="default" />
            </body>
        </html>
    );
}
