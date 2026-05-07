"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { RevenueDataPoint } from "@/lib/admin";

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number; payload: RevenueDataPoint }[];
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const { revenueCents, orderCount } = payload[0].payload;
  const euros = (revenueCents / 100).toFixed(2);
  return (
    <div className="bg-white border border-neutral-200 px-3 py-2 text-xs shadow-sm">
      <p className="font-medium text-black">{label}</p>
      <p className="text-neutral-600">{euros} €</p>
      <p className="text-neutral-400">{orderCount} cmd</p>
    </div>
  );
}

export default function RevenueChart({ data }: { data: RevenueDataPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: "#a3a3a3" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={(v: number) => `${(v / 100).toFixed(0)} €`}
          tick={{ fontSize: 11, fill: "#a3a3a3" }}
          axisLine={false}
          tickLine={false}
          width={56}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f5f5f5" }} />
        <Bar dataKey="revenueCents" fill="#111111" radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
