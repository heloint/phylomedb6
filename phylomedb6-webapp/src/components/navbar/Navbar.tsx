"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import SideBarOpenButton from "./SideBarToggleButton";
import SideBarCloseButton from "./SideBarCloseButton";
import NavbarItem from "./NavbarItem";
import UserIcon from "../user-icon/UserIcon";

type NavbarParams = {
    userEmail: string | undefined;
    isAdmin: boolean;
};

export default function Navbar({ userEmail, isAdmin }: NavbarParams) {
    const navbarOptionsRef = useRef<HTMLUListElement>(null);
    const [isTopPosition, setTopPosition] = useState(true);
    const [isDroppedDown, setDroppedDown] = useState(false);
    const [needLateralNavbar, setNeedLateralNavbar] = useState(false);

    useEffect(() => {
        if (window.innerWidth <= 1024) {
            setNeedLateralNavbar(true);
        }

        const handleOutSideClick = (event: any) => {
            if (
                navbarOptionsRef.current &&
                !navbarOptionsRef.current.contains(event.target)
            ) {
                setDroppedDown(false);
            }
        };

        const handleWindowResize = () => {
            if (window.innerWidth >= 1024) {
                setNeedLateralNavbar(false);
            } else if (window.innerWidth < 1024) {
                setNeedLateralNavbar(true);
                setDroppedDown(false);
            }
        };

        const handleWindowScrollEvent = () => {
            if (window.scrollY < 30) {
                setTopPosition(true);
            } else {
                setTopPosition(false);
            }
        };

        window.addEventListener("resize", handleWindowResize);
        window.addEventListener("mousedown", handleOutSideClick);
        window.addEventListener("scroll", handleWindowScrollEvent);

        return () => {
            window.removeEventListener("mousedown", handleOutSideClick);
            window.removeEventListener("resize", handleWindowResize);
            window.removeEventListener("scroll", handleWindowScrollEvent);
        };
    }, [navbarOptionsRef]);

    return (
        <nav
            id="main-nav"
            className={
                "fixed w-full  z-[100] top-0 left-0 " +
                (isTopPosition
                    ? "bg-transparent"
                    : "border-b-2 border-b-slate-400 bg-slate-50 bg-opacity-90")
            }
        >
            <div className="max-w-screen-xl lg:flex lg:content-center lg:justify-around lg:mx-auto mx-10 h-full items-center">
                <div className="flex justify-between content-center items-center">
                    <div id="home-nav-icon " className="py-1">
                        <a href="/">
                            <Image
                                alt="navbar icon"
                                width={70}
                                height={70}
                                src="/logos/phylomedb-logo-transparent-bg.webp"
                                className="hover:scale-105"
                            />
                        </a>
                    </div>
                    <SideBarOpenButton
                        setDroppedDown={setDroppedDown}
                        isDroppedDown={isDroppedDown}
                    />
                </div>

                <ul
                    ref={navbarOptionsRef}
                    id="navbar-options"
                    tabIndex={isDroppedDown ? undefined : -1}
                    className={
                        (needLateralNavbar ? " min-h-screen " : "") +
                        " z-50 border-solid border-2 border-slate-300 bg-slate-50 lg:contents lg:mt-0 mx-auto lg:static fixed top-0 transform transition-all duration-300 py-5 flex-col rounded-lg " +
                        (isDroppedDown && needLateralNavbar
                            ? "right-0 w-fit sm:w-1/5"
                            : "w-0 -right-[300px] ")
                    }
                >
                    {needLateralNavbar ? (
                        <SideBarCloseButton
                            needLateralNavbar={needLateralNavbar}
                            setDroppedDown={setDroppedDown}
                        />
                    ) : null}

                    <NavbarItem
                        needLateralNavbar={needLateralNavbar}
                        isDroppedDown={isDroppedDown}
                        href={"/phylomes"}
                        text={"Phylomes"}
                    />
                    <NavbarItem
                        needLateralNavbar={needLateralNavbar}
                        isDroppedDown={isDroppedDown}
                        href={"/search/gene"}
                        text={"Search"}
                    />
                    <NavbarItem
                        needLateralNavbar={needLateralNavbar}
                        isDroppedDown={isDroppedDown}
                        href={"/phylo-explorer"}
                        text={"Phylo Explorer"}
                    />
                    <NavbarItem
                        needLateralNavbar={needLateralNavbar}
                        isDroppedDown={isDroppedDown}
                        href={"/erga"}
                        text={"Erga"}
                    />
                    <NavbarItem
                        needLateralNavbar={needLateralNavbar}
                        isDroppedDown={isDroppedDown}
                        href={"/about"}
                        text={"About"}
                    />
                    <NavbarItem
                        needLateralNavbar={needLateralNavbar}
                        isDroppedDown={isDroppedDown}
                        href={"/help"}
                        text={"Help"}
                    />

                    {isAdmin ? (
                        <>
                            <NavbarItem
                                needLateralNavbar={needLateralNavbar}
                                isDroppedDown={isDroppedDown}
                                href={"/admin"}
                                text={"Admin page"}
                            />
                        </>
                    ) : (
                        <></>
                    )}

                    {userEmail ? (
                        <>
                            <NavbarItem
                                needLateralNavbar={needLateralNavbar}
                                isDroppedDown={isDroppedDown}
                                href={"/logout"}
                                text={"Sign out"}
                            />

                            <div className="text-black lg:pt-4 text-sm text-center border-2 lg:border-0 border-slate-300 border-x-transparent border-b-transparent w-100 animated-bottom-border">
                                <div className="flex flex-col justify-between content-center items-center md:flex-row px-0  py-4 lg:p-0 animated-bottom-border">
                                    {" "}
                                    <UserIcon></UserIcon>
                                    <span></span>
                                    <span>{userEmail}</span>
                                </div>
                            </div>
                        </>
                    ) : (
                        <NavbarItem
                            needLateralNavbar={needLateralNavbar}
                            isDroppedDown={isDroppedDown}
                            href={"/login"}
                            text={"Login"}
                        />
                    )}
                </ul>
            </div>
        </nav>
    );
}
