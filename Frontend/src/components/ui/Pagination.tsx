"use client";

import React from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
  itemName?: string;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage = 21,
  itemName = "results",
  className = "",
}: PaginationProps) {
  if (totalPages <= 1 && (!totalItems || totalItems <= itemsPerPage)) {
    return null;
  }

  const startItem = totalItems !== undefined ? Math.min((currentPage - 1) * itemsPerPage + 1, totalItems) : null;
  const endItem = totalItems !== undefined ? Math.min(currentPage * itemsPerPage, totalItems) : null;

  // Generate page numbers with sliding window and ellipsis
  const getPageNumbers = (): (number | string)[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, "...", totalPages];
    }

    if (currentPage >= totalPages - 3) {
      return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }

    return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
  };

  const pages = getPageNumbers();

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    onPageChange(page);
  };

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 py-8 border-t border-slate-200/80 mt-10 ${className}`}>
      {/* Results Counter Text */}
      {totalItems !== undefined && (
        <div className="text-[13px] sm:text-[14px] text-slate-500 font-medium order-2 sm:order-1 text-center sm:text-left">
          Showing <span className="font-bold text-slate-800">{startItem}</span> -{" "}
          <span className="font-bold text-slate-800">{endItem}</span> of{" "}
          <span className="font-bold text-slate-900">{totalItems}</span> {itemName}
        </div>
      )}

      {/* Pagination Controls */}
      <nav 
        aria-label="Pagination"
        className="flex items-center gap-1.5 sm:gap-2 order-1 sm:order-2 flex-wrap justify-center"
      >
        {/* First Page Button (Optional on larger screens) */}
        {totalPages > 5 && (
          <button
            type="button"
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
            aria-label="First page"
            className="hidden md:inline-flex items-center justify-center w-10 h-10 rounded-[12px] border border-slate-200 bg-white text-slate-600 hover:text-sky-600 hover:border-sky-200 hover:bg-sky-50/50 disabled:opacity-40 disabled:pointer-events-none transition-all duration-150 cursor-pointer shadow-xs"
          >
            <ChevronsLeft size={16} />
          </button>
        )}

        {/* Previous Button */}
        <button
          type="button"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
          className="inline-flex items-center gap-1.5 px-3.5 h-10 rounded-[12px] border border-slate-200 bg-white text-[13px] font-semibold text-slate-700 hover:text-sky-600 hover:border-sky-200 hover:bg-sky-50/50 disabled:opacity-40 disabled:pointer-events-none transition-all duration-150 cursor-pointer shadow-xs"
        >
          <ChevronLeft size={16} />
          <span className="hidden sm:inline">Prev</span>
        </button>

        {/* Number Buttons */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {pages.map((p, idx) => {
            if (p === "...") {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="w-8 sm:w-10 h-10 flex items-center justify-center text-slate-400 font-semibold text-sm select-none"
                >
                  •••
                </span>
              );
            }

            const pageNum = p as number;
            const isActive = pageNum === currentPage;

            return (
              <button
                key={pageNum}
                type="button"
                onClick={() => handlePageChange(pageNum)}
                aria-current={isActive ? "page" : undefined}
                className={`w-9 sm:w-10 h-10 rounded-[12px] text-[13px] sm:text-[14px] font-bold transition-all duration-150 flex items-center justify-center cursor-pointer ${
                  isActive
                    ? "bg-sky-600 text-white shadow-md shadow-sky-600/25 border border-sky-600 scale-[1.03]"
                    : "bg-white border border-slate-200 text-slate-700 hover:text-sky-600 hover:border-sky-300 hover:bg-sky-50/40 shadow-xs"
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          type="button"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next page"
          className="inline-flex items-center gap-1.5 px-3.5 h-10 rounded-[12px] border border-slate-200 bg-white text-[13px] font-semibold text-slate-700 hover:text-sky-600 hover:border-sky-200 hover:bg-sky-50/50 disabled:opacity-40 disabled:pointer-events-none transition-all duration-150 cursor-pointer shadow-xs"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight size={16} />
        </button>

        {/* Last Page Button (Optional on larger screens) */}
        {totalPages > 5 && (
          <button
            type="button"
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
            aria-label="Last page"
            className="hidden md:inline-flex items-center justify-center w-10 h-10 rounded-[12px] border border-slate-200 bg-white text-slate-600 hover:text-sky-600 hover:border-sky-200 hover:bg-sky-50/50 disabled:opacity-40 disabled:pointer-events-none transition-all duration-150 cursor-pointer shadow-xs"
          >
            <ChevronsRight size={16} />
          </button>
        )}
      </nav>
    </div>
  );
}
