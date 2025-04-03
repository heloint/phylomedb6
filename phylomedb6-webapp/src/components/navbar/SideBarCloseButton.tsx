import { Dispatch, SetStateAction } from "react";

type SideBarCloseButtonProps = {
    needLateralNavbar: boolean;
    setDroppedDown: Dispatch<SetStateAction<boolean>>;
};

export default function SideBarCloseButton(params: SideBarCloseButtonProps) {
    return (
        <li className="text-black w-100 px-1 py-2">
            <button
                id="dropdown-close-btn"
                type="button"
                className={
                    (params.needLateralNavbar ? "block" : "hidden") +
                    " rounded-lg h-8 w-8 p-0 bg-slate-200 shadow-md focus:outline-none focus:ring focus:ring-opacity-50"
                }
                onClick={() => params.setDroppedDown(false)}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    className="h-6 w-5 mx-auto my-auto"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                    ></path>
                </svg>
            </button>
        </li>
    );
}
