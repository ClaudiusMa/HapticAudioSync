import type { ControlPoint, DataPoint, EventDataPoint, HapticPattern, Summary, HapticEvent } from "@/types";

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function piecewiseLinear(points: ControlPoint[]) {
  const pts = [...points].sort((a, b) => a.Time - b.Time);
  return (t: number): number => {
    if (pts.length === 0) return 0;
    if (t <= pts[0].Time) return pts[0].ParameterValue;
    if (t >= pts[pts.length - 1].Time) return pts[pts.length - 1].ParameterValue;
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i], b = pts[i + 1];
      if (t >= a.Time && t <= b.Time) {
        const u = (t - a.Time) / (b.Time - a.Time);
        return lerp(a.ParameterValue, b.ParameterValue, u);
      }
    }
    return 0;
  };
}

// Extract events grouped by EventType
export function extractEvents(json: HapticPattern): Map<string, HapticEvent[]> {
  const pattern = json?.Pattern || [];
  const eventsByType = new Map<string, HapticEvent[]>();
  
  pattern.forEach((item) => {
    if (item.Event) {
      const eventType = item.Event.EventType;
      if (!eventsByType.has(eventType)) {
        eventsByType.set(eventType, []);
      }
      eventsByType.get(eventType)!.push(item.Event);
    }
  });
  
  return eventsByType;
}

// Extract parameter curves (for backward compatibility)
export function extractCurves(json: HapticPattern) {
  const pattern = json?.Pattern || [];
  
  // Calculate duration from events or curves
  const events = pattern.filter((x) => x.Event).map((x) => x.Event!);
  const maxEventEnd = Math.max(
    ...events.map((e) => {
      const startTime = e.Time || 0;
      // For transient events without duration, use small default for visualization
      // For other events, use default if not specified
      const eventDuration = e.EventDuration ?? 
        (e.EventType === "HapticTransient" ? 0.01 : 0.1);
      return startTime + eventDuration;
    }),
    0
  );
  
  const maxCurveTime = Math.max(
    ...pattern.filter((x) => x.ParameterCurve)
      .flatMap((x) => x.ParameterCurve?.ParameterCurveControlPoints?.map((p) => p.Time) || [0]),
    0
  );
  
  const duration = Math.max(maxEventEnd, maxCurveTime);

  const intensityCurve = pattern
    .filter((p) => p.ParameterCurve?.ParameterID === "HapticIntensityControl")
    .map((p) => p.ParameterCurve!.ParameterCurveControlPoints)[0] || [];

  const sharpnessCurve = pattern
    .filter((p) => p.ParameterCurve?.ParameterID === "HapticSharpnessControl")
    .map((p) => p.ParameterCurve!.ParameterCurveControlPoints)[0] || [];

  return { duration, intensityCurve, sharpnessCurve };
}

// Build samples for a specific event type
export function buildEventSamples(
  events: HapticEvent[],
  duration: number,
  samples = 600
): EventDataPoint[] {
  const out: EventDataPoint[] = [];
  const eventType = events[0]?.EventType || "Unknown";
  
  // Get parameter values for each event
  const getParamValue = (event: HapticEvent, paramId: string): number => {
    return event.EventParameters?.find((p) => p.ParameterID === paramId)?.ParameterValue || 0;
  };
  
  for (let k = 0; k <= samples; k++) {
    const t = (k / samples) * duration;
    let intensity = 0;
    let sharpness = 0;
    
    // Check if time falls within any event
    for (const event of events) {
      const startTime = event.Time || 0;
      // For transient events without duration, use small default for visualization (straight line)
      // For other events, use default duration if not specified
      const eventDuration = event.EventDuration ?? 
        (event.EventType === "HapticTransient" ? 0.01 : 0.1);
      const endTime = startTime + eventDuration;
      
      if (t >= startTime && t <= endTime) {
        // Both continuous and transient events use constant values (straight line, no curve)
        intensity = getParamValue(event, "HapticIntensity");
        sharpness = getParamValue(event, "HapticSharpness");
        break; // Use first matching event
      }
    }
    
    out.push({
      time: +t.toFixed(4),
      intensity,
      sharpness,
      eventType,
    });
  }
  
  return out;
}

export function buildSamples(
  intensityPts: ControlPoint[], 
  sharpnessPts: ControlPoint[], 
  duration: number, 
  samples = 600
): DataPoint[] {
  const iFn = piecewiseLinear(intensityPts);
  const sFn = piecewiseLinear(sharpnessPts);
  const out: DataPoint[] = [];
  for (let k = 0; k <= samples; k++) {
    const t = (k / samples) * duration;
    out.push({ time: +t.toFixed(4), intensity: iFn(t), sharpness: sFn(t) });
  }
  return out;
}

export function summarize(data: DataPoint[]): Summary | null {
  if (data.length === 0) return null;
  const duration = data[data.length - 1].time;
  const peakIntensity = data.reduce((m, d) => Math.max(m, d.intensity), -Infinity);
  const firstNonZero = data.find(d => d.intensity > 1e-6)?.time ?? 0;
  const peakStartIdx = data.findIndex(d => Math.abs(d.intensity - peakIntensity) < 1e-6);
  const peakEndIdx = (() => { 
    let j = peakStartIdx; 
    while (j < data.length && Math.abs(data[j].intensity - peakIntensity) < 1e-6) j++; 
    return j - 1; 
  })();
  const rampUp = peakStartIdx >= 0 ? data[peakStartIdx].time - firstNonZero : 0;
  const plateau = peakStartIdx >= 0 ? data[peakEndIdx].time - data[peakStartIdx].time : 0;
  const rampDown = peakEndIdx >= 0 ? duration - data[peakEndIdx].time : 0;
  const area = data.reduce(
    (acc, d, i) => i === 0 ? 0 : acc + (data[i - 1].intensity + d.intensity) / 2 * (d.time - data[i - 1].time), 
    0
  );
  const sharpnessDelta = data[data.length - 1].sharpness - data[0].sharpness;
  return { 
    duration, 
    peakIntensity, 
    rampUp, 
    plateau, 
    rampDown, 
    area, 
    sharpnessStart: data[0].sharpness, 
    sharpnessEnd: data[data.length - 1].sharpness, 
    sharpnessDelta 
  };
}

export function downloadCSV(data: DataPoint[] | EventDataPoint[], filename: string = "haptic_curves.csv") {
  const isEventData = data.length > 0 && 'eventType' in data[0];
  const header = isEventData 
    ? "time,intensity,sharpness,eventType\n"
    : "time,intensity,sharpness\n";
  const rows = (data || []).map(d => {
    if (isEventData) {
      const ed = d as EventDataPoint;
      return `${ed.time},${ed.intensity},${ed.sharpness},${ed.eventType}`;
    } else {
      const dp = d as DataPoint;
      return `${dp.time},${dp.intensity},${dp.sharpness}`;
    }
  }).join("\n");
  const blob = new Blob([header + rows], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

