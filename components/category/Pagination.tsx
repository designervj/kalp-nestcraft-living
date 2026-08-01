"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

/* ─── Pagination Component ──────────────────────────────── */
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  onItemsPerPageChange: (items: number) => void;
}

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  onItemsPerPageChange,
}: PaginationProps) => {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-12 pt-8 border-t border-border">
      {/* Items per page selector */}
      <div className="flex items-center gap-3">
        <span className="text-[11px] font-black uppercase tracking-[1px] text-muted whitespace-nowrap">
          Show:
        </span>
        <select
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          className="h-10 px-4 rounded-xl border border-border bg-surface font-bold text-sm outline-none focus:border-secondary cursor-pointer"
        >
          <option value={9}>9 per page</option>
          <option value={12}>12 per page</option>
          <option value={24}>24 per page</option>
          <option value={48}>48 per page</option>
        </select>
      </div>

      {/* Page numbers */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="h-10 w-10 flex items-center justify-center rounded-xl border border-border bg-surface font-bold text-sm hover:bg-secondary hover:text-white hover:border-secondary transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-surface disabled:hover:text-foreground"
        >
          <ChevronLeft size={18} />
        </button>

        {getPageNumbers().map((page, idx) =>
          page === "..." ? (
            <span
              key={`ellipsis-${idx}`}
              className="h-10 w-10 flex items-center justify-center text-muted font-bold"
            >
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page as number)}
              className={`h-10 w-10 flex items-center justify-center rounded-xl border font-bold text-sm transition-all ${
                currentPage === page
                  ? "bg-secondary text-white border-secondary"
                  : "border-border bg-surface hover:bg-secondary hover:text-white hover:border-secondary"
              }`}
            >
              {page}
            </button>
          ),
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="h-10 w-10 flex items-center justify-center rounded-xl border border-border bg-surface font-bold text-sm hover:bg-secondary hover:text-white hover:border-secondary transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-surface disabled:hover:text-foreground"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Page info */}
      <div className="text-[11px] font-black uppercase tracking-[1px] text-muted">
        Page {currentPage} of {totalPages}
      </div>
    </div>
  );
};

export default Pagination;
