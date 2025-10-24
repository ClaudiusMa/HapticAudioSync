# HapticAudioSync

A web-based visualizer for AHAP (Apple Haptic Audio Pattern) haptic patterns. Visualize and analyze haptic intensity and sharpness curves in real-time.

## 🚀 Live Demo

[https://claudiusma.github.io/HapticAudioSync/](https://claudiusma.github.io/HapticAudioSync/)

## ✨ Features

- **Real-time Visualization**: Render AHAP-like JSON patterns with interactive charts
- **Dual Curve Display**: Visualize both Intensity and Sharpness envelopes over time
- **Analytics Dashboard**: View key metrics including duration, peak intensity, ramp times, and more
- **CSV Export**: Download curve data for further analysis
- **TypeScript**: Fully typed for better development experience
- **Modern UI**: Built with Tailwind CSS and shadcn/ui components

## 🛠️ Tech Stack

- **Vite** - Fast build tool and dev server
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Re-usable component library
- **Recharts** - Chart visualization library
- **Framer Motion** - Animation library

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

1. Paste an AHAP-like JSON pattern into the text area
2. The visualizer will automatically parse and render the curves
3. View analytics metrics below the input
4. Download the sampled data as CSV for further analysis

### Expected JSON Format

The tool expects JSON patterns with the following structure:

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
    }
  ]
}
```

## 🎨 Customization

The project uses custom font families defined in `tailwind.config.js`:
- **PP Neue Montreal** - Primary sans-serif font
- **PP Editorial New** - Serif font

Add these font files to your project or update the Tailwind config to use alternative fonts.

## 📄 License

See the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🐛 Issues

Found a bug or have a feature request? Please open an issue on [GitHub Issues](https://github.com/claudiusma/HapticAudioSync/issues).
