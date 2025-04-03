"use client";

import { AgGridReact } from "@ag-grid-community/react";
import {
    createContext,
    useContext,
    Dispatch,
    SetStateAction,
    useState,
    RefObject,
    useRef,
} from "react";

interface TableContextProps {
    errorMessage: string | null;
    setErrorMessage: Dispatch<SetStateAction<string | null>>;

    selectedIDs: string[];
    setSelectedIDs: Dispatch<SetStateAction<string[]>>;

    operationPath: string | null;
    setOperationPath: Dispatch<SetStateAction<string | null>>;

    confirmButtonLoading: boolean;
    setConfirmButtonLoading: Dispatch<SetStateAction<boolean>>;

    tableRef: RefObject<AgGridReact<any>> | null;
    modalRef: RefObject<HTMLDialogElement> | null;
}

const DatatableContext = createContext<TableContextProps>({
    errorMessage: null,
    setErrorMessage: (): string | null => null,

    selectedIDs: [],
    setSelectedIDs: (): string[] => [],

    operationPath: null,
    setOperationPath: (): string | null => null,

    confirmButtonLoading: false,
    setConfirmButtonLoading: (): boolean => false,

    tableRef: null,
    modalRef: null,
});

export const DatatableContextProvider = ({ children }: any) => {
    const [selectedIDs, setSelectedIDs] = useState<string[]>([]);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [operationPath, setOperationPath] = useState<string | null>(null);
    const [confirmButtonLoading, setConfirmButtonLoading] =
        useState<boolean>(false);

    const modalRef = useRef(null);
    const tableRef = useRef(null);

    return (
        <DatatableContext.Provider
            value={{
                selectedIDs,
                setSelectedIDs,
                errorMessage,
                setErrorMessage,
                tableRef,
                modalRef,
                operationPath,
                setOperationPath,
                confirmButtonLoading,
                setConfirmButtonLoading,
            }}
        >
            {children}
        </DatatableContext.Provider>
    );
};

export const useDatatableContext = () => useContext(DatatableContext);
