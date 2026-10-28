"use client";

import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend } from "chart.js";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";

ChartJS.register(ArcElement, ChartTooltip, Legend);

interface VisualizationProps {
  bedData?: { label: string; count: number }[];
  telemetryStreamUrl?: string;
}

export function AdvancedVisualizations({
  bedData = [
    { label: "ICU", count: 18 },
    { label: "CCU", count: 12 },
    { label: "General Ward", count: 65 },
    { label: "Emergency", count: 24 },
  ],
  telemetryStreamUrl = "https://grafana.oxpecker.equisaas-bd.com/d-solo/clinical-triage",
}: VisualizationProps) {
  const d3Container = useRef<SVGSVGElement | null>(null);
  const chartCanvas = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<ChartJS | null>(null);

  // 1. D3.js Data-Driven Triage Severity Hierarchy
  useEffect(() => {
    if (!d3Container.current) return;

    const svg = d3.select(d3Container.current);
    svg.selectAll("*").remove();

    const width = 360;
    const height = 180;
    const data = [
      { name: "Emergency (Red)", val: 35, color: "#ef4444" },
      { name: "Urgent (Yellow)", val: 45, color: "#f59e0b" },
      { name: "Routine (Green)", val: 75, color: "#10b981" },
    ];

    const x = d3.scaleBand().range([30, width - 20]).domain(data.map((d) => d.name)).padding(0.3);
    const y = d3.scaleLinear().domain([0, 80]).range([height - 30, 20]);

    svg.append("g")
      .attr("transform", `translate(0,${height - 30})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .style("font-size", "10px")
      .style("fill", "#64748b");

    svg.selectAll("bars")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", (d) => x(d.name) || 0)
      .attr("y", (d) => y(d.val))
      .attr("width", x.bandwidth())
      .attr("height", (d) => height - 30 - y(d.val))
      .attr("fill", (d) => d.color)
      .attr("rx", 6);
  }, []);

  // 2. Chart.js Inpatient Bed Allocation Donut
  useEffect(() => {
    if (!chartCanvas.current) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartCanvas.current.getContext("2d");
    if (!ctx) return;

    chartInstance.current = new ChartJS(ctx, {
      type: "doughnut",
      data: {
        labels: bedData.map((d) => d.label),
        datasets: [
          {
            data: bedData.map((d) => d.count),
            backgroundColor: ["#3b82f6", "#6366f1", "#10b981", "#f43f5e"],
            borderWidth: 2,
            borderColor: "#ffffff",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "bottom", labels: { boxWidth: 12, font: { size: 10 } } },
        },
      },
    });

    return () => {
      if (chartInstance.current) chartInstance.current.destroy();
    };
  }, [bedData]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
      {/* Visual 1: Chart.js */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-col items-center">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Chart.js • Inpatient Capacity
        </h4>
        <div className="h-44 w-full relative">
          <canvas ref={chartCanvas} />
        </div>
      </div>

      {/* Visual 2: D3.js */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-col items-center">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          D3.js • Triage Severity Distribution
        </h4>
        <svg ref={d3Container} className="w-full h-44" />
      </div>

      {/* Visual 3: Grafana Live Telemetry Monitor */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Grafana • Azure Live Metrics
          </h4>
          <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
          </span>
        </div>
        <div className="h-44 w-full rounded-xl bg-slate-900 text-slate-300 p-3 font-mono text-[11px] flex flex-col justify-between overflow-hidden border border-slate-800">
          <div className="flex justify-between border-b border-slate-800 pb-1.5">
            <span className="text-slate-400">Prometheus Telemetry:</span>
            <span className="text-sky-400">az-eastasia-vm-prod</span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span>Token Latency (P99):</span>
              <span className="text-emerald-400">42ms</span>
            </div>
            <div className="flex justify-between">
              <span>Active Gate Passes:</span>
              <span className="text-indigo-400">142 verified</span>
            </div>
            <div className="flex justify-between">
              <span>Bed Sync Stream:</span>
              <span className="text-emerald-400">0.02s jitter</span>
            </div>
          </div>
          <div className="pt-1.5 border-t border-slate-800 text-[10px] text-slate-500 flex justify-between">
            <span>Grafana Cloud Agent</span>
            <span>v10.4.1</span>
          </div>
        </div>
      </div>
    </div>
  );
}
