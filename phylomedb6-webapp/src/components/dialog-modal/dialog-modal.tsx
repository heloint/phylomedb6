"use client";

import { ReactNode, useRef } from "react";

type DialogModalProps = {
    children: ReactNode;
};

export default function DialogModal(props: DialogModalProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    return (
        <div className="bg-slate-100">
            <button
                onClick={() => dialogRef.current?.showModal()}
                type="button"
                className="inline-block rounded bg-primary px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-primary-3 transition duration-150 ease-in-out hover:bg-primary-accent-300 hover:shadow-primary-2 focus:bg-primary-accent-300 focus:shadow-primary-2 focus:outline-none focus:ring-0 active:bg-primary-600 active:shadow-primary-2 motion-reduce:transition-none dark:shadow-black/30 dark:hover:shadow-dark-strong dark:focus:shadow-dark-strong dark:active:shadow-dark-strong"
            >
                Open modal
            </button>
            <dialog ref={dialogRef} className="bg-slate-100">
                <button
                    onClick={() => dialogRef.current?.close()}
                    type="button"
                    className="inline-block rounded bg-primary px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-primary-3 transition duration-150 ease-in-out hover:bg-primary-accent-300 hover:shadow-primary-2 focus:bg-primary-accent-300 focus:shadow-primary-2 focus:outline-none focus:ring-0 active:bg-primary-600 active:shadow-primary-2 motion-reduce:transition-none dark:shadow-black/30 dark:hover:shadow-dark-strong dark:focus:shadow-dark-strong dark:active:shadow-dark-strong"
                >
                    Close modal
                </button>
                {props.children}
            </dialog>
        </div>
    );
}
