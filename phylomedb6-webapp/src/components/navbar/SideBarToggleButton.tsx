import { Dispatch, SetStateAction } from "react";

type SideBarToggleButtonProps = {
    setDroppedDown: Dispatch<SetStateAction<boolean>>;
    isDroppedDown: boolean;
};

export default function SideBarOpenButton(params: SideBarToggleButtonProps) {
    return (
        <div id="dropdown-toggle-btn" className="lg:hidden mt-1">
            <button
                className="relative group"
                onClick={() => params.setDroppedDown(true)}
            >
                {/*<button className="relative group" onClick={() => handleSideDropIn(params.isDroppedDown, params.setDroppedDown)}>*/}
                <div
                    className={
                        "relative flex items-center justify-center rounded-full w-[53px] h-[53px] transform transition-all bg-slate-700 ring-0 ring-gray-300 hover:ring-8 ring-opacity-30 shadow-md " +
                        (params.isDroppedDown ? "ring-4 duration-200" : "")
                    }
                >
                    <div
                        className={
                            "flex flex-col justify-between w-[20px] h-[20px] transform transition-all duration-300 origin-center " +
                            (params.isDroppedDown ? "rotate-[45deg]" : "")
                        }
                    >
                        <div
                            className={
                                "bg-white h-[2px] w-1/2 rounded transform transition-all duration-300 " +
                                (params.isDroppedDown
                                    ? "-rotate-90 h-px origin-right delay-75 -translate-y-px"
                                    : "")
                            }
                        ></div>
                        <div className="bg-white h-[1px] rounded"></div>
                        <div
                            className={
                                "bg-white h-[2px] w-1/2 rounded self-end transform transition-all duration-300 " +
                                (params.isDroppedDown
                                    ? "-rotate-90 h-px origin-left delay-75 translate-y-px"
                                    : "")
                            }
                        ></div>
                    </div>
                </div>
            </button>
        </div>
    );
}
