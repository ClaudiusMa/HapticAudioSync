import { useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, ReferenceLine } from "recharts";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChartCard } from "@/components/ChartCard";
import { Metric } from "@/components/Metric";
import { DEFAULT_HAPTIC_SPEC } from "@/constants/defaultHaptic";
import { extractCurves, buildSamples, summarize, downloadCSV } from "@/utils/hapticUtils";
import type { HapticPattern } from "@/types";

export function HapticVisualizer() {
  const [jsonText, setJsonText] = useState<string>(DEFAULT_HAPTIC_SPEC);
  const [error, setError] = useState<string | null>(null);

  const { data, summary } = useMemo(() => {
    try {
      setError(null);
      const obj = JSON.parse(jsonText) as HapticPattern;
      const { duration, intensityCurve, sharpnessCurve } = extractCurves(obj);
      const samples = buildSamples(intensityCurve, sharpnessCurve, duration, 600);
      return { data: samples, summary: summarize(samples) };
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Parse error";
      setError(errorMessage);
      return { data: [], summary: null };
    }
  }, [jsonText]);

  const handleDownloadCSV = () => {
    downloadCSV(data, "swipe_card_haptic_curves.csv");
  };

  return (
    <div>
      <motion.h1 
        initial={{ opacity: 0, y: 8 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="text-3xl md:text-4xl font-semibold tracking-tight"
      >
        Haptic Audio Sync — Visualizer
      </motion.h1>
      <p className="mt-2 text-gray-600">
        Visualize haptic patterns and audio waveforms together. Paste an AHAP-like JSON to render{" "}
        <span className="font-medium">Intensity</span> and <span className="font-medium">Sharpness</span> envelopes, 
        and upload audio files to see the waveform.
      </p>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="col-span-1">
          <label className="text-sm font-medium text-gray-700">Haptic JSON</label>
          <Textarea
            className="mt-2 w-full h-72 rounded-2xl border border-gray-200 p-4 font-mono text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            spellCheck={false}
          />
          {error && (
            <div className="mt-2 text-sm text-red-600 bg-red-50 rounded-lg p-2">{error}</div>
          )}
          <div className="mt-3 flex items-center gap-3">
            <Button 
              onClick={() => setJsonText(DEFAULT_HAPTIC_SPEC)} 
              variant="outline" 
              className="rounded-xl"
            >
              Reset
            </Button>
            <Button 
              onClick={handleDownloadCSV} 
              className="rounded-xl bg-indigo-600 hover:bg-indigo-500"
            >
              Download CSV
            </Button>
          </div>
          {summary && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
              <Metric label="Duration" value={`${summary.duration.toFixed(3)} s`} />
              <Metric label="Peak Intensity" value={summary.peakIntensity.toFixed(3)} />
              <Metric label="Ramp Up" value={`${summary.rampUp.toFixed(3)} s`} />
              <Metric label="Plateau" value={`${summary.plateau.toFixed(3)} s`} />
              <Metric label="Ramp Down" value={`${summary.rampDown.toFixed(3)} s`} />
              <Metric label="Intensity Area" value={summary.area.toFixed(3)} />
              <Metric label="Sharpness Δ" value={summary.sharpnessDelta.toFixed(3)} />
            </div>
          )}
        </div>

        {/* Charts Section */}
        <div className="col-span-1 space-y-6">
          <ChartCard title="Haptic Intensity vs Time" subtitle="0–1">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={data} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366F1" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#6366F1" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" tickFormatter={(v) => v.toFixed(2)} />
                <YAxis domain={[0, 1]} tickFormatter={(v) => v.toFixed(2)} />
                <Tooltip 
                  formatter={(v: number) => v.toFixed(3)} 
                  labelFormatter={(v: number) => `t=${v.toFixed(3)}s`} 
                />
                <Area type="monotone" dataKey="intensity" stroke="#6366F1" fill="url(#g1)" strokeWidth={2} />
                <ReferenceLine y={0} stroke="#CBD5E1" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Haptic Sharpness vs Time" subtitle="relative">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={data} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" tickFormatter={(v) => v.toFixed(2)} />
                <YAxis domain={["auto", "auto"]} tickFormatter={(v) => v.toFixed(2)} />
                <Tooltip 
                  formatter={(v: number) => v.toFixed(3)} 
                  labelFormatter={(v: number) => `t=${v.toFixed(3)}s`} 
                />
                <Line type="monotone" dataKey="sharpness" stroke="#10B981" strokeWidth={2} dot={false} />
                <ReferenceLine y={0} stroke="#CBD5E1" />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>

      <div className="mt-6 text-sm text-gray-500 bg-gray-50 rounded-xl p-4">
        <p>
          <strong>Tip:</strong> This tool expects AHAP-like curves with <code className="px-1.5 py-0.5 bg-gray-200 rounded">ParameterID</code> of{" "}
          <strong>HapticIntensityControl</strong> and <strong>HapticSharpnessControl</strong>. 
          We sample 600 points across the effect's duration.
        </p>
      </div>
    </div>
  );
}

