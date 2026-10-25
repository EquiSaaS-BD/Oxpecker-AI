"use client";

import React from "react";

interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
  rounded?: string;
}

/**
 * Base Atomic Skeleton Element with smooth, lightweight shimmer animation
 */
export function Skeleton({
  className = "",
  width,
  height,
  rounded = "rounded-md",
}: SkeletonProps) {
  return (
    <div
      className={`skeleton-shimmer select-none ${rounded} ${className}`}
      style={{
        width: width,
        height: height,
      }}
    />
  );
}

/**
 * Specialized Skeleton for Typography / Table Cells
 * Default: height h-3.5, width w-24
 */
export function SkeletonText({
  width = "w-24",
  height = "h-3.5",
  className = "",
}: {
  width?: string;
  height?: string;
  className?: string;
}) {
  return <Skeleton className={`${width} ${height} rounded ${className}`} />;
}

/**
 * Specialized Skeleton for Big Numbers (e.g. 28, 84%)
 * Exact Dimensions: w-20 h-9 rounded-lg
 */
export function SkeletonNumber({
  width = "w-20",
  height = "h-9",
  className = "",
}: {
  width?: string;
  height?: string;
  className?: string;
}) {
  return <Skeleton className={`${width} ${height} rounded-lg ${className}`} />;
}

/**
 * Specialized Skeleton for Monetary Amounts (e.g. BDT 1,450,000)
 * Exact Dimensions: w-32 h-8 rounded-lg
 */
export function SkeletonAmount({
  width = "w-32",
  height = "h-8",
  className = "",
}: {
  width?: string;
  height?: string;
  className?: string;
}) {
  return <Skeleton className={`${width} ${height} rounded-lg ${className}`} />;
}

/**
 * Specialized Skeleton for Pill Badges (e.g. "Active", "Paid", "Pending")
 * Exact Dimensions: w-16 h-5 rounded-full
 */
export function SkeletonBadge({
  width = "w-16",
  height = "h-5",
  className = "",
}: {
  width?: string;
  height?: string;
  className?: string;
}) {
  return <Skeleton className={`${width} ${height} rounded-full ${className}`} />;
}

/**
 * Specialized Skeleton for User Avatars & Circle Indicators
 * Exact Dimensions: w-9 h-9 or w-10 h-10 rounded-full
 */
export function SkeletonAvatar({
  size = "w-9 h-9",
  className = "",
}: {
  size?: string;
  className?: string;
}) {
  return <Skeleton className={`${size} rounded-full shrink-0 ${className}`} />;
}

/**
 * Metric Card Skeleton (Matches Dashboard Top 4 Cards Exactly: h-[148px])
 * Zero Layout Shift (CLS = 0)
 */
export function MetricCardSkeleton({ borderLeftColor = "border-l-blue-600" }: { borderLeftColor?: string }) {
  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200/90 border-l-4 ${borderLeftColor} p-5 shadow-xs flex flex-col justify-between h-[148px]`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <div className="space-y-1.5">
            <SkeletonText width="w-24" height="h-3" />
            <SkeletonBadge width="w-16" height="h-4" />
          </div>
        </div>
      </div>
      <div className="pt-3 border-t border-slate-100 flex items-baseline justify-between">
        <SkeletonNumber width="w-20" height="h-8" />
        <SkeletonText width="w-12" height="h-3" />
      </div>
    </div>
  );
}

/**
 * Dual-Bar Telemetry Chart Skeleton (Matches Admissions & Discharges Chart Exactly)
 */
export function ChartBarsSkeleton() {
  const barHeights = [45, 65, 55, 80, 95, 40, 35];

  return (
    <div className="h-64 sm:h-72 w-full pt-6 flex items-end gap-3 sm:gap-6">
      {barHeights.map((h, i) => (
        <div key={i} className="flex-1 h-full flex flex-col items-center justify-end gap-2">
          <div className="w-full h-full flex items-end justify-center gap-1.5">
            <div
              className="w-1/2 bg-slate-200/60 rounded-t-md skeleton-shimmer"
              style={{ height: `${h}%` }}
            />
            <div
              className="w-1/2 bg-slate-100/80 rounded-t-md skeleton-shimmer"
              style={{ height: `${Math.round(h * 0.65)}%` }}
            />
          </div>
          <SkeletonText width="w-8" height="h-3" />
        </div>
      ))}
    </div>
  );
}

/**
 * Single-Line Table Row Skeleton
 * Exact Dimensions: h-14, matching table layout precisely
 */
export function TableRowSkeleton({ columnCount = 7 }: { columnCount?: number }) {
  return (
    <tr className="border-b border-slate-100 h-14">
      <td className="py-4 px-6">
        <div className="flex items-center gap-3">
          <SkeletonAvatar size="w-9 h-9" />
          <div className="space-y-1.5">
            <SkeletonText width="w-28" height="h-3.5" />
            <SkeletonText width="w-16" height="h-2.5" />
          </div>
        </div>
      </td>
      <td className="py-4 px-6">
        <SkeletonText width="w-20" height="h-4" />
      </td>
      <td className="py-4 px-6">
        <SkeletonBadge width="w-20" height="h-6" />
      </td>
      <td className="py-4 px-6">
        <SkeletonText width="w-32" height="h-3.5" />
      </td>
      <td className="py-4 px-6">
        <SkeletonText width="w-20" height="h-3.5" />
      </td>
      <td className="py-4 px-6">
        <SkeletonBadge width="w-20" height="h-6" />
      </td>
      <td className="py-4 px-6 text-right">
        <Skeleton className="w-16 h-7 rounded-lg inline-block" />
      </td>
    </tr>
  );
}

/**
 * 11-Column Booking Table Row Skeleton
 * Exact 1:1 match for Inpatient Reservation & Pipeline Clearance Table
 */
export function BookingTableRowSkeleton() {
  return (
    <tr className="border-b border-slate-100 h-14 whitespace-nowrap">
      {/* 1. Booking ID */}
      <td className="py-3.5 px-4">
        <SkeletonText width="w-16" height="h-3.5" />
      </td>
      {/* 2. Check-In Date */}
      <td className="py-3.5 px-4">
        <SkeletonText width="w-20" height="h-3.5" />
      </td>
      {/* 3. Patient Name */}
      <td className="py-3.5 px-4">
        <div className="flex items-center gap-2">
          <SkeletonAvatar size="w-7 h-7" />
          <SkeletonText width="w-28" height="h-3.5" />
        </div>
      </td>
      {/* 4. Phone */}
      <td className="py-3.5 px-4">
        <SkeletonText width="w-24" height="h-3.5" />
      </td>
      {/* 5. Allocated Suite */}
      <td className="py-3.5 px-4">
        <div className="flex items-center gap-1.5">
          <SkeletonBadge width="w-14" height="h-5" />
          <SkeletonText width="w-16" height="h-3.5" />
        </div>
      </td>
      {/* 6. Duration */}
      <td className="py-3.5 px-4">
        <SkeletonText width="w-12" height="h-3.5" />
      </td>
      {/* 7. Total Billed */}
      <td className="py-3.5 px-4">
        <SkeletonText width="w-18" height="h-4" />
      </td>
      {/* 8. Paid / Deposit (Blue) */}
      <td className="py-3.5 px-4 bg-blue-50/20">
        <SkeletonBadge width="w-22" height="h-6" />
      </td>
      {/* 9. Pending Due (Yellow) */}
      <td className="py-3.5 px-4 bg-amber-50/20">
        <SkeletonBadge width="w-22" height="h-6" />
      </td>
      {/* 10. Status */}
      <td className="py-3.5 px-4">
        <SkeletonBadge width="w-20" height="h-6" />
      </td>
      {/* 11. Action */}
      <td className="py-3.5 px-4 text-right">
        <Skeleton className="w-24 h-8 rounded-xl inline-block" />
      </td>
    </tr>
  );
}

/**
 * Full Dossier Skeleton for Inpatient Clearance Dossier Page
 */
export function InpatientDossierSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left Column Skeleton */}
      <div className="lg:col-span-5 space-y-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex justify-between pb-3 border-b border-slate-100">
            <SkeletonText width="w-36" height="h-3" />
            <SkeletonBadge width="w-24" height="h-4" />
          </div>
          <div className="flex items-center gap-3.5">
            <Skeleton className="w-13 h-13 rounded-2xl" />
            <div className="space-y-1.5">
              <SkeletonText width="w-36" height="h-4" />
              <SkeletonText width="w-24" height="h-3" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <SkeletonText width="w-full" height="h-7" />
            <SkeletonText width="w-full" height="h-7" />
            <SkeletonText width="w-full" height="h-7" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex justify-between pb-3 border-b border-slate-100">
            <SkeletonText width="w-32" height="h-3" />
            <SkeletonText width="w-20" height="h-3" />
          </div>
          <Skeleton className="w-full aspect-video rounded-xl" />
          <div className="space-y-1.5">
            <SkeletonText width="w-48" height="h-4" />
            <SkeletonText width="w-32" height="h-3" />
          </div>
        </div>
      </div>

      {/* Right Column Skeleton */}
      <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex justify-between pb-4 border-b border-slate-100">
          <div className="space-y-1.5">
            <SkeletonText width="w-56" height="h-5" />
            <SkeletonText width="w-72" height="h-3" />
          </div>
          <SkeletonBadge width="w-28" height="h-6" />
        </div>

        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="p-3.5 rounded-xl border border-slate-200/90 bg-slate-50/50 flex justify-between items-center">
              <div className="space-y-1">
                <SkeletonText width="w-44" height="h-3.5" />
                <SkeletonText width="w-64" height="h-2.5" />
              </div>
              <SkeletonNumber width="w-24" height="h-7" />
            </div>
          ))}
        </div>

        <Skeleton className="w-full h-32 rounded-2xl" />
      </div>
    </div>
  );
}

