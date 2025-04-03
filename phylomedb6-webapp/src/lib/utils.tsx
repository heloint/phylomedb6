import { clsx } from "clsx";
import { ReadonlyURLSearchParams } from "next/navigation";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: any) {
    return twMerge(clsx(inputs));
}

export function createQueryString(
    searchParams: ReadonlyURLSearchParams,
    name: string,
    value: string,
) {
    const params = new URLSearchParams(searchParams.toString());
    params.set(name, value);
    return params.toString();
}

export function capitalizeFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
