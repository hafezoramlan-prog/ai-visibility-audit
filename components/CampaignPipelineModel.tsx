"use client";

import { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from "recharts";

type ChannelKey = "search" | "social" | "email" | "partner" | "events";

type Channel = {
  key: ChannelKey;
  name: string;
  cpl: number; // cost per lead
  mqlRate: number; // lead -> MQL
  sqlRate: number; // MQL -> SQL
  dealSize: number; // avg pipeline $ per SQL
  color: string;
};

type CampaignType = "launch" | "rollout" | "abm" | "nurture";

const CHANNELS: Channel[] = [
  { key: "search", name: "Paid search", cpl: 120, mqlRate: 0.35, sqlRate: 0.40, dealSize: 18000, color: "#2a78d6" },
  { key: "social", name: "Paid social", cpl: 90, mqlRate: 0.25, sqlRate: 0.30, dealSize: 14000, color: "#eb6834" },
  { key: "email", name: "Email / owned", cpl: 25, mqlRate: 0.45, sqlRate: 0.35, dealSize: 16000, color: "#1baf7a" },
  { key: "partner", name: "Partner co-marketing", cpl: 60, mqlRate: 0.50, sqlRate: 0.45, dealSize: 22000, color: "#eda100" },
  { key: "events", name: "Events / field", cpl: 200, mqlRate: 0.40, sqlRate: 0.50, dealSize: 28000, color: "#e87ba4" },
];

const TYPE_LABELS: Record<CampaignType, string> = {
  launch: "Product launch",
  rollout: "Service rollout",
  abm: "ABM / enterprise",
  nurture: "Always-on nurture",
};

// Deal-velocity multiplier applied to pipeline value by campaign type.
const TYPE_MULTIPLIER: Record<CampaignType, number> = {
  launch: 1.15,
  rollout: 1.0,
  abm: 1.35,
  nurture: 0.85,
};

const DEFAULT_WEIGHTS: Record<ChannelKey, number> = {
  search: 30,
  social: 15,
  email: 20,
  partner: 20,
  events: 15,
};

function formatUSD(value: number): string {
  return "$" + Math.round(value).toLocaleString();
}

export default function CampaignPipelineModel() {
  const [budget, setBudget] = useState(50000);
  const [baseline, setBaseline] = useState(180000);
  const [campaignType, setCampaignType] = useState<CampaignType>("rollout");
  const [weights, setWeights] = useState<Record<ChannelKey, number>>(DEFAULT_WEIGHTS);

  const totalWeight = useMemo(
    () => Object.values(weights).reduce((a, b) => a + b, 0) || 1,
    [weights]
  );

  const { totalPipeline, chartData, lift, roiPerDollar, blendedCac } = useMemo(() => {
    const multiplier = TYPE_MULTIPLIER[campaignType];
    let totalPipeline = 0;
    let totalSqls = 0;

    const chartData = CHANNELS.map((c) => {
      const pct = weights[c.key] / totalWeight;
      const spend = budget * pct;
      const leads = c.cpl > 0 ? spend / c.cpl : 0;
      const mqls = leads * c.mqlRate;
      const sqls = mqls * c.sqlRate;
      const pipeline = sqls * c.dealSize * multiplier;

      totalPipeline += pipeline;
      totalSqls += sqls;

      return {
        name: c.name,
        pipeline: Math.round(pipeline),
        pct: Math.round(pct * 100),
        color: c.color,
      };
    });

    const lift = baseline > 0 ? ((totalPipeline - baseline) / baseline) * 100 : 0;
    const roiPerDollar = budget > 0 ? totalPipeline / budget : 0;
    const blendedCac = totalSqls > 0 ? budget / totalSqls : 0;

    return { totalPipeline, chartData, lift, roiPerDollar, blendedCac };
  }, [budget, baseline, campaignType, weights, totalWeight]);

  function updateWeight(key: ChannelKey, value: number) {
    setWeights((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-950 md:p-8">
      <div>
        <h2 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
          Campaign pipeline attribution model
        </h2>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Set channel mix, budget, and campaign type to model projected pipeline
          contribution, GA4 / Looker Studio style.
        </p>
      </div>

      {/* Budget + baseline */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <div className="flex items-center justify-between text-sm">
            <label htmlFor="budget" className="text-neutral-500 dark:text-neutral-400">
              Quarterly budget
            </label>
            <span className="font-medium text-neutral-900 dark:text-neutral-100">
              {formatUSD(budget)}
            </span>
          </div>
          <input
            id="budget"
            type="range"
            min={10000}
            max={150000}
            step={1000}
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            className="mt-2 w-full accent-neutral-900 dark:accent-neutral-100"
          />
        </div>

        <div>
          <div className="flex items-center justify-between text-sm">
            <label htmlFor="baseline" className="text-neutral-500 dark:text-neutral-400">
              Prior quarter pipeline (baseline)
            </label>
            <span className="font-medium text-neutral-900 dark:text-neutral-100">
              {formatUSD(baseline)}
            </span>
          </div>
          <input
            id="baseline"
            type="range"
            min={50000}
            max={400000}
            step={5000}
            value={baseline}
            onChange={(e) => setBaseline(Number(e.target.value))}
            className="mt-2 w-full accent-neutral-900 dark:accent-neutral-100"
          />
        </div>
      </div>

      {/* Campaign type */}
      <div>
        <label htmlFor="campaignType" className="text-sm text-neutral-500 dark:text-neutral-400">
          Campaign type
        </label>
        <select
          id="campaignType"
          value={campaignType}
          onChange={(e) => setCampaignType(e.target.value as CampaignType)}
          className="mt-2 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
        >
          {Object.entries(TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Channel mix sliders */}
      <div>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Channel mix (relative weight, auto-normalized to 100%)
        </p>
        <div className="mt-3 space-y-4">
          {CHANNELS.map((c) => {
            const pct = Math.round((weights[c.key] / totalWeight) * 100);
            return (
              <div key={c.key}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-700 dark:text-neutral-300">{c.name}</span>
                  <span className="text-neutral-500 dark:text-neutral-400">{pct}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={weights[c.key]}
                  onChange={(e) => updateWeight(c.key, Number(e.target.value))}
                  className="mt-1 w-full accent-neutral-900 dark:accent-neutral-100"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricCard label="Projected pipeline" value={formatUSD(totalPipeline)} />
        <MetricCard
          label="QoQ pipeline lift"
          value={`${lift >= 0 ? "+" : ""}${lift.toFixed(1)}%`}
          tone={lift >= 0 ? "positive" : "negative"}
        />
        <MetricCard label="Pipeline per $1" value={formatUSD(roiPerDollar)} />
        <MetricCard label="Blended CAC" value={formatUSD(blendedCac)} />
      </div>

      {/* Chart */}
      <div>
        <div className="mb-2 flex flex-wrap gap-4 text-xs text-neutral-500 dark:text-neutral-400">
          {CHANNELS.map((c) => (
            <span key={c.key} className="flex items-center gap-1.5">
              <span
                className="h-2.5 w-2.5 rounded-sm"
                style={{ backgroundColor: c.color }}
              />
              {c.name}
            </span>
          ))}
        </div>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e1e0d9" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: "#898781" }}
                interval={0}
                angle={-15}
                textAnchor="end"
                height={50}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#898781" }}
                tickFormatter={(v) => `$${Math.round(v / 1000)}k`}
              />
              <Tooltip
                formatter={(value: number) => [formatUSD(value), "Pipeline"]}
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
              />
              <Bar dataKey="pipeline" radius={[4, 4, 0, 0]} maxBarSize={40}>
                {chartData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "positive" | "negative";
}) {
  const toneClass =
    tone === "positive"
      ? "text-emerald-600 dark:text-emerald-400"
      : tone === "negative"
      ? "text-red-600 dark:text-red-400"
      : "text-neutral-900 dark:text-neutral-100";

  return (
    <div className="rounded-xl bg-neutral-50 p-4 dark:bg-neutral-900">
      <p className="text-xs text-neutral-500 dark:text-neutral-400">{label}</p>
      <p className={`mt-1 text-xl font-medium ${toneClass}`}>{value}</p>
    </div>
  );
}
