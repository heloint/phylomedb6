type Box2Props = {
    children: React.ReactNode;
    extraClasses?: string;
};

export default function Box2(props: Box2Props) {
    return (
        <div
            className={
                "bg-white rounded-lg shadow-2xl py-5 px-12 " +
                props.extraClasses
            }
        >
            {props.children}
        </div>
    );
}
