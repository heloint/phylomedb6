"use client";

export default function ButtonWithClientCallback({
    buttonID,
    onClickCallBack,
    buttonText,
}: {
    buttonID: string;
    onClickCallBack: () => void;
    buttonText: string;
}) {
    return (
        <button
            data-cy="download-button"
            id={buttonID}
            className="m-1 py-2 px-4  text-md text-gray-900 rounded
    bg-gray-200 backdrop-opacity-60 hover:bg-white  hover:backdrop-opacity-60 border-2 border-gray-400
    hover:border-solid hover:border-slate-900"
            onClick={onClickCallBack}
        >
            {buttonText}
        </button>
    );
}
