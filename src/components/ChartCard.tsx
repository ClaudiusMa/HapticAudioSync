import { Card } from "@/components/ui/card";

interface ChartCardProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export function ChartCard({ title, subtitle, children }: ChartCardProps) {
  return (
    <Card className="rounded-2xl border border-gray-200 p-4 shadow-sm">
      <div className="flex items-baseline justify-between mb-2">
        <h2 className="text-lg font-medium">{title}</h2>
        <span className="text-xs text-gray-500">{subtitle}</span>
      </div>
      {children}
    </Card>
  );
}

