import { HapticVisualizer } from "@/components/HapticVisualizer";
import { AudioVisualizer } from "@/components/AudioVisualizer";

export default function App() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-white via-gray-50 to-indigo-50/30 text-gray-900">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <HapticVisualizer />
        <AudioVisualizer />
      </div>
    </div>
  );
}
