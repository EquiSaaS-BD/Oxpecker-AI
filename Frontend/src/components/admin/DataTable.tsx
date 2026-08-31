"use client";

import { useState } from "react";
import { ChevronDown, Search, ArrowUpDown, Filter, MoreHorizontal } from "lucide-react";
import { motion } from "framer-motion";

interface Column<T> {
  key: keyof T | "actions";
  title: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  searchable?: boolean;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  actions?: (item: T) => React.ReactNode;
}

export function DataTable<T extends { id: string | number }>({
  columns,
  data,
  searchable = true,
  searchPlaceholder = "Search...",
  onSearch,
  actions
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: keyof T; direction: "asc" | "desc" } | null>(null);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (onSearch) onSearch(val);
  };

  const handleSort = (key: keyof T) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Local filtering if onSearch is not provided
  let displayData = [...data];
  if (searchQuery && !onSearch) {
    const lowerQuery = searchQuery.toLowerCase();
    displayData = displayData.filter((item) => {
      return Object.values(item).some(
        (val) => val && String(val).toLowerCase().includes(lowerQuery)
      );
    });
  }

  // Local sorting
  if (sortConfig) {
    displayData.sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }

  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-300 overflow-hidden shadow-xl">
      {/* Table Toolbar */}
      {searchable && (
        <div className="p-4 border-b border-slate-300 flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-800/50">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder={searchPlaceholder}
              className="w-full h-[40px] pl-10 pr-4 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button className="flex items-center gap-2 h-[40px] px-4 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-sm font-medium text-slate-600 border border-slate-600 transition-colors">
              <Filter size={16} />
              Filter
            </button>
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-white/50 border-b border-slate-300">
              {columns.map((col, i) => (
                <th 
                  key={String(col.key)}
                  className="px-6 py-4 text-xs font-bold tracking-wider text-slate-500 uppercase select-none"
                >
                  <div 
                    className={`flex items-center gap-2 ${col.sortable ? 'cursor-pointer hover:text-slate-600' : ''}`}
                    onClick={() => col.sortable && handleSort(col.key as keyof T)}
                  >
                    {col.title}
                    {col.sortable && <ArrowUpDown size={14} className="opacity-50" />}
                  </div>
                </th>
              ))}
              {actions && (
                <th className="px-6 py-4 text-xs font-bold tracking-wider text-slate-500 uppercase text-right">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {displayData.length > 0 ? (
              displayData.map((item, i) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.05 }}
                  key={item.id} 
                  className="hover:bg-slate-700/30 transition-colors group"
                >
                  {columns.map((col) => (
                    <td key={String(col.key)} className="px-6 py-4 text-sm text-slate-600">
                      {col.render ? col.render(item) : String(item[col.key as keyof T] || "-")}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-6 py-4 text-right">
                      {actions(item)}
                    </td>
                  )}
                </motion.tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="px-6 py-12 text-center text-slate-500 text-sm font-medium">
                  No data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-slate-300 bg-slate-800/50 flex items-center justify-between text-sm text-slate-500">
        <div>Showing <span className="font-bold text-slate-700">{displayData.length}</span> results</div>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 rounded-md bg-slate-700 hover:bg-slate-600 text-slate-700 transition-colors disabled:opacity-50">Prev</button>
          <button className="px-3 py-1.5 rounded-md bg-slate-700 hover:bg-slate-600 text-slate-700 transition-colors disabled:opacity-50">Next</button>
        </div>
      </div>
    </div>
  );
}
