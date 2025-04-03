import { checkIsAuthenticatedAsAdmin } from "@/auth/checkSession";
import HomeCarousel from "./_components/HomeCarousel";
import HomeWelcomeBox from "./_components/HomeWelcomeBox";
import NewsSection from "./_components/NewsSection/NewsSection";

export const metadata = {
    title: "Home",
    description: "Home page",
};

export default async function Home() {
    const isAdmin = await checkIsAuthenticatedAsAdmin();
    return (
        <main className="flex flex-col items-center justify-between px-4 md:px-24 gap-10">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 justify-start w-full lg:w-5/6 align-top mt-4">
                <div className="col-span-2">
                    <HomeWelcomeBox />
                </div>
                <div className="col-span-3 flex flex-col gap-4">
                    <HomeCarousel />
                    <NewsSection newsLimit={5} admin={isAdmin} />
                </div>
            </div>
            <div className="grid grid-cols-5 w-full md:w-5/6">
                <span className="col-span-5 lg:col-span-4"></span>
            </div>
        </main>
    );
}
