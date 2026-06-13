import React from 'react';
import { LucideIcon } from 'lucide-react';
import GlassCard from './GlassCard';

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  trend?: string;
  trendType?: 'up' | 'down' | 'neutral';
  color?: string;
  subtitle?: string;
}

export default function StatCard({
  title,
  value,
  unit = '',
  icon: Icon,
  trend,
  trendType = 'neutral',
  color = 'text-emerald-400',
  subtitle,
}: StatCardProps) {
  const trendColor =
    trendType === 'up'
      ? 'text-emerald-400'
      : trendType === 'down'
      ? 'text-red-400'
      : 'text-slate-400';

  return (
    <GlassCard>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold tracking-tight text-white">{value}</span>
            {unit && <span className="text-xs text-slate-400 font-semibold">{unit}</span>}
          </div>
          {subtitle && <p className="text-[10px] text-slate-500 font-medium">{subtitle}</p>}
        </div>
        <div className={`p-2.5 rounded-xl bg-slate-900 border border-slate-800 ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center gap-1.5 text-xs">
          <span className={`font-bold ${trendColor}`}>{trend}</span>
          <span className="text-slate-500">vs last hour</span>
        </div>
      )}
    </GlassCard>
  );
}
