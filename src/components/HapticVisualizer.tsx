import { useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, ReferenceLine } from "recharts";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChartCard } from "@/components/ChartCard";
import { Metric } from "@/components/Metric";
import { DEFAULT_HAPTIC_SPEC } from "@/constants/defaultHaptic";
import { extractCurves, extractEvents, buildSamples, buildEventSamples, summarize, downloadCSV } from "@/utils/hapticUtils";
import type { HapticPattern, EventDataPoint, DataPoint } from "@/types";

export function HapticVisualizer() {
  const [jsonText, setJsonText] = useState<string>(DEFAULT_HAPTIC_SPEC);
  const [error, setError] = useState<string | null>(null);

  const { eventDataMap, curveData, summary, duration, intensityYDomain, sharpnessYDomain } = useMemo(() => {
    try {
      setError(null);
      const obj = JSON.parse(jsonText) as HapticPattern;
      
      // Extract events grouped by type
      const eventsByType = extractEvents(obj);
      
      // Extract curves (for backward compatibility)
      const { duration: curveDuration, intensityCurve, sharpnessCurve } = extractCurves(obj);
      
      // Calculate overall duration (extractCurves already handles default durations)
      // But we also need to account for all events, so calculate it here too
      const allEvents = Array.from(eventsByType.values()).flat();
      const maxEventEnd = Math.max(
        ...allEvents.map(e => {
          const startTime = e.Time || 0;
          // For transient events without duration, use small default for visualization
          const eventDuration = e.EventDuration ?? 
            (e.EventType === "HapticTransient" ? 0.01 : 0.1);
          return startTime + eventDuration;
        }),
        0
      );
      const overallDuration = Math.max(curveDuration, maxEventEnd, 0.5);
      
      // Build event data for each event type
      const eventDataMap = new Map<string, EventDataPoint[]>();
      eventsByType.forEach((events, eventType) => {
        const samples = buildEventSamples(events, overallDuration, 600);
        eventDataMap.set(eventType, samples);
      });
      
      // Build curve data (if available)
      let curveData: DataPoint[] | null = null;
      if (intensityCurve.length > 0 || sharpnessCurve.length > 0) {
        const samples = buildSamples(intensityCurve, sharpnessCurve, overallDuration, 600);
        curveData = samples;
      }
      
      // Use curve data for summary if available, otherwise use first event type
      const summaryData: DataPoint[] = curveData || 
        (eventDataMap.size > 0 
          ? Array.from(eventDataMap.values())[0].map(({ time, intensity, sharpness }) => ({ time, intensity, sharpness }))
          : []);
      const summaryResult = summarize(summaryData);
      
      // Calculate max values from all data for Y-axis domains
      const allDataPoints: DataPoint[] = [];
      eventDataMap.forEach((samples) => {
        allDataPoints.push(...samples.map(({ time, intensity, sharpness }) => ({ time, intensity, sharpness })));
      });
      if (curveData) {
        allDataPoints.push(...curveData);
      }
      
      const maxSharpness = allDataPoints.length > 0
        ? Math.max(...allDataPoints.map(d => d.sharpness))
        : 0;
      
      // Apple's Core Haptics max values: 1.0 for both intensity and sharpness
      const APPLE_MAX_INTENSITY = 1.0;
      const APPLE_MAX_SHARPNESS = 1.0;
      
      // For intensity: use Apple's max (1.0) as the top value
      // For sharpness: use Apple's max if data max <= 1.0, otherwise use 2x max to show overflow
      const intensityYDomain: [number, number] = [0, APPLE_MAX_INTENSITY];
      const sharpnessYDomain: [number, number] = maxSharpness <= APPLE_MAX_SHARPNESS
        ? [0, APPLE_MAX_SHARPNESS]
        : [0, maxSharpness * 2];
      
      return { 
        eventDataMap, 
        curveData, 
        summary: summaryResult, 
        duration: overallDuration,
        intensityYDomain,
        sharpnessYDomain
      };
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Parse error";
      setError(errorMessage);
      return { 
        eventDataMap: new Map(), 
        curveData: null, 
        summary: null, 
        duration: 0,
        intensityYDomain: [0, 1] as [number, number],
        sharpnessYDomain: [0, 1] as [number, number]
      };
    }
  }, [jsonText]);

  const handleDownloadCSV = () => {
    // Combine all event data for CSV export
    const allEventData: EventDataPoint[] = [];
    eventDataMap.forEach((samples) => {
      allEventData.push(...samples);
    });
    
    if (allEventData.length > 0) {
      downloadCSV(allEventData, "swipe_card_haptic_curves.csv");
    } else if (curveData) {
      downloadCSV(curveData, "swipe_card_haptic_curves.csv");
    }
  };
  
  // Color mapping for different event types
  const eventTypeColors: Record<string, { intensity: string; sharpness: string; gradient: string }> = {
    HapticContinuous: {
      intensity: "#6366F1",
      sharpness: "#10B981",
      gradient: "g1"
    },
    HapticTransient: {
      intensity: "#EF4444",
      sharpness: "#F59E0B",
      gradient: "g2"
    },
  };
  
  // Generate unique colors for unknown event types
  const getEventTypeColor = (eventType: string, index: number) => {
    if (eventTypeColors[eventType]) {
      return eventTypeColors[eventType];
    }
    const colors = [
      { intensity: "#8B5CF6", sharpness: "#EC4899", gradient: `g${index + 3}` },
      { intensity: "#06B6D4", sharpness: "#14B8A6", gradient: `g${index + 4}` },
      { intensity: "#F97316", sharpness: "#EAB308", gradient: `g${index + 5}` },
    ];
    return colors[index % colors.length];
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
              <AreaChart margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                <defs>
                  {Array.from(eventDataMap.keys()).map((eventType, idx) => {
                    const color = getEventTypeColor(eventType, idx);
                    return (
                      <linearGradient key={color.gradient} id={color.gradient} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color.intensity} stopOpacity={0.3} />
                        <stop offset="100%" stopColor={color.intensity} stopOpacity={0.05} />
                      </linearGradient>
                    );
                  })}
                  {curveData && (
                    <linearGradient id="gCurve" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366F1" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#6366F1" stopOpacity={0.05} />
                    </linearGradient>
                  )}
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="time" 
                  tickFormatter={(v) => v.toFixed(2)}
                  type="number"
                  domain={[0, duration]}
                />
                <YAxis domain={intensityYDomain} tickFormatter={(v) => v.toFixed(2)} />
                <Tooltip 
                  formatter={(v: number) => v.toFixed(3)} 
                  labelFormatter={(v: number) => `t=${v.toFixed(3)}s`} 
                />
                {Array.from(eventDataMap.entries()).map(([eventType, samples], idx) => {
                  const color = getEventTypeColor(eventType, idx);
                  return (
                    <Area
                      key={eventType}
                      type="monotone"
                      data={samples}
                      dataKey="intensity"
                      stroke={color.intensity}
                      fill={`url(#${color.gradient})`}
                      strokeWidth={2}
                      name={eventType}
                    />
                  );
                })}
                {curveData && (
                  <Area
                    type="monotone"
                    data={curveData}
                    dataKey="intensity"
                    stroke="#6366F1"
                    fill="url(#gCurve)"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="ParameterCurve"
                  />
                )}
                <ReferenceLine y={0} stroke="#CBD5E1" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Haptic Sharpness vs Time" subtitle="relative">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="time" 
                  tickFormatter={(v) => v.toFixed(2)}
                  type="number"
                  domain={[0, duration]}
                />
                <YAxis domain={sharpnessYDomain} tickFormatter={(v) => v.toFixed(2)} />
                <Tooltip 
                  formatter={(v: number) => v.toFixed(3)} 
                  labelFormatter={(v: number) => `t=${v.toFixed(3)}s`} 
                />
                {Array.from(eventDataMap.entries()).map(([eventType, samples], idx) => {
                  const color = getEventTypeColor(eventType, idx);
                  return (
                    <Line
                      key={eventType}
                      type="monotone"
                      data={samples}
                      dataKey="sharpness"
                      stroke={color.sharpness}
                      strokeWidth={2}
                      dot={false}
                      name={eventType}
                    />
                  );
                })}
                {curveData && (
                  <Line
                    type="monotone"
                    data={curveData}
                    dataKey="sharpness"
                    stroke="#10B981"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    name="ParameterCurve"
                  />
                )}
                <ReferenceLine y={0} stroke="#CBD5E1" />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>

      <div className="mt-6 text-sm text-gray-500 bg-gray-50 rounded-xl p-4">
        <p>
          <strong>Tip:</strong> This tool supports both AHAP-like <code className="px-1.5 py-0.5 bg-gray-200 rounded">ParameterCurve</code> items and{" "}
          <code className="px-1.5 py-0.5 bg-gray-200 rounded">Event</code> items with different <code className="px-1.5 py-0.5 bg-gray-200 rounded">EventType</code> values. 
          Each event type is displayed as a separate line. We sample 600 points across the effect's duration.
        </p>
        {eventDataMap.size > 0 && (
          <div className="mt-3 flex flex-wrap gap-3">
            <span className="font-medium">Event Types:</span>
            {Array.from(eventDataMap.keys()).map((eventType, idx) => {
              const color = getEventTypeColor(eventType, idx);
              return (
                <span key={eventType} className="flex items-center gap-1.5">
                  <span 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: color.intensity }}
                  />
                  <code className="px-1.5 py-0.5 bg-gray-200 rounded text-xs">{eventType}</code>
                </span>
              );
            })}
            {curveData && (
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full border-2 border-indigo-500 border-dashed" />
                <code className="px-1.5 py-0.5 bg-gray-200 rounded text-xs">ParameterCurve</code>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

