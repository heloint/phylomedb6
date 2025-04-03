"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type NavbarItemProps = {
    text: string;
    href: string;
    needLateralNavbar: boolean;
    isDroppedDown: boolean;
};

export default function NavbarItem(props: NavbarItemProps) {
    const pathname = usePathname();
    const [isSelected, setIsSelected] = useState(false);

    useEffect(() => {
        if (pathname.startsWith(props.href)) {
            setIsSelected(true);
        } else {
            setIsSelected(false);
        }
    }, [props.href, pathname]);

    return (
        <li
            className={`text-black lg:pt-4 text-lg text-center border-2 lg:border-0 border-slate-300 border-x-transparent border-b-transparent w-100 animated-bottom-border ${
                isSelected
                    ? "underline underline-offset-8 decoration-green-500 decoration-[3px]"
                    : ""
            }`}
            aria-hidden={
                props.needLateralNavbar && !props.isDroppedDown
                    ? "true"
                    : "false"
            }
        >
            <Link
                prefetch={null}
                replace={false}
                className="block px-10 py-4 lg:p-0 animated-bottom-border"
                href={props.href}
                tabIndex={
                    props.needLateralNavbar && !props.isDroppedDown ? -1 : 0
                }
            >
                {props.text}
            </Link>
        </li>
    );
}
