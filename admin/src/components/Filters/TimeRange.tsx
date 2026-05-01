import React, { useEffect, useMemo, useState } from "react";

// filepath: /home/itachi/App/personal/portfolio_app/ThePortfolioFrontend/admin/src/components/Filters/TimeRange.tsx

export type TimeRangeValue = {
    from?: string;
    to?: string;
};

export interface TimeRangeProps {
    from?: string;
    to?: string;
    label?: string;
    disabled?: boolean;
    className?: string;
    inputClassName?: string;
    handler?: (range: TimeRangeValue) => void;
}

const normalize = (v: string): string | undefined => {
    const s = v.trim();
    return s.length ? s : undefined;
};

const isIsoLike = (v?: string) => {
    if (!v) return true;
    // permissive check: let Date.parse be the source of truth
    return !Number.isNaN(Date.parse(v));
};

const TimeRange: React.FC<TimeRangeProps> = ({
    from,
    to,
    label,
    disabled = false,
    className = "w-full",
    inputClassName,
    handler,
}) => {
    const [fromValue, setFromValue] = useState(from ?? "");
    const [toValue, setToValue] = useState(to ?? "");

    useEffect(() => setFromValue(from ?? ""), [from]);
    useEffect(() => setToValue(to ?? ""), [to]);

    const fromOk = useMemo(() => isIsoLike(normalize(fromValue)), [fromValue]);
    const toOk = useMemo(() => isIsoLike(normalize(toValue)), [toValue]);

    const emit = (nextFrom: string, nextTo: string) => {
        if(!isIsoLike(normalize(nextFrom)) || !isIsoLike(normalize(nextTo))) return;
        handler?.({
            from: normalize(nextFrom),
            to: normalize(nextTo),
        });
    };

    return (
        <div className={className}>
            {label ? (
                <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
            ) : null}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 w-full">
                <div className="flex flex-wrap gap-2">
                    <label className="mb-1 block text-xs font-medium text-gray-600 mt-auto mb-auto">From</label>
                    <input
                        type="text"
                        inputMode="text"
                        autoComplete="off"
                        spellCheck={false}
                        disabled={disabled}
                        value={fromValue}
                        onChange={(e) => {
                            const next = e.target.value;
                            setFromValue(next);
                            emit(next, toValue);
                        }}
                        placeholder="YYYY-MM-DDTHH:mm:ss.sssZ"
                        aria-label="From timestamp (ISO)"
                        className={[
                            "w-auto rounded border bg-white px-4 py-2 text-left text-sm flex-grow",
                            "text-gray-900 shadow-sm",
                            "focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400",
                            "disabled:cursor-not-allowed disabled:opacity-60",
                            fromOk ? "border-gray-300" : "border-red-300",
                            inputClassName,
                        ]
                            .filter(Boolean)
                            .join(" ")}
                    />
                    {!fromOk ? (
                        <p className="mt-1 text-xs text-red-600">Enter a valid ISO timestamp.</p>
                    ) : null}
                </div>

                <div className="flex flex-wrap gap-2">
                    <label className="mb-1 block text-xs font-medium text-gray-600 mt-auto mb-auto mr-[13px]">To</label>
                    <input
                        type="text"
                        inputMode="text"
                        autoComplete="off"
                        spellCheck={false}
                        disabled={disabled}
                        value={toValue}
                        onChange={(e) => {
                            const next = e.target.value;
                            setToValue(next);
                            emit(fromValue, next);
                        }}
                        placeholder="YYYY-MM-DDTHH:mm:ss.sssZ"
                        aria-label="To timestamp (ISO)"
                        className={[
                            "w-auto rounded border bg-white px-4 py-2 text-left text-sm flex-grow",
                            "text-gray-900 shadow-sm",
                            "focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400",
                            "disabled:cursor-not-allowed disabled:opacity-60",
                            toOk ? "border-gray-300" : "border-red-300",
                            inputClassName,
                        ]
                            .filter(Boolean)
                            .join(" ")}
                    />
                    {!toOk ? <p className="mt-1 text-xs text-red-600">Enter a valid ISO timestamp.</p> : null}
                </div>
            </div>
        </div>
    );
};

export default TimeRange;