import React, { useEffect, useMemo, useRef } from 'react';
import * as d3 from 'd3';
import { Clock, Flame, Sigma, Zap } from 'lucide-react';
import { getLocalDateKey } from '../game/dailyMissions';
import { ProgressStore } from '../game/types';

interface StatsD3ChartsProps {
  progress: ProgressStore;
}

interface DayPoint {
  dateKey: string;
  label: string;
  solved: number;
  minutes: number;
  streakActive: boolean;
}

const SHORT_DAYS_ID = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

function buildTrailing7Days(progress: ProgressStore): DayPoint[] {
  const historyMap = new Map(
    (progress.stats.dailyHistory ?? []).map((item) => [item.dateKey, item])
  );
  const today = new Date();
  const todayKey = getLocalDateKey(today);
  const points: DayPoint[] = [];

  for (let offset = 6; offset >= 0; offset--) {
    const d = new Date(today);
    d.setDate(today.getDate() - offset);
    const key = getLocalDateKey(d);
    const rec = historyMap.get(key);
    const isToday = key === todayKey;

    let solved = rec?.solved ?? 0;
    let timeSec = rec?.timeSpentSec ?? 0;

    if (isToday) {
      solved = Math.max(solved, progress.daily?.stagesToday ?? 0);
      if (timeSec === 0 && (progress.stats.totalTimeSpentSec ?? 0) > 0 && historyMap.size === 0) {
        timeSec = progress.stats.totalTimeSpentSec ?? 0;
      }
    }

    points.push({
      dateKey: key,
      label: isToday ? 'Hari Ini' : SHORT_DAYS_ID[d.getDay()],
      solved,
      minutes: Number((timeSec / 60).toFixed(1)),
      streakActive: solved > 0 || Boolean(rec && rec.streakDay > 0),
    });
  }

  return points;
}

function formatTotalDuration(totalSec: number): string {
  const safe = Math.max(0, Math.round(totalSec));
  if (safe < 60) return `${safe} dtk`;
  const mins = Math.floor(safe / 60);
  const hrs = Math.floor(mins / 60);
  if (hrs > 0) {
    const remMins = mins % 60;
    return `${hrs}j ${remMins}m`;
  }
  return `${mins} mnt`;
}

export const StatsD3Charts: React.FC<StatsD3ChartsProps> = ({ progress }) => {
  const solvedSvgRef = useRef<SVGSVGElement | null>(null);
  const timeSvgRef = useRef<SVGSVGElement | null>(null);
  const streakSvgRef = useRef<SVGSVGElement | null>(null);

  const daysData = useMemo(() => buildTrailing7Days(progress), [progress]);

  const completedStages = Object.keys(progress.completed).length;
  const totalSolvedEquations = completedStages + progress.practiceSolved;
  const streakDays = progress.daily?.streakDays ?? 0;
  const totalTimeSpentSec = Math.max(
    progress.stats.totalTimeSpentSec ?? 0,
    (progress.stats.dailyHistory ?? []).reduce((s, d) => s + d.timeSpentSec, 0)
  );

  // Chart 1: D3 Bar + Trend Line Chart (Persamaan Tuntas / Hari)
  useEffect(() => {
    const svgEl = solvedSvgRef.current;
    if (!svgEl) return;

    const svg = d3.select(svgEl);
    svg.selectAll('*').remove();

    const width = 420;
    const height = 200;
    const margin = { top: 20, right: 18, bottom: 32, left: 34 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3
      .scaleBand<string>()
      .domain(daysData.map((d) => d.label))
      .range([0, innerW])
      .padding(0.32);

    const maxVal = Math.max(5, d3.max(daysData, (d) => d.solved) ?? 5);
    const y = d3.scaleLinear().domain([0, maxVal]).nice().range([innerH, 0]);

    // Horizontal dashed gridlines
    g.append('g')
      .attr('class', 'grid')
      .call(
        d3
          .axisLeft(y)
          .ticks(4)
          .tickSize(-innerW)
          .tickFormat(() => '')
      )
      .call((sel) => sel.select('.domain').remove())
      .call((sel) =>
        sel
          .selectAll('line')
          .attr('stroke', '#BAE6FD')
          .attr('stroke-dasharray', '4 4')
          .attr('stroke-opacity', 0.8)
      );

    // Axes
    g.append('g')
      .attr('transform', `translate(0,${innerH})`)
      .call(d3.axisBottom(x).tickSize(0))
      .call((sel) => sel.select('.domain').attr('stroke', '#7DD3FC'))
      .call((sel) =>
        sel
          .selectAll('text')
          .attr('fill', '#1E4E68')
          .attr('font-size', '10px')
          .attr('font-weight', '700')
          .attr('dy', '10px')
      );

    g.append('g')
      .call(d3.axisLeft(y).ticks(4).tickFormat(d3.format('d')))
      .call((sel) => sel.select('.domain').remove())
      .call((sel) => sel.selectAll('.tick line').remove())
      .call((sel) =>
        sel
          .selectAll('text')
          .attr('fill', '#35637A')
          .attr('font-size', '10px')
          .attr('font-weight', '700')
      );

    // Bars
    g.selectAll('rect.bar')
      .data(daysData)
      .join('rect')
      .attr('class', 'bar')
      .attr('x', (d) => x(d.label) ?? 0)
      .attr('y', (d) => y(d.solved))
      .attr('width', x.bandwidth())
      .attr('height', (d) => Math.max(2, innerH - y(d.solved)))
      .attr('rx', 6)
      .attr('fill', (_, i) => (i === daysData.length - 1 ? '#F59E0B' : '#0EA5E9'))
      .attr('opacity', (d) => (d.solved === 0 ? 0.25 : 0.92));

    // Smooth trend line overlay
    const lineGen = d3
      .line<DayPoint>()
      .x((d) => (x(d.label) ?? 0) + x.bandwidth() / 2)
      .y((d) => y(d.solved))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(daysData)
      .attr('fill', 'none')
      .attr('stroke', '#0D354C')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '4 3')
      .attr('d', lineGen);

    // Dots & numeric labels above bars
    g.selectAll('circle.dot')
      .data(daysData)
      .join('circle')
      .attr('cx', (d) => (x(d.label) ?? 0) + x.bandwidth() / 2)
      .attr('cy', (d) => y(d.solved))
      .attr('r', 3.5)
      .attr('fill', '#FEF08A')
      .attr('stroke', '#0D354C')
      .attr('stroke-width', 1.6);

    g.selectAll('text.val-label')
      .data(daysData)
      .join('text')
      .attr('x', (d) => (x(d.label) ?? 0) + x.bandwidth() / 2)
      .attr('y', (d) => y(d.solved) - 7)
      .attr('text-anchor', 'middle')
      .attr('fill', '#0D354C')
      .attr('font-size', '10px')
      .attr('font-weight', '800')
      .text((d) => (d.solved > 0 ? String(d.solved) : ''));
  }, [daysData]);

  // Chart 2: D3 Smooth Area + Line Chart (Waktu Belajar dalam Menit)
  useEffect(() => {
    const svgEl = timeSvgRef.current;
    if (!svgEl) return;

    const svg = d3.select(svgEl);
    svg.selectAll('*').remove();

    const width = 420;
    const height = 200;
    const margin = { top: 20, right: 18, bottom: 32, left: 38 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    const defs = svg.append('defs');
    const grad = defs
      .append('linearGradient')
      .attr('id', 'statsTimeGrad')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');
    grad.append('stop').attr('offset', '0%').attr('stop-color', '#14B8A6').attr('stop-opacity', 0.45);
    grad.append('stop').attr('offset', '100%').attr('stop-color', '#14B8A6').attr('stop-opacity', 0.03);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3
      .scalePoint<string>()
      .domain(daysData.map((d) => d.label))
      .range([0, innerW])
      .padding(0.4);

    const maxMin = Math.max(5, d3.max(daysData, (d) => d.minutes) ?? 5);
    const y = d3.scaleLinear().domain([0, maxMin]).nice().range([innerH, 0]);

    g.append('g')
      .call(
        d3
          .axisLeft(y)
          .ticks(4)
          .tickSize(-innerW)
          .tickFormat(() => '')
      )
      .call((sel) => sel.select('.domain').remove())
      .call((sel) =>
        sel
          .selectAll('line')
          .attr('stroke', '#CCFBF1')
          .attr('stroke-dasharray', '4 4')
      );

    g.append('g')
      .attr('transform', `translate(0,${innerH})`)
      .call(d3.axisBottom(x).tickSize(0))
      .call((sel) => sel.select('.domain').attr('stroke', '#5EEAD4'))
      .call((sel) =>
        sel
          .selectAll('text')
          .attr('fill', '#115E59')
          .attr('font-size', '10px')
          .attr('font-weight', '700')
          .attr('dy', '10px')
      );

    g.append('g')
      .call(d3.axisLeft(y).ticks(4))
      .call((sel) => sel.select('.domain').remove())
      .call((sel) => sel.selectAll('.tick line').remove())
      .call((sel) =>
        sel
          .selectAll('text')
          .attr('fill', '#0F766E')
          .attr('font-size', '10px')
          .attr('font-weight', '700')
      );

    const areaGen = d3
      .area<DayPoint>()
      .x((d) => x(d.label) ?? 0)
      .y0(innerH)
      .y1((d) => y(d.minutes))
      .curve(d3.curveMonotoneX);

    const lineGen = d3
      .line<DayPoint>()
      .x((d) => x(d.label) ?? 0)
      .y((d) => y(d.minutes))
      .curve(d3.curveMonotoneX);

    g.append('path').datum(daysData).attr('fill', 'url(#statsTimeGrad)').attr('d', areaGen);
    g.append('path')
      .datum(daysData)
      .attr('fill', 'none')
      .attr('stroke', '#0D9488')
      .attr('stroke-width', 2.8)
      .attr('d', lineGen);

    g.selectAll('circle.t-dot')
      .data(daysData)
      .join('circle')
      .attr('cx', (d) => x(d.label) ?? 0)
      .attr('cy', (d) => y(d.minutes))
      .attr('r', (_, i) => (i === daysData.length - 1 ? 5 : 3.5))
      .attr('fill', (_, i) => (i === daysData.length - 1 ? '#F59E0B' : '#14B8A6'))
      .attr('stroke', '#FFFFFF')
      .attr('stroke-width', 1.6);

    g.selectAll('text.t-label')
      .data(daysData)
      .join('text')
      .attr('x', (d) => x(d.label) ?? 0)
      .attr('y', (d) => y(d.minutes) - 8)
      .attr('text-anchor', 'middle')
      .attr('fill', '#115E59')
      .attr('font-size', '9.5px')
      .attr('font-weight', '800')
      .text((d) => (d.minutes > 0 ? `${d.minutes}m` : ''));
  }, [daysData]);

  // Chart 3: D3 Radial Arc Gauge for 7-Day Streak Progress
  useEffect(() => {
    const svgEl = streakSvgRef.current;
    if (!svgEl) return;

    const svg = d3.select(svgEl);
    svg.selectAll('*').remove();

    const size = 190;
    const cx = size / 2;
    const cy = size / 2;
    const innerR = 54;
    const outerR = 72;

    const g = svg.append('g').attr('transform', `translate(${cx},${cy})`);

    const clampedStreak = Math.min(7, Math.max(0, streakDays));
    const ratio = clampedStreak / 7;
    const startAngle = -Math.PI * 0.78;
    const endAngle = Math.PI * 0.78;
    const activeEnd = startAngle + (endAngle - startAngle) * ratio;

    const bgArc = d3
      .arc<unknown>()
      .innerRadius(innerR)
      .outerRadius(outerR)
      .startAngle(startAngle)
      .endAngle(endAngle)
      .cornerRadius(9);

    const fgArc = d3
      .arc<unknown>()
      .innerRadius(innerR)
      .outerRadius(outerR)
      .startAngle(startAngle)
      .endAngle(activeEnd)
      .cornerRadius(9);

    g.append('path').attr('d', bgArc({}) ?? '').attr('fill', '#E2E8F0');
    if (ratio > 0) {
      g.append('path')
        .attr('d', fgArc({}) ?? '')
        .attr('fill', clampedStreak >= 7 ? '#A855F7' : '#F59E0B');
    }

    // 7 milestone markers around outer ring
    for (let i = 1; i <= 7; i++) {
      const t = (i - 0.5) / 7;
      const a = startAngle + (endAngle - startAngle) * t - Math.PI / 2;
      const rDot = outerR + 11;
      const dx = Math.cos(a) * rDot;
      const dy = Math.sin(a) * rDot;
      const reached = clampedStreak >= i;
      g.append('circle')
        .attr('cx', dx)
        .attr('cy', dy)
        .attr('r', i === 7 ? 5.2 : 3.8)
        .attr('fill', reached ? '#F59E0B' : '#CBD5E1')
        .attr('stroke', '#FFFFFF')
        .attr('stroke-width', 1.2);
    }

    g.append('text')
      .attr('y', -4)
      .attr('text-anchor', 'middle')
      .attr('fill', '#0D354C')
      .attr('font-size', '26px')
      .attr('font-weight', '800')
      .text(`${clampedStreak}/7`);

    g.append('text')
      .attr('y', 16)
      .attr('text-anchor', 'middle')
      .attr('fill', '#64748B')
      .attr('font-size', '11px')
      .attr('font-weight', '700')
      .text('Hari Beruntun');
  }, [streakDays]);

  return (
    <div className="space-y-4">
      {/* Top 4 KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="rounded-2xl bg-[#EBF8FF] border-2 border-[#BAE6FD] p-3">
          <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-[#0369A1]">
            <Sigma className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>Persamaan Tuntas</span>
          </div>
          <div className="mt-1 font-display text-2xl font-extrabold text-[#0D354C] tabular-nums">
            {totalSolvedEquations}
          </div>
          <div className="text-[10px] font-semibold text-[#35637A] tabular-nums">
            {completedStages} Peta · {progress.practiceSolved} Acak
          </div>
        </div>

        <div className="rounded-2xl bg-[#FFFBEB] border-2 border-[#FDE68A] p-3">
          <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-[#B45309]">
            <Flame className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>Streak Harian</span>
          </div>
          <div className="mt-1 font-display text-2xl font-extrabold text-[#92400E] tabular-nums">
            {streakDays} Hari
          </div>
          <div className="text-[10px] font-semibold text-[#78350F] tabular-nums">
            Target 7 Hari Spesial
          </div>
        </div>

        <div className="rounded-2xl bg-[#F0FDFA] border-2 border-[#99F6E4] p-3">
          <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-[#0F766E]">
            <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>Waktu Bermain</span>
          </div>
          <div className="mt-1 font-display text-2xl font-extrabold text-[#115E59] tabular-nums">
            {formatTotalDuration(totalTimeSpentSec)}
          </div>
          <div className="text-[10px] font-semibold text-[#0F766E] tabular-nums">
            {progress.stats.totalTransposes}× pindah ruas
          </div>
        </div>

        <div className="rounded-2xl bg-[#FAF5FF] border-2 border-[#E9D5FF] p-3">
          <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-[#7E22CE]">
            <Zap className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>Nol Salah & Kilat</span>
          </div>
          <div className="mt-1 font-display text-2xl font-extrabold text-[#581C87] tabular-nums">
            {progress.stats.flawlessStageIds.length}
          </div>
          <div className="text-[10px] font-semibold text-[#6B21A8] tabular-nums">
            {progress.stats.speedsterCount}× Medali Speedster
          </div>
        </div>
      </div>

      {/* D3 Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        <div className="lg:col-span-5 rounded-2xl bg-[#F8FDFF] border-2 border-[#BAE6FD] p-3.5">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h3 className="font-display font-extrabold text-sm text-[#0D354C]">
              Persamaan Tuntas (7 Hari Terakhir)
            </h3>
            <span className="text-[10px] font-mono font-bold text-[#0284C7]">D3 Bar & Tren</span>
          </div>
          <p className="text-[11px] text-[#35637A] mb-2">
            Jumlah soal peta & latihan acak yang dituntaskan setiap hari.
          </p>
          <svg
            ref={solvedSvgRef}
            viewBox="0 0 420 200"
            className="w-full h-auto overflow-visible"
            role="img"
            aria-label="Grafik D3 jumlah persamaan tuntas 7 hari terakhir"
          />
        </div>

        <div className="lg:col-span-4 rounded-2xl bg-[#F4FFFD] border-2 border-[#99F6E4] p-3.5">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h3 className="font-display font-extrabold text-sm text-[#115E59]">
              Waktu Belajar (Menit / Hari)
            </h3>
            <span className="text-[10px] font-mono font-bold text-[#0D9488]">D3 Area</span>
          </div>
          <p className="text-[11px] text-[#0F766E] mb-2">
            Durasi aktif menyelesaikan soal aljabar setiap harinya.
          </p>
          <svg
            ref={timeSvgRef}
            viewBox="0 0 420 200"
            className="w-full h-auto overflow-visible"
            role="img"
            aria-label="Grafik D3 waktu belajar per hari dalam menit"
          />
        </div>

        <div className="lg:col-span-3 rounded-2xl bg-[#FFFDF4] border-2 border-[#FDE68A] p-3.5 flex flex-col items-center justify-between">
          <div className="w-full text-left">
            <h3 className="font-display font-extrabold text-sm text-[#92400E]">
              Progres Streak 7 Hari
            </h3>
            <p className="text-[11px] text-[#78350F]">
              Selesaikan misi harian 7 hari beruntun!
            </p>
          </div>
          <svg
            ref={streakSvgRef}
            viewBox="0 0 190 190"
            className="w-40 h-40 overflow-visible"
            role="img"
            aria-label={`Grafik D3 progres streak ${streakDays} dari 7 hari`}
          />
          <div className="text-[11px] font-bold text-[#92400E] text-center">
            {streakDays >= 7
              ? 'Ending Spesial Kibo Terbuka!'
              : `Kurang ${Math.max(0, 7 - streakDays)} hari lagi menuju hadiah!`}
          </div>
        </div>
      </div>
    </div>
  );
};
