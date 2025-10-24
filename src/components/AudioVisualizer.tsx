import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, ReferenceLine } from "recharts";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChartCard } from "@/components/ChartCard";
import { Metric } from "@/components/Metric";
import { processAudioFile, downloadAudioCSV } from "@/utils/audioUtils";
import type { AudioDataPoint, AudioSummary } from "@/types";

export function AudioVisualizer() {
  const [audioWaveform, setAudioWaveform] = useState<AudioDataPoint[]>([]);
  const [audioSummary, setAudioSummary] = useState<AudioSummary | null>(null);
  const [audioFileName, setAudioFileName] = useState<string>("");
  const [audioLoading, setAudioLoading] = useState<boolean>(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAudioUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.wav')) {
      setAudioError('Please upload a .wav file');
      return;
    }

    setAudioLoading(true);
    setAudioError(null);
    setAudioFileName(file.name);

    try {
      const { waveform, summary: audioSum } = await processAudioFile(file);
      setAudioWaveform(waveform);
      setAudioSummary(audioSum);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Failed to process audio file";
      setAudioError(errorMessage);
      setAudioWaveform([]);
      setAudioSummary(null);
    } finally {
      setAudioLoading(false);
    }
  };

  const handleDownloadCSV = () => {
    const filename = `${audioFileName.replace('.wav', '')}_waveform.csv`;
    downloadAudioCSV(audioWaveform, filename);
  };

  return (
    <div className="mt-12 border-t border-gray-200 pt-10">
      <motion.h2 
        initial={{ opacity: 0, y: 8 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="text-2xl md:text-3xl font-semibold tracking-tight"
      >
        Audio Waveform Visualizer
      </motion.h2>
      <p className="mt-2 text-gray-600">
        Upload a .wav file to visualize the audio waveform and extract amplitude data.
      </p>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <div className="col-span-1">
          <label className="text-sm font-medium text-gray-700">Audio File (.wav)</label>
          <input
            ref={fileInputRef}
            type="file"
            accept=".wav"
            onChange={handleAudioUpload}
            className="hidden"
          />
          <div className="mt-2">
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="rounded-xl w-full justify-center gap-2 hover:border-indigo-300"
              disabled={audioLoading}
            >
              <Upload className="w-4 h-4" />
              {audioLoading ? "Processing..." : audioFileName || "Choose WAV File"}
            </Button>
          </div>

          {audioError && (
            <div className="mt-2 text-sm text-red-600 bg-red-50 rounded-lg p-2">{audioError}</div>
          )}
          
          {audioFileName && !audioError && (
            <div className="mt-3 text-sm text-gray-600 bg-gray-50 rounded-lg p-2">
              <span className="font-medium">File:</span> {audioFileName}
            </div>
          )}

          {audioWaveform.length > 0 && (
            <div className="mt-3">
              <Button 
                onClick={handleDownloadCSV} 
                className="rounded-xl bg-indigo-600 hover:bg-indigo-500"
              >
                Download Audio CSV
              </Button>
            </div>
          )}

          {audioSummary && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
              <Metric label="Duration" value={`${audioSummary.duration.toFixed(3)} s`} />
              <Metric label="Sample Rate" value={`${audioSummary.sampleRate} Hz`} />
              <Metric label="Peak Amplitude" value={audioSummary.peakAmplitude.toFixed(4)} />
              <Metric label="RMS Amplitude" value={audioSummary.rmsAmplitude.toFixed(4)} />
              <Metric label="Total Samples" value={audioSummary.totalSamples.toLocaleString()} />
            </div>
          )}
        </div>

        {/* Waveform Chart Section */}
        <div className="col-span-1">
          {audioWaveform.length > 0 && (
            <ChartCard title="Audio Waveform" subtitle="amplitude">
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={audioWaveform} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                  <defs>
                    <linearGradient id="audioGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10B981" stopOpacity={0.3} />
                      <stop offset="50%" stopColor="#10B981" stopOpacity={0.1} />
                      <stop offset="100%" stopColor="#10B981" stopOpacity={0.3} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="time" 
                    tickFormatter={(v) => v.toFixed(2)} 
                    label={{ value: 'Time (s)', position: 'insideBottom', offset: -5 }} 
                  />
                  <YAxis domain={["auto", "auto"]} tickFormatter={(v) => v.toFixed(2)} />
                  <Tooltip 
                    formatter={(v: number) => v.toFixed(4)} 
                    labelFormatter={(v: number) => `t=${v.toFixed(4)}s`} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="amplitude" 
                    stroke="#10B981" 
                    fill="url(#audioGradient)" 
                    strokeWidth={1.5} 
                  />
                  <ReferenceLine y={0} stroke="#CBD5E1" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>
          )}
          {audioWaveform.length === 0 && !audioLoading && (
            <Card className="rounded-2xl border border-gray-200 p-8 shadow-sm h-full flex items-center justify-center">
              <div className="text-center text-gray-400">
                <Upload className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Upload a .wav file to visualize the waveform</p>
              </div>
            </Card>
          )}
          {audioLoading && (
            <Card className="rounded-2xl border border-gray-200 p-8 shadow-sm h-full flex items-center justify-center">
              <div className="text-center text-gray-500">
                <div className="animate-spin w-8 h-8 border-4 border-gray-300 border-t-indigo-600 rounded-full mx-auto mb-3" />
                <p className="text-sm">Processing audio file...</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

