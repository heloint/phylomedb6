"use client";

import { useEditor, Editor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
    BoldIcon,
    CodeIcon,
    FileImageIcon,
    Heading1Icon,
    Heading2Icon,
    Heading3Icon,
    Heading4Icon,
    Heading5Icon,
    ItalicIcon,
    StrikethroughIcon,
    UnderlineIcon,
    PilcrowIcon,
    RedoIcon,
    UndoIcon,
} from "lucide-react";
import { Button } from "../ui/button";
import Underline from "@tiptap/extension-underline";
import Dropcursor from "@tiptap/extension-dropcursor";

import Image from "@tiptap/extension-image";
import ImageResize from "tiptap-extension-resize-image";
import { Dispatch, SetStateAction } from "react";
import TextAlign from "@tiptap/extension-text-align";

export default function RichTextEditor({
    content,
    setContent,
}: {
    content: string;
    setContent: Dispatch<SetStateAction<string>>;
}) {
    const extensions = [
        StarterKit,
        Underline,
        Image.configure({ inline: true, allowBase64: true }),
        Dropcursor,
        ImageResize,
        TextAlign,
    ];
    const editor = useEditor({
        extensions: extensions,
        content: content,
        onUpdate: (e) => setContent(e.editor.getHTML()),
        immediatelyRender: false,
    });
    if (!editor) {
        return null;
    }

    const handleImageDrop = async (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const files = e.dataTransfer.files;
        if (files.length < 1) {
            return;
        }
        const file = files[0];
        if (!file.type.startsWith("image/")) {
            return;
        }

        const formData = new FormData();
        formData.append("file", file);
        const imageUploadUrl: string = `${window.origin}/api/upload-public-image`;

        const res = await fetch(imageUploadUrl, {
            method: "POST",
            body: formData,
        });
        const data = await res.json();
        editor.chain().focus().setImage({ src: data.imgRoute }).run();
    };

    return (
        <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={async (e) => await handleImageDrop(e)}
        >
            <MenuBar editor={editor} />
            <EditorContent editor={editor} />
        </div>
    );
}

function MenuBar({ editor }: { editor: Editor }) {
    const options: any = [
        {
            name: "bold",
            icon: <BoldIcon />,
            onClick: () => editor.chain().focus().toggleBold().run(),
            isActive: editor.isActive("bold") ? "is-active text-slate-700" : "",
        },
        {
            name: "italic",
            icon: <ItalicIcon />,
            onClick: () => editor.chain().focus().toggleItalic().run(),
            isActive: editor.isActive("italic")
                ? "is-active text-slate-700"
                : "",
        },
        {
            name: "underline",
            icon: <UnderlineIcon />,
            onClick: () => editor.chain().focus().toggleUnderline().run(),
            isActive: editor.isActive("underline")
                ? "is-active text-slate-700"
                : "",
        },
        {
            name: "strike",
            icon: <StrikethroughIcon />,
            onClick: () => editor.chain().focus().toggleStrike().run(),
            isActive: editor.isActive("strike")
                ? "is-active text-slate-700"
                : "",
        },
        {
            name: "code",
            icon: <CodeIcon />,
            onClick: () => editor.chain().focus().toggleCode().run(),
            isActive: editor.isActive("code") ? "is-active text-slate-700" : "",
        },
        {
            name: "heading1",
            icon: <Heading1Icon />,
            onClick: () =>
                editor.chain().focus().toggleHeading({ level: 1 }).run(),
            isActive: editor.isActive("heading", { level: 1 })
                ? "is-active text-slate-700"
                : "",
        },
        {
            name: "heading2",
            icon: <Heading2Icon />,
            onClick: () =>
                editor.chain().focus().toggleHeading({ level: 2 }).run(),
            isActive: editor.isActive("heading", { level: 2 })
                ? "is-active text-slate-700"
                : "",
        },
        {
            name: "heading3",
            icon: <Heading3Icon />,
            onClick: () =>
                editor.chain().focus().toggleHeading({ level: 3 }).run(),
            isActive: editor.isActive("heading", { level: 3 })
                ? "is-active text-slate-700"
                : "",
        },
        {
            name: "heading4",
            icon: <Heading4Icon />,
            onClick: () =>
                editor.chain().focus().toggleHeading({ level: 4 }).run(),
            isActive: editor.isActive("heading", { level: 4 })
                ? "is-active text-slate-700"
                : "",
        },
        {
            name: "heading5",
            icon: <Heading5Icon />,
            onClick: () =>
                editor.chain().focus().toggleHeading({ level: 5 }).run(),
            isActive: editor.isActive("heading", { level: 5 })
                ? "is-active text-slate-700"
                : "",
        },
        {
            name: "paragraph",
            icon: <PilcrowIcon />,
            onClick: () => editor.chain().focus().setParagraph().run(),
            isActive: editor.isActive("paragraph")
                ? "is-active text-slate-700"
                : "",
        },
        {
            name: "undo",
            icon: <UndoIcon />,
            onClick: () => editor.chain().focus().undo().run(),
            isActive: editor.isActive("table")
                ? "is-active text-slate-700"
                : "",
        },
        {
            name: "redo",
            icon: <RedoIcon />,
            onClick: () => editor.chain().focus().redo().run(),
            isActive: editor.isActive("table")
                ? "is-active text-slate-700"
                : "",
        },
    ];

    return (
        <div className="flex gap-1 md:gap-5 mb-4 items-center w-full">
            <div className="flex flex-wrap">
                {options.map((option: any, idx: number) => (
                    <Button
                        key={idx}
                        type="button"
                        variant="outline"
                        size={"icon"}
                        className={`bg-slate-200 border border-solid border-black m-1 text-md text-gray-900 rounded backdrop-opacity-60
                                    hover:bg-slate-800 hover:text-white hover:border-slate-700 ${option.isActive}`}
                        onClick={option.onClick}
                    >
                        {option.icon}
                    </Button>
                ))}
                <FileUploadButton editor={editor} />
            </div>
        </div>
    );
}

function FileUploadButton({ editor }: { editor: Editor }) {
    const handleImageUpload = async (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        e.preventDefault();
        const files = e.target.files;
        if (!files || files.length < 1) {
            return;
        }
        const file = files[0];
        if (!file.type.startsWith("image/")) {
            return;
        }

        const formData = new FormData();
        formData.append("file", file);
        const imageUploadUrl: string = `${window.origin}/api/upload-public-image`;
        const res = await fetch(imageUploadUrl, {
            method: "POST",
            body: formData,
        });
        const data = await res.json();
        editor.chain().focus().setImage({ src: data.imgRoute }).run();
    };

    return (
        <Button
            type="button"
            variant="outline"
            size={"icon"}
            className={`bg-slate-200 border border-solid border-black m-1 text-md text-gray-900 rounded backdrop-opacity-60
                    hover:bg-white hover:border-slate-700 hover:underline ${
                        editor.isActive("underline")
                            ? "bg-slate-800 text-white underline"
                            : ""
                    }`}
            onClick={() => {
                const input = document.querySelector(
                    "#fileInput",
                ) as HTMLInputElement;
                input?.click();
            }}
        >
            <input
                type="file"
                id="fileInput"
                className="hidden"
                onChange={async (e) => await handleImageUpload(e)}
            />
            <FileImageIcon />
        </Button>
    );
}
