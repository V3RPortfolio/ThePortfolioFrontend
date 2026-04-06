import React, { useEffect, useMemo, useRef, useState } from "react";

// filepath: /home/itachi/App/personal/portfolio_app/ThePortfolioFrontend/admin/src/components/Filters/Dropdown.ts

export type DropdownItem<TValue extends string | number> = {
    name: string;
    value: TValue;
};

export interface DropdownProps<TValue extends string | number> {
    items: Array<DropdownItem<TValue>>;
    value?: TValue;
    placeholder?: string;
    label?: string;
    disabled?: boolean;
    className?: string;
    buttonClassName?: string;
    menuClassName?: string;
    handler?: (value: TValue) => void;
}

const Dropdown = <TValue extends string | number>({
    items,
    value,
    placeholder = "Select...",
    label,
    disabled = false,
    className = "w-full",
    buttonClassName,
    menuClassName,
    handler
}: DropdownProps<TValue>) => {
    const [open, setOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement | null>(null);

    const selectedName = useMemo(() => {
        const selected = items.find((i) => i.value === value);
        return selected?.name ?? "";
    }, [items, value]);

    useEffect(() => {
        const onPointerDown = (e: MouseEvent) => {
            if (!rootRef.current) return;
            if (!rootRef.current.contains(e.target as Node)) setOpen(false);
        };

        document.addEventListener("mousedown", onPointerDown);
        return () => document.removeEventListener("mousedown", onPointerDown);
    }, []);

    const onSelect = (item: DropdownItem<TValue>) => {
        if(handler) handler(item.value);
        setOpen(false);
    };

    const onKeyDown: React.KeyboardEventHandler<HTMLButtonElement> = (e) => {
        if (disabled) return;
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen((v) => !v);
        }
        if (e.key === "Escape") setOpen(false);
    };

    return (
        <div ref={rootRef} className={className}>
            {label ? (
                <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
            ) : null}

            <div className="relative">
                <button
                    type="button"
                    disabled={disabled}
                    aria-haspopup="listbox"
                    aria-expanded={open}
                    onClick={() => !disabled && setOpen((v) => !v)}
                    onKeyDown={onKeyDown}
                    className={[
                        "w-full rounded border border-gray-300 bg-white px-4 py-2 text-left text-sm",
                        "text-gray-900 shadow-sm",
                        "focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400",
                        "disabled:cursor-not-allowed disabled:opacity-60",
                        "flex items-center justify-between gap-3",
                        buttonClassName,
                    ]
                        .filter(Boolean)
                        .join(" ")}
                >
                    <span className={selectedName ? "text-gray-900" : "text-gray-500"}>
                        {selectedName || placeholder}
                    </span>

                    <svg
                        className={["h-4 w-4 text-gray-500 transition-transform", open ? "rotate-180" : ""].join(" ")}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                    >
                        <path
                            fillRule="evenodd"
                            d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.24a.75.75 0 0 1-1.06 0L5.21 8.29a.75.75 0 0 1 .02-1.08Z"
                            clipRule="evenodd"
                        />
                    </svg>
                </button>

                {open && !disabled ? (
                    <ul
                        role="listbox"
                        className={[
                            "absolute z-20 mt-2 max-h-64 w-full overflow-auto rounded border border-gray-200 bg-white shadow-lg",
                            "py-1 text-sm",
                            menuClassName,
                        ]
                            .filter(Boolean)
                            .join(" ")}
                    >
                        {items.length === 0 ? (
                            <li className="px-4 py-2 text-gray-500">No items</li>
                        ) : (
                            items.map((item) => {
                                const active = item.value === value;
                                return (
                                    <li key={String(item.value)} role="option" aria-selected={active}>
                                        <button
                                            type="button"
                                            onClick={() => onSelect(item)}
                                            className={[
                                                "w-full px-4 py-2 text-left",
                                                active ? "bg-gray-100 text-gray-900" : "text-gray-700 hover:bg-gray-50",
                                                "focus:outline-none focus:bg-gray-100",
                                            ].join(" ")}
                                        >
                                            {item.name}
                                        </button>
                                    </li>
                                );
                            })
                        )}
                    </ul>
                ) : null}
            </div>
        </div>
    );
};

export default Dropdown;