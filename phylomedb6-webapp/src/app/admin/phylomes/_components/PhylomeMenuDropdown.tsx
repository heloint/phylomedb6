import { useState, useEffect, useRef, SetStateAction, Dispatch } from "react";
import EditPhylomeMenu from "./EditPhylomeData";
import AddEmailMenu from "./AddEmail";

export default function PhylomeMenuDropdown({
    phylomeId,
    setEmailSelectedAction,
    setSelectedPhylomeAction,
    selectedPhylome,
    setAddMenuOpenAction,
    isAddMenuOpen,
    setOldEmailAction,
    oldEmail,
    setIsEditMenuOpenAction,
    isEditMenuOpen,
    isReadOnly,
    setIsReadOnlyAction,
    emailSelected,
    phylomesData,
    setPhylomesDataAction,
    setErrorMessageAction,
    setSuccessMessageAction,
    searchQuery,
    setSearchQueryAction,
    filteredEmails,
    setFilteredEmailsAction,
}: {
    phylomeId: string;
    setEmailSelectedAction: Dispatch<SetStateAction<string>>;
    emailSelected: string;
    setSelectedPhylomeAction: Dispatch<SetStateAction<string>>;
    selectedPhylome: string;
    setAddMenuOpenAction: Dispatch<SetStateAction<boolean>>;
    isAddMenuOpen: boolean;
    setOldEmailAction: Dispatch<SetStateAction<string>>;
    oldEmail: string;
    setIsEditMenuOpenAction: Dispatch<SetStateAction<boolean>>;
    isEditMenuOpen: boolean;
    isReadOnly: boolean;
    setIsReadOnlyAction: Dispatch<SetStateAction<boolean>>;
    phylomesData: { [key: string]: Array<string> };
    setPhylomesDataAction: Dispatch<
        SetStateAction<{ [key: string]: Array<string> }>
    >;
    searchQuery: string;
    setSearchQueryAction: Dispatch<SetStateAction<string>>;
    filteredEmails: string[];
    setFilteredEmailsAction: Dispatch<SetStateAction<string[]>>;
    setErrorMessageAction: Dispatch<SetStateAction<string>>;
    setSuccessMessageAction: Dispatch<SetStateAction<string>>;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const emailInputRef = useRef<HTMLInputElement>(null);

    const handleClickDropdown = () => {
        setIsOpen(!isOpen);
    };
    const [hovered, setHovered] = useState(-1);

    useEffect(() => {
        if (emailInputRef.current) {
            emailInputRef.current.focus();
        }
    }, [isAddMenuOpen]);

    useEffect(() => {
        if (isAddMenuOpen || isEditMenuOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
        return () => {
            document.body.style.overflow = "auto";
        };
    }, [isAddMenuOpen, isEditMenuOpen]);

    useEffect(() => {
        const phylomeIdData = phylomesData[phylomeId];
        if (!phylomeIdData) {
            return;
        }
        const newFilteredEmails =
            phylomeIdData.filter((email) =>
                email.toLowerCase().includes(searchQuery.toLowerCase()),
            ) || [];
        setFilteredEmailsAction(newFilteredEmails);
    }, [searchQuery, phylomeId, phylomesData, setFilteredEmailsAction]);

    const handleClickAddNewEmail = () => {
        setEmailSelectedAction("");
        setSelectedPhylomeAction(phylomeId);

        setAddMenuOpenAction(!isAddMenuOpen);
    };

    const handleClickEmail = (email: string) => {
        setOldEmailAction(email);
        setSelectedPhylomeAction(phylomeId);
        setIsEditMenuOpenAction(!isEditMenuOpen);
        setEmailSelectedAction(email);
    };

    const chevronRightSVG = (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="30"
            height="30"
            fill="currentColor"
            className="bi bi-chevron-right"
            viewBox="0 0 16 16"
        >
            <path
                fillRule="evenodd"
                d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708"
            />
        </svg>
    );

    const chevronDownSVG = (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="30"
            height="30"
            fill="currentColor"
            className="bi bi-chevron-down"
            viewBox="0 0 16 16"
        >
            <path
                fillRule="evenodd"
                d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708"
            />
        </svg>
    );

    const pencilSVG = (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            className="bi bi-pencil"
            viewBox="0 0 16 16"
        >
            <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325" />
        </svg>
    );

    const addEmailSVG = (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="25"
            height="25"
            fill="currentColor"
            className="bi bi-envelope-plus"
            viewBox="0 0 16 16"
        >
            <path d="M2 2a2 2 0 0 0-2 2v8.01A2 2 0 0 0 2 14h5.5a.5.5 0 0 0 0-1H2a1 1 0 0 1-.966-.741l5.64-3.471L8 9.583l7-4.2V8.5a.5.5 0 0 0 1 0V4a2 2 0 0 0-2-2zm3.708 6.208L1 11.105V5.383zM1 4.217V4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v.217l-7 4.2z" />
            <path d="M16 12.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0m-3.5-2a.5.5 0 0 0-.5.5v1h-1a.5.5 0 0 0 0 1h1v1a.5.5 0 0 0 1 0v-1h1a.5.5 0 0 0 0-1h-1v-1a.5.5 0 0 0-.5-.5" />
        </svg>
    );

    const closeCross = (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            fill="currentColor"
            className="bi bi-x"
            viewBox="0 0 16 16"
        >
            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708" />
        </svg>
    );
    return (
        <div className="flex flex-col w-10/12 border-2 my-2 border-slate-300 shadow-md rounded-xl">
            <div className="flex flex-row w-full">
                <div className="flex flex-row  p-4">
                    <button
                        data-cy="toggle-dropdown-phylomes-menu-button"
                        className="w-auto p-2 h-12  border-2 rounded-xl text-2xl bg-white text-black hover:bg-gray-100 border-slate-300 shadow-md  hover:border-gray-600 hover:shadow-md transition-all duration-300 ease-in-out"
                        onClick={handleClickDropdown}
                        title="Toggle phylome menu"
                    >
                        {isOpen ? chevronDownSVG : chevronRightSVG}
                    </button>
                    <button
                        data-cy="add-new-user-to-phylome-button"
                        className=" flex justify-center items-center w-auto px-3 h-12  ml-2  border-2 font-bold rounded-xl text-2xl bg-white text-black border-slate-300 shadow-md  hover:bg-gray-100 hover:border-gray-600 hover:shadow-md transition-all duration-300 ease-in-out"
                        onClick={handleClickAddNewEmail}
                        title="Add new email"
                    >
                        {addEmailSVG}
                    </button>
                </div>
                <div className="w-full  content-center">
                    <p className="text-center text-xl sm:text-2xl mr-0 xl:mr-32">
                        Phylome {phylomeId}
                    </p>
                </div>
            </div>

            {isOpen && (
                <div>
                    <div className="w-65 sm:w-80 w-full mt-2 px-4">
                        <input
                            data-cy="searchbar-privates-phylomes-input"
                            id="searchBar"
                            type="text"
                            value={searchQuery}
                            onChange={(e) =>
                                setSearchQueryAction(e.target.value)
                            }
                            placeholder="Search by email"
                            className="w-full p-2 border-2 rounded-md border-slate-300 shadow-sm  "
                            title="Search email"
                        />
                    </div>
                    <div className="flex sm:justify-start border-slate-300 shadow-sm   sm:items-start justify-center items-center p-3 sm:p-3 m-4 mt-2 border-2 rounded-md flex-wrap transition-transform duration-300 ease-in-out">
                        {filteredEmails.length === 0 ? (
                            <p className="text-center w-full border-slate-300 text-gray-500 ">
                                No emails available for this phylome.
                            </p>
                        ) : (
                            filteredEmails.map(
                                (email: string, index: number) => (
                                    <button
                                        data-cy="email-dinamic-button"
                                        key={index}
                                        className="hover:bg-gray-100 border-slate-300 shadow-md  group hover:scale-x-105 transition-transform duration-300 ease-in-out hover:border-gray-600 hover:shadow-md p-2 border-2 rounded-md m-2 break-words text-left max-w-full"
                                        onMouseEnter={() => setHovered(index)}
                                        onMouseLeave={() => setHovered(-1)}
                                        onClick={() => {
                                            handleClickEmail(email);
                                            setHovered(-1);
                                        }}
                                        title="Edit email"
                                    >
                                        {email}
                                        {
                                            <span className="ml-2 absolute  hidden group-hover:relative sm:inline-flex transform origin-left scale-0 group-hover:scale-100 transition-transform duration-300 ease-out">
                                                {pencilSVG}
                                            </span>
                                        }
                                        {
                                            <span className="inline-flex w-full justify-center  sm:hidden ">
                                                {pencilSVG}
                                            </span>
                                        }
                                    </button>
                                ),
                            )
                        )}
                    </div>
                </div>
            )}

            {/* Edit menu */}
            {isEditMenuOpen && (
                <EditPhylomeMenu
                    isEditMenuOpen={isEditMenuOpen}
                    setIsEditMenuOpenAction={setIsEditMenuOpenAction}
                    isReadOnly={isReadOnly}
                    setIsReadOnlyAction={setIsReadOnlyAction}
                    closeCross={closeCross}
                    setEmailSelectedAction={setEmailSelectedAction}
                    emailSelected={emailSelected}
                    emailInputRef={emailInputRef}
                    oldEmail={oldEmail}
                    selectedPhylome={selectedPhylome}
                    setSuccessMessageAction={setSuccessMessageAction}
                    setErrorMessageAction={setErrorMessageAction}
                    setPhylomesDataAction={setPhylomesDataAction}
                    setFilteredEmailsAction={setFilteredEmailsAction}
                ></EditPhylomeMenu>
            )}

            {/* Add menu */}
            {isAddMenuOpen && (
                <AddEmailMenu
                    setAddMenuOpenAction={setAddMenuOpenAction}
                    isAddMenuOpen={isAddMenuOpen}
                    closeCross={closeCross}
                    selectedPhylome={selectedPhylome}
                    emailInputRef={emailInputRef}
                    setEmailSelectedAction={setEmailSelectedAction}
                    phylomesData={phylomesData}
                    setSuccessMessageAction={setSuccessMessageAction}
                    setErrorMessageAction={setErrorMessageAction}
                    setPhylomesDataAction={setPhylomesDataAction}
                ></AddEmailMenu>
            )}
        </div>
    );
}
