# HapticAudioSync

A comprehensive web-based visualizer for AHAP (Apple Haptic Audio Pattern) haptic patterns and audio waveforms. Analyze haptic intensity and sharpness curves alongside audio amplitude data in a unified interface.

## 🚀 Live Demo

[https://claudiusma.github.io/HapticAudioSync/](https://claudiusma.github.io/HapticAudioSync/)

## ✨ Features

### Haptic Visualization
- **Real-time Visualization**: Render AHAP-like JSON patterns with interactive charts
- **Dual Curve Display**: Visualize both Intensity and Sharpness envelopes over time
- **Analytics Dashboard**: View key metrics including duration, peak intensity, ramp times, plateau duration, intensity area, and sharpness delta
- **CSV Export**: Download haptic curve data for further analysis

### Audio Visualization
- **WAV File Support**: Upload and process .wav audio files
- **Waveform Display**: Visualize audio amplitude over time
- **Audio Analytics**: View duration, sample rate, peak amplitude, RMS amplitude, and total samples
- **CSV Export**: Download audio waveform data for analysis

### General
- **TypeScript**: Fully typed for better development experience
- **Modern UI**: Built with Tailwind CSS and shadcn/ui components
- **Smooth Animations**: Enhanced UX with Framer Motion

## 🛠️ Tech Stack

- **Vite** - Fast build tool and dev server
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Re-usable component library
- **Recharts** - Chart visualization library
- **Framer Motion** - Animation library
- **Lucide React** - Icon library
- **Web Audio API** - Audio file processing

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/claudiusma/HapticAudioSync.git
cd HapticAudioSync

# Install dependencies
npm install
```

## 🚀 Development

```bash
# Start the development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

The development server will start at `http://localhost:5173`

## 📝 Usage

### Haptic Pattern Visualization

1. Paste an AHAP-like JSON pattern into the text area (a default pattern is pre-loaded)
2. The visualizer will automatically parse and render the intensity and sharpness curves
3. View analytics metrics including duration, peak intensity, ramp times, and more
4. Click "Download CSV" to export the sampled haptic data
5. Use "Reset" to restore the default haptic pattern

### Audio Waveform Visualization

1. Click "Choose WAV File" to upload a .wav audio file
2. The tool will process the audio and display the waveform
3. View audio metrics including duration, sample rate, peak amplitude, and RMS amplitude
4. Click "Download Audio CSV" to export the waveform data

### Expected Haptic JSON Format

The tool expects AHAP-like JSON patterns with `ParameterCurve` entries using `HapticIntensityControl` and `HapticSharpnessControl`:

```json
{
  "Version": 1.0,
  "Metadata": {
    "Project": "Your Project Name",
    "Created": "Date",
    "Description": "Description"
  },
  "Pattern": [
    {
      "Event": {
        "Time": 0.0,
        "EventType": "HapticContinuous",
        "EventDuration": 0.55,
        "EventParameters": [
          { "ParameterID": "HapticIntensity", "ParameterValue": 0.47 },
          { "ParameterID": "HapticSharpness", "ParameterValue": 0.05 }
        ]
      }
    },
    {
      "ParameterCurve": {
        "ParameterID": "HapticIntensityControl",
        "Time": 0.0,
        "ParameterCurveControlPoints": [
          { "Time": 0, "ParameterValue": 0.0 },
          { "Time": 0.05, "ParameterValue": 0.47 }
        ]
      }
    },
    {
      "ParameterCurve": {
        "ParameterID": "HapticSharpnessControl",
        "Time": 0.0,
        "ParameterCurveControlPoints": [
          { "Time": 0, "ParameterValue": 0.05 },
          { "Time": 0.1, "ParameterValue": 0.15 }
        ]
      }
    }
  ]
}
```

The visualizer samples 600 points across the effect's duration and interpolates values between control points.

## 🎨 Customization

The project uses a modern design system with:
- **Font Stack**: SF Pro, Noto Sans, Helvetica Neue, and fallbacks
- **Color Palette**: Custom colors including indigo for haptics and emerald for audio
- **Responsive Breakpoints**: Mobile-first design with custom breakpoints
- **Animations**: Smooth transitions powered by Framer Motion and Tailwind Animate

You can customize colors, fonts, and other design tokens in `tailwind.config.js`.

## 📄 License

See the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🐛 Issues

Found a bug or have a feature request? Please open an issue on [GitHub Issues](https://github.com/claudiusma/HapticAudioSync/issues).
