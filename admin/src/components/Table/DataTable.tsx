import type React from "react";
import { useEffect, useState } from "react";

type TableData = { [key: string]: any}; // Generic type for table data, can be extended with specific fields as needed
interface DataTableProps {
    title: string;
    columns: { name: string; key: string }[];
    data: TableData[]; // You can replace 'any' with a more specific type based on your data structure
    pagination: {
        pageNumber: number;
        isActive?: boolean;
    }[];
    paginationHandler?: (pageNumber:number) => void; // Optional click handler for page buttons
    totalPages?: number; // Optional total pages for better pagination control
    clipLongText?: boolean; // Optional prop to enable text clipping in cells
    onRowClick?: (row: TableData) => void; // Optional click handler for table rows
}

const DataTable:React.FC<DataTableProps> = ({ title, columns, data, pagination, paginationHandler, totalPages, clipLongText, onRowClick }: DataTableProps) => {
    const [activePage, setActivePage] = useState<number>(1);
    const [displayedPagination, setDisplayedPagination] = useState<{ pageNumber: number; isActive?: boolean }[]>([]);
    const rowsAreClickable = Boolean(onRowClick);
    const handlePageClick = (pageNumber: number) => {
        setActivePage(pageNumber);
        if (paginationHandler) {
            paginationHandler(pageNumber);
        }
    };

    useEffect(() => {
        // Set active page
        const activePageObj = pagination.find((p) => p.isActive);
        if (activePageObj) {
            setActivePage(activePageObj.pageNumber);
        }

        // Set the list of displayed page - show max 5 page numbers at a time for better UX
        const maxDisplayed = 5;
        let startPage = Math.max(1, activePage - Math.floor(maxDisplayed / 2));
        let endPage = Math.min(totalPages || activePage, startPage + maxDisplayed - 1);

        // Adjust startPage if we are near the end
        if (endPage - startPage < maxDisplayed - 1) {
            startPage = Math.max(1, endPage - maxDisplayed + 1);
        }

        const newPagination = [];
        for (let i = startPage; i <= endPage; i++) {
            newPagination.push({ pageNumber: i, isActive: i === activePage });
        }
        setDisplayedPagination(newPagination);
    }, [pagination, activePage, totalPages]);

    return (
        <div className="card overflow-hidden p-0">
            <h4 className="px-5 py-3 text-lg font-semibold" style={{color: "var(--color-text-primary)"}}>{title}</h4>
            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr style={{ backgroundColor: "var(--color-gray-100)" }}>
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider whitespace-nowrap"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                        borderBottom: "1px solid var(--color-border)",
                                    }}
                                >
                                    {col.name}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={columns.length}
                                    className="text-center py-12 text-sm"
                                    style={{ color: "var(--color-text-secondary)" }}
                                >
                                    No data available
                                </td>
                            </tr>
                        ) : (
                            data.map((row, rowIndex) => (
                                <tr
                                    key={rowIndex}
                                    className={`group transition-colors duration-150 ${rowsAreClickable ? "cursor-pointer" : ""}`}
                                    style={{
                                        borderBottom:
                                            rowIndex < data.length - 1
                                                ? "1px solid var(--color-border)"
                                                : "none",
                                        backgroundColor:
                                            rowIndex % 2 !== 0
                                                ? "var(--color-gray-50)"
                                                : "transparent",
                                    }}
                                    onClick={rowsAreClickable ? () => onRowClick?.(row) : undefined}
                                    role={rowsAreClickable ? "button" : undefined}
                                    tabIndex={rowsAreClickable ? 0 : undefined}
                                    onKeyDown={
                                        rowsAreClickable
                                            ? (e) => {
                                                  if (e.key === "Enter" || e.key === " ") {
                                                      e.preventDefault();
                                                      onRowClick?.(row);
                                                  }
                                              }
                                            : undefined
                                    }
                                    onMouseEnter={
                                        rowsAreClickable
                                            ? (e) =>
                                                  (e.currentTarget.style.backgroundColor =
                                                      "var(--color-primary-50)")
                                            : undefined
                                    }
                                    onMouseLeave={
                                        rowsAreClickable
                                            ? (e) =>
                                                  (e.currentTarget.style.backgroundColor =
                                                      rowIndex % 2 !== 0
                                                          ? "var(--color-gray-50)"
                                                          : "transparent")
                                            : undefined
                                    }
                                >
                                    {columns.map((col) => (
                                        <td
                                            key={col.key}
                                            className="px-5 py-3 text-sm whitespace-nowrap"
                                            style={{ color: "var(--color-text-primary)" }}
                                        >
                                            <span
                                            className={`${clipLongText ? "block max-w-xs truncate" : ""} ${rowsAreClickable ? "group-hover:underline underline-offset-2" : ""}`}
                                            title={row[col.key] ? String(row[col.key]) : undefined}
                                            >{row[col.key] ?? "—"}</span>
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {displayedPagination.length > 0 && (
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
                                if (idx > 0) handlePageClick(pagination[idx - 1].pageNumber);
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
                        {displayedPagination.map(({ pageNumber, isActive }) => {
                            return (
                                <button
                                    key={pageNumber}
                                    onClick={() => handlePageClick(pageNumber)}
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
                            );
                        })}

                        {/* Next */}
                        <button
                            disabled={activePage === pagination[pagination.length - 1]?.pageNumber}
                            onClick={() => {
                                const idx = pagination.findIndex((p) => p.pageNumber === activePage);
                                if (idx < pagination.length - 1) handlePageClick(pagination[idx + 1].pageNumber);
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
            )}
        </div>
    );
};

export default DataTable;