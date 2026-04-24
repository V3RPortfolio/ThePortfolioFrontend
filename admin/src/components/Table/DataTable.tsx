import type React from "react";
import Pagination from "../Pagination/Pagination";
import { useState } from "react";

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
    actions?: {name: string, handler: (row: TableData) => void, className?: string}[]; // Optional actions for each row, e.g., edit, delete
}

const DataTable:React.FC<DataTableProps> = ({ title, columns, data, pagination, paginationHandler, totalPages, clipLongText, onRowClick, actions }: DataTableProps) => {
    const rowsAreClickable = Boolean(onRowClick);


    const [clickedRowIndex, setClickedRowIndex] = useState<number | null>(null);


    const handleRowClick = (index:number) => {
        setClickedRowIndex(index);
        if(onRowClick) {
            onRowClick(data[index]);
        }
    }

    return (
        <div className="card overflow-hidden p-0">
            <h4 className="px-5 py-3 text-lg font-semibold" style={{color: "var(--color-text-primary)"}}>{title}</h4>
            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr style={{ backgroundColor: "var(--color-background-secondary)" }}>
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
                            {actions && actions.length > 0 && (
                                <th
                                    className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider whitespace-nowrap"
                                    style={{
                                        color: "var(--color-text-secondary)",
                                        borderBottom: "1px solid var(--color-border)",
                                    }}
                                >
                                    Actions
                                </th>
                            )}
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
                                                ? "var(--color-background-secondary)"
                                                : "var(--color-background)",
                                        border: clickedRowIndex === rowIndex ?
                                                "2px solid var(--color-primary-900)" :
                                                undefined,
                                        
                                    }}
                                    onClick={rowsAreClickable ? () => handleRowClick(rowIndex) : undefined}
                                    role={rowsAreClickable ? "button" : undefined}
                                    tabIndex={rowsAreClickable ? 0 : undefined}
                                    onKeyDown={
                                        rowsAreClickable
                                            ? (e) => {
                                                  if (e.key === "Enter" || e.key === " ") {
                                                      e.preventDefault();
                                                      handleRowClick(rowIndex);
                                                  }
                                              }
                                            : undefined
                                    }
                                    // onMouseEnter={
                                    //     rowsAreClickable
                                    //         ? (e) =>
                                    //               (e.currentTarget.style.backgroundColor =
                                    //                   "var(--color-primary-50)")
                                    //         : undefined
                                    // }
                                    // onMouseLeave={
                                    //     rowsAreClickable
                                    //         ? (e) =>
                                    //               (e.currentTarget.style.backgroundColor =
                                    //                   rowIndex % 2 !== 0
                                    //                       ? "var(--color-background-secondary)"
                                    //                         : "var(--color-background)")
                                    //         : undefined
                                    // }
                                >
                                    {columns.map((col) => (
                                        <td
                                            key={col.key}
                                            className="px-5 py-3 text-sm whitespace-nowrap"
                                            style={{ color: rowIndex % 2 == 0 ? "var(--color-text-primary)" : "var(--color-text-secondary)" }}
                                        >
                                            <span
                                            className={`${clipLongText ? "block max-w-xs truncate" : ""} ${rowsAreClickable ? "group-hover:underline underline-offset-2" : ""}`}
                                            title={row[col.key] ? String(row[col.key]) : undefined}
                                            >{row[col.key] ?? "—"}</span>
                                        </td>
                                    ))}
                                    {actions && actions.length > 0 && (
                                        <td className="px-5 py-3 text-sm whitespace-nowrap">
                                            <div className="flex flex-wrap items-center gap-2">
                                                {actions.map((action, actionIndex) => (
                                                    <button
                                                        key={actionIndex}
                                                        className={'w-full md:w-auto ' + (action.className || 'btn btn-primary btn-small')}
                                                        onClick={(e) => {
                                                            e.stopPropagation(); // Prevent row click
                                                            action.handler(row);
                                                            handleRowClick(rowIndex); // Set clicked row index for visual feedback
                                                        }}
                                                    >
                                                        {action.name}
                                                    </button>
                                                ))}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <Pagination
                pagination={pagination}
                paginationHandler={paginationHandler}
                totalPages={totalPages}
            />
        </div>
    );
};

export default DataTable;