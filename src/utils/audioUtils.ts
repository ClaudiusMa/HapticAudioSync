import type { AudioDataPoint, AudioSummary } from "@/types";

export async function processAudioFile(
  file: File
): Promise<{ waveform: AudioDataPoint[]; summary: AudioSummary }> {
  const arrayBuffer = await file.arrayBuffer();
  const audioContext = new AudioContext();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  
  // Get the first channel (mono or left channel)
  const channelData = audioBuffer.getChannelData(0);
  const sampleRate = audioBuffer.sampleRate;
  const duration = audioBuffer.duration;
  
  // Downsample to a reasonable number of points for visualization (max 2000 points)
  const maxPoints = 2000;
  const step = Math.max(1, Math.floor(channelData.length / maxPoints));
  
  const waveform: AudioDataPoint[] = [];
  let sumSquares = 0;
  let peakAmplitude = 0;
  
  for (let i = 0; i < channelData.length; i += step) {
    const time = i / sampleRate;
    const amplitude = channelData[i];
    waveform.push({ time, amplitude });
    
    sumSquares += amplitude * amplitude;
    peakAmplitude = Math.max(peakAmplitude, Math.abs(amplitude));
  }
  
  const rmsAmplitude = Math.sqrt(sumSquares / channelData.length);
  
  const summary: AudioSummary = {
    duration,
    sampleRate,
    peakAmplitude,
    rmsAmplitude,
    totalSamples: channelData.length,
  };
  
  await audioContext.close();
  
  return { waveform, summary };
}

export function downloadAudioCSV(
  waveform: AudioDataPoint[], 
  filename: string = "audio_waveform.csv"
) {
  const header = "time,amplitude\n";
  const rows = waveform.map(d => `${d.time},${d.amplitude}`).join("\n");
  const blob = new Blob([header + rows], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

