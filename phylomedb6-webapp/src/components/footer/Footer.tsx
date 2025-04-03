import Image from "next/image";
import Link from "next/link";

export default function Footer() {
    const quickLinks = [
        { name: "Phylomes", href: "/phylomes" },
        { name: "Search", href: "search/gene" },
        { name: "Phylo Explorer", href: "/phylo-explorer" },
        { name: "Erga", href: "/erga" },
        { name: "Help", href: "/help" },
        { name: "Login", href: "/login" },
    ];

    const otherLinks = [
        { name: "About", href: "/about" },
        { name: "What's new?", href: "/" },
        { name: "Linking PhylomedDB", href: "/about" },
        { name: "FAQ", href: "/faq" },
        { name: "Cookies", href: "/cookie-policy" },
        { name: "Privacy", href: "/privacy-policy" },
    ];
    return (
        <div className="bg-slate-200 bg-opacity-90">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 w-full ">
                {" "}
                <div className="w-full  ">
                    <ul className="py-2 p-6   flex flex-col items-center justify-center gap-2">
                        <li className="font-semibold">QUICK LINKS</li>
                        {quickLinks.map((link) => {
                            return (
                                <Link
                                    className="hover:font-medium"
                                    href={link.href}
                                    key={link.name}
                                >
                                    {link.name}
                                </Link>
                            );
                        })}
                    </ul>
                </div>
                <div className=" w-full">
                    <ul className="py-2 p-6  flex flex-col items-center justify-center gap-2">
                        <li className="font-semibold">OTHERS</li>
                        {otherLinks.map((link) => {
                            return (
                                <Link
                                    className="hover:font-medium"
                                    href={link.href}
                                    key={link.name}
                                >
                                    {link.name}
                                </Link>
                            );
                        })}
                    </ul>
                </div>
                <div className="flex flex-col justify-start items-center pt-2">
                    <span className="font-semibold mb-3">ORGANIZATIONS</span>
                    <div className="grid grid-cols-4 justify-center items-center gap-2">
                        <a href="https://www.irbbarcelona.org">
                            <Image
                                alt="irb logo"
                                width={85}
                                height={85}
                                src="/logos/irb-logo.webp"
                                className="hover:scale-105"
                            />
                        </a>
                        <a href="https://www.bsc.es/">
                            <Image
                                alt="bsc logo"
                                width={85}
                                height={85}
                                src="/logos/bsc-logo.webp"
                                className="hover:scale-105"
                            />
                        </a>

                        <a href="https://inb-elixir.es/">
                            <Image
                                alt="inb logo"
                                width={85}
                                height={85}
                                src="/logos/inb-logo.webp"
                                className="hover:scale-105"
                            />
                        </a>

                        <a href="https://elixir-europe.org/">
                            <Image
                                alt="elixir logo"
                                width={85}
                                height={85}
                                src="/logos/elixir-logo.webp"
                                className="hover:scale-105"
                            />
                        </a>
                    </div>
                </div>
                <div className=" w-full">
                    <div className="text-center py-2 ">
                        <p className="font-bold">Follow us</p>
                    </div>

                    <div className="col-span-3 flex justify-center gap-2 py-2">
                        <div id="footer-github-logo " className="pr-3">
                            <a
                                className="text-center"
                                href="https://github.com/Gabaldonlab/"
                            >
                                <Image
                                    alt="github logo"
                                    width={80}
                                    height={80}
                                    src="/logos/github-logo.webp"
                                    className="hover:scale-105"
                                />
                            </a>
                        </div>
                        <div id="footer-x-logo" className="pl-3">
                            <a
                                className="text-center"
                                href="https://x.com/phylomedb"
                            >
                                <Image
                                    alt="x logo"
                                    width={25}
                                    height={25}
                                    src="/logos/x-logo.webp"
                                    className="hover:scale-105"
                                />
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <div className="col-span-3 flex gap-3 items-center justify-center mt-1">
                <div className="text-center py-1">
                    <p className="text-xs">
                        All data you can find in this website is under a
                        CC-BY-NC license.
                    </p>
                </div>

                <div id="footer-cc-logo " className="py-2 ">
                    <a
                        className="text-center"
                        href="https://creativecommons.org/licenses/by-nc/2.0/legalcode"
                    >
                        <Image
                            alt="creative commons logo"
                            width={70}
                            height={70}
                            src="/logos/cc-logo.webp"
                            className="hover:scale-105"
                        />
                    </a>
                </div>
                <div className="text-center pb-2 ">
                    {" "}
                    <p className="text-xs">© COPYRIGHT 2024</p>{" "}
                </div>
            </div>
        </div>
    );
}
