// Haptic Types
export interface ControlPoint {
  Time: number;
  ParameterValue: number;
}

export interface ParameterCurve {
  ParameterID: string;
  Time: number;
  ParameterCurveControlPoints?: ControlPoint[];
}

export interface EventParameter {
  ParameterID: string;
  ParameterValue: number;
}

export interface HapticEvent {
  Time: number;
  EventType: string;
  EventDuration: number;
  EventParameters?: EventParameter[];
}

export interface PatternItem {
  Event?: HapticEvent;
  ParameterCurve?: ParameterCurve;
}

export interface HapticPattern {
  Version: number;
  Metadata?: {
    Project?: string;
    Created?: string;
    Description?: string;
  };
  Pattern: PatternItem[];
}

export interface DataPoint {
  time: number;
  intensity: number;
  sharpness: number;
}

export interface Summary {
  duration: number;
  peakIntensity: number;
  rampUp: number;
  plateau: number;
  rampDown: number;
  area: number;
  sharpnessStart: number;
  sharpnessEnd: number;
  sharpnessDelta: number;
}

// Audio Types
export interface AudioDataPoint {
  time: number;
  amplitude: number;
}

export interface AudioSummary {
  duration: number;
  sampleRate: number;
  peakAmplitude: number;
  rmsAmplitude: number;
  totalSamples: number;
}

