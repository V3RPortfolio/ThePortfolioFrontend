import type React from "react";
import { useMemo } from "react";

export interface PaginationProps {
    pagination: {
        pageNumber: number;
        isActive?: boolean;
    }[];
    paginationHandler?: (pageNumber: number) => void;
    totalPages?: number;
}

const Pagination: React.FC<PaginationProps> = ({ pagination, paginationHandler, totalPages }) => {
    const activePage = useMemo(() => {
        const activePageObj = pagination.find((p) => p.isActive);
        return activePageObj ? activePageObj.pageNumber : 1;
    }, [pagination]);

    const displayedPagination = useMemo(() => {
        const maxDisplayed = 5;
        let startPage = Math.max(1, activePage - Math.floor(maxDisplayed / 2));
        const endPage = Math.min(totalPages || activePage, startPage + maxDisplayed - 1);

        if (endPage - startPage < maxDisplayed - 1) {
            startPage = Math.max(1, endPage - maxDisplayed + 1);
        }

        const pages = [];
        for (let i = startPage; i <= endPage; i++) {
            pages.push({ pageNumber: i, isActive: i === activePage });
        }
        return pages;
    }, [activePage, totalPages]);

    if (displayedPagination.length === 0) return null;

    return (
        <div
            className="flex items-center justify-between px-5 py-3"
            style={{ borderTop: "1px solid var(--color-border)" }}
        >
            {/* Results summary */}
            <span className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                Page {activePage} of {totalPages || pagination.length}
            </span>

            {/* Page buttons */}
            <div className="flex items-center gap-1">
                {/* Previous */}
                <button
                    disabled={activePage === pagination[0]?.pageNumber}
                    onClick={() => {
                        const idx = pagination.findIndex((p) => p.pageNumber === activePage);
                        if (idx > 0 && paginationHandler) paginationHandler(pagination[idx - 1].pageNumber);
                    }}
                    className="flex items-center justify-center w-8 h-8 rounded text-xs font-medium transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{
                        border: "1px solid var(--color-border)",
                        color: "var(--color-text-secondary)",
                        borderRadius: "var(--border-radius-base)",
                    }}
                >
                    ‹
                </button>

                {/* Page numbers */}
                {displayedPagination.map(({ pageNumber, isActive }) => (
                    <button
                        key={pageNumber}
                        onClick={() => paginationHandler?.(pageNumber)}
                        className="flex items-center justify-center w-8 h-8 text-xs font-semibold transition-all cursor-pointer"
                        style={{
                            backgroundColor: isActive
                                ? "var(--color-primary-600)"
                                : "transparent",
                            color: isActive
                                ? "var(--color-white)"
                                : "var(--color-text-secondary)",
                            border: `1px solid ${isActive ? "var(--color-primary-600)" : "var(--color-border)"}`,
                            borderRadius: "var(--border-radius-base)",
                        }}
                    >
                        {pageNumber}
                    </button>
                ))}

                {/* Next */}
                <button
                    disabled={activePage === pagination[pagination.length - 1]?.pageNumber}
                    onClick={() => {
                        const idx = pagination.findIndex((p) => p.pageNumber === activePage);
                        if (idx < pagination.length - 1 && paginationHandler) paginationHandler(pagination[idx + 1].pageNumber);
                    }}
                    className="flex items-center justify-center w-8 h-8 rounded text-xs font-medium transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{
                        border: "1px solid var(--color-border)",
                        color: "var(--color-text-secondary)",
                        borderRadius: "var(--border-radius-base)",
                    }}
                >
                    ›
                </button>
            </div>
        </div>
    );
};

export default Pagination;
