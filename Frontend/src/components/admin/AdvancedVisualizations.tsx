"use client";

import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend } from "chart.js";
import { Activity, BedDouble, Server, Radio } from "lucide-react";

ChartJS.register(ArcElement, ChartTooltip, Legend);

interface VisualizationProps {
  bedData?: { label: string; count: number }[];
  telemetryStreamUrl?: string;
}

export function AdvancedVisualizations({
  bedData = [
    { label: "ICU Beds", count: 18 },
    { label: "CCU Units", count: 12 },
    { label: "General Ward", count: 65 },
    { label: "Emergency Trauma", count: 24 },
  ],
}: VisualizationProps) {
  const d3Container = useRef<SVGSVGElement | null>(null);
  const chartCanvas = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<ChartJS | null>(null);

  // 1. D3.js Data-Driven Triage Severity Hierarchy
  useEffect(() => {
    if (!d3Container.current) return;

    const svg = d3.select(d3Container.current);
    svg.selectAll("*").remove();

    const width = 340;
    const height = 180;
    const data = [
      { name: "Emergency (Red)", val: 35, color: "#e11d48" },
      { name: "Urgent (Yellow)", val: 45, color: "#d97706" },
      { name: "Routine (Green)", val: 75, color: "#059669" },
    ];

    const x = d3.scaleBand().range([25, width - 20]).domain(data.map((d) => d.name)).padding(0.35);
    const y = d3.scaleLinear().domain([0, 85]).range([height - 35, 15]);

    svg.append("g")
      .attr("transform", `translate(0,${height - 35})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .style("font-size", "10px")
      .style("font-weight", "bold")
      .style("fill", "#64748b");

    svg.selectAll("bars")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", (d) => x(d.name) || 0)
      .attr("y", (d) => y(d.val))
      .attr("width", x.bandwidth())
      .attr("height", (d) => height - 35 - y(d.val))
      .attr("fill", (d) => d.color)
      .attr("rx", 8);

    // Value Labels on top of bars
    svg.selectAll("text.label")
      .data(data)
      .enter()
      .append("text")
      .attr("x", (d) => (x(d.name) || 0) + x.bandwidth() / 2)
      .attr("y", (d) => y(d.val) - 5)
      .attr("text-anchor", "middle")
      .style("font-size", "11px")
      .style("font-weight", "800")
      .style("fill", "#0f172a")
      .text((d) => d.val);
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
            backgroundColor: ["#0284c7", "#4f46e5", "#059669", "#e11d48"],
            borderWidth: 3,
            borderColor: "#ffffff",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { 
            position: "bottom", 
            labels: { 
              boxWidth: 10, 
              font: { size: 10, weight: "bold" },
              color: "#334155" 
            } 
          },
        },
      },
    });

    return () => {
      if (chartInstance.current) chartInstance.current.destroy();
    };
  }, [bedData]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
      {/* Visual 1: Chart.js */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-lg flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] uppercase font-black tracking-widest text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-100 flex items-center gap-1">
            <BedDouble size={12} /> Chart.js Donut
          </span>
          <span className="text-xs font-black text-slate-900">119 Total Beds</span>
        </div>
        <h4 className="text-sm font-black text-slate-950 mb-3">
          Hospital Inpatient Capacity Allocation
        </h4>
        <div className="h-44 w-full relative">
          <canvas ref={chartCanvas} />
        </div>
      </div>

      {/* Visual 2: D3.js */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-lg flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] uppercase font-black tracking-widest text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1">
            <Activity size={12} /> D3.js Hierarchy
          </span>
          <span className="text-xs font-black text-emerald-600">Dynamic Scale</span>
        </div>
        <h4 className="text-sm font-black text-slate-950 mb-1">
          Triage Severity Distribution (NEWS2)
        </h4>
        <div className="w-full flex items-center justify-center">
          <svg ref={d3Container} className="w-full h-44" />
        </div>
      </div>

      {/* Visual 3: Grafana Live Telemetry Monitor */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col justify-between text-white">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-black tracking-widest text-indigo-400 bg-indigo-950/80 px-2.5 py-0.5 rounded-full border border-indigo-500/30 flex items-center gap-1">
              <Server size={12} /> Grafana Telemetry
            </span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
            </span>
          </div>
          <h4 className="text-sm font-black text-white mb-3">
            Microsoft Azure Microservices Health
          </h4>
        </div>

        <div className="w-full rounded-2xl bg-slate-900/90 text-slate-300 p-3.5 font-mono text-xs flex flex-col justify-between space-y-2 border border-slate-800 shadow-inner">
          <div className="flex justify-between border-b border-slate-800 pb-1 text-[11px]">
            <span className="text-slate-400">Prometheus Node:</span>
            <span className="text-sky-400 font-bold">az-eastasia-vm-prod</span>
          </div>
          <div className="space-y-1.5 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-400">P99 Inference Latency:</span>
              <span className="text-emerald-400 font-bold">42ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Verified Gate Passes:</span>
              <span className="text-indigo-400 font-bold">142 verified</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Emergency GPS Stream:</span>
              <span className="text-emerald-400 font-bold">0.02s jitter</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">PostgreSQL pgvector:</span>
              <span className="text-sky-400 font-bold">99.98% Pool Health</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}