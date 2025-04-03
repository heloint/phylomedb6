"use client";

type ErrorMessageProps = {
    message: string;
};

export default function ErrorMessage(params: ErrorMessageProps) {
    return (
        <div
            style={{ display: params.message ? "block" : "none", color: "red" }}
            id="error-message"
        >
            {params.message}
        </div>
    );
}
