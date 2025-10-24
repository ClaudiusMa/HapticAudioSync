interface MetricProps {
  label: string;
  value: string;
}

export function Metric({ label, value }: MetricProps) {
  return (
    <div className="rounded-xl border border-gray-200 px-3 py-2 hover:border-indigo-300 transition-colors">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  );
}

