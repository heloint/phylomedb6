import { PhylomeInfo } from "../description/_models/phylomeInfo";
import { TabOption } from "../_lib/tabOptions";
import { TabButton } from "./TabButton";

export default function TabOptions({
    tabOptions,
    phylomeId,
    selectedTabType,
}: {
    tabOptions: TabOption[];
    phylomeId: string;
    selectedTabType: string;
}) {
    return (
        <>
            {tabOptions.map((key, index) => (
                <TabButton
                    key={index}
                    phylomeId={phylomeId}
                    index={index}
                    selectedTabType={selectedTabType}
                    label={key.label}
                    url={key.url}
                />
            ))}
        </>
    );
}
