export const DEFAULT_HAPTIC_SPEC = `{
  "Version": 1.0,
  "Metadata": {
    "Project": "Swipe Card Haptic",
    "Created": "18 June 2025",
    "Description": "An effect that harmonizes the multi-sensor experience of swiping a card."
  },
  "Pattern": [
    { "Event": { "Time": 0.0, "EventType": "HapticContinuous", "EventDuration": 0.55, "EventParameters": [ { "ParameterID": "HapticIntensity", "ParameterValue": 0.47 }, { "ParameterID": "HapticSharpness", "ParameterValue": 0.05 } ] } },
    { "ParameterCurve": { "ParameterID": "HapticIntensityControl", "Time": 0.0, "ParameterCurveControlPoints": [ { "Time": 0, "ParameterValue": 0.0 }, { "Time": 0.05, "ParameterValue": 0.47 }, { "Time": 0.28, "ParameterValue": 0.47 }, { "Time": 0.55, "ParameterValue": 0.0 } ] } },
    { "ParameterCurve": { "ParameterID": "HapticSharpnessControl", "Time": 0.0, "ParameterCurveControlPoints": [ { "Time": 0, "ParameterValue": 0.05 }, { "Time": 0.55, "ParameterValue": -0.05 } ] } }
  ]
}`;

