import type { ControlPoint, DataPoint, HapticPattern, Summary } from "@/types";

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

export function extractCurves(json: HapticPattern) {
  const pattern = json?.Pattern || [];
  const duration = pattern.find((x) => x.Event)?.Event?.EventDuration ??
    Math.max(
      ...pattern.filter((x) => x.ParameterCurve)
        .flatMap((x) => x.ParameterCurve?.ParameterCurveControlPoints?.map((p) => p.Time) || [0])
    );

  const intensityCurve = pattern
    .filter((p) => p.ParameterCurve?.ParameterID === "HapticIntensityControl")
    .map((p) => p.ParameterCurve!.ParameterCurveControlPoints)[0] || [];

  const sharpnessCurve = pattern
    .filter((p) => p.ParameterCurve?.ParameterID === "HapticSharpnessControl")
    .map((p) => p.ParameterCurve!.ParameterCurveControlPoints)[0] || [];

  return { duration, intensityCurve, sharpnessCurve };
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

export function downloadCSV(data: DataPoint[], filename: string = "haptic_curves.csv") {
  const header = "time,intensity,sharpness\n";
  const rows = (data || []).map(d => `${d.time},${d.intensity},${d.sharpness}`).join("\n");
  const blob = new Blob([header + rows], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

