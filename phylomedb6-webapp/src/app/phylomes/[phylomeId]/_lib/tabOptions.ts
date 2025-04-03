export type TabOption = {
    label: string;
    url: string;
};

export const tabOptions: TabOption[] = [
    {
        label: "Description",
        url: "description",
    },
    {
        label: "Gene trees",
        url: "genetrees",
    },
    {
        label: "Proteomes",
        url: "proteomes",
    },
];
