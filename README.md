# Next-Gen Algorithms Visualizer 🚀

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue)
![React](https://img.shields.io/badge/React-18.2-blue)
![Vite](https://img.shields.io/badge/Vite-5.0-purple)

**AlgoViz** is a modern, interactive algorithm visualization tool designed to bridge the gap between code and concept. Unlike traditional visualizers, AlgoViz lets you write, edit, and step through *real* JavaScript code, providing deep insights into algorithmic behavior through real-time explanations, call stack tracking, and performance metrics.

![Demo](https://via.placeholder.com/800x450.png?text=AlgoViz+Demo+Screenshot)
*(Replace with actual screenshot)*

## ✨ Key Features

### 🧠 Deep Explainability
- **Natural Language Explanations**: Understand *why* a step is happening (e.g., "Swapping 50 and 20 because 50 > 20").
- **Visual Overlays**: Floating labels track values as they move and compare on the canvas.
- **Call Stack Visualization**: Watch the recursion tree grow in real-time for algorithms like Quick Sort and Merge Sort.

### 💻 Code-Driven Visualization
- **Live Code Editor**: Embedded Monaco Editor (VS Code-like) lets you modify algorithms on the fly.
- **Bidirectional Mapping**: Click a bar to see the code line, or step through code to see the bars move.
- **Function Hooks**: Automatic instrumentation (`__enter`, `__exit`) tracks your custom function calls.

### ⚡ Performance & Chaos
- **Real-Time Stats**: Monitor comparisons, swaps, and writes as the algorithm runs.
- **Complexity Analysis**: See the theoretical Big-O complexity for the current algorithm.
- **Chaos Mode Inputs**: Test algorithms against "Worst Case" (Reverse Sorted), "Best Case" (Nearly Sorted), and edge cases (Few Unique).

### 🛠️ Customization
- **Array Size Slider**: Scale from 10 to 100 elements seamlessly.
- **Input Generators**: Random, Sorted, Reverse, Nearly Sorted, Few Unique.
- **Variable Speed**: Control playback from step-by-step debug speed to instant execution.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/pronzzz/algo-viz.git
   cd algo-viz
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser.

## 🛠️ Technology Stack

- **Frontend**: React, TypeScript, Vite
- **Styling**: TailwindCSS
- **State Management**: Zustand
- **Editor**: @monaco-editor/react
- **Parsing/AST**: Acorn, Astring
- **Rendering**: HTML5 Canvas API

## 📂 Project Structure

```bash
src/
├── algorithms/      # Standard algorithm implementations
├── components/      # React UI components (Stage, Controls, Panels)
├── engine/          # Core execution logic & AST transformation
│   ├── CodeTransformer.ts  # Injects hooks into user code
│   ├── ExecutionManager.ts # Runs code and captures steps
│   └── Renderer.ts         # Canvas drawing logic
├── store/           # Zustand state management
└── types/           # Shared TypeScript interfaces
```

## 🤝 Contributing

Contributions are welcome! Please read the [CONTRIBUTING.md](CONTRIBUTING.md) file for details on our code of conduct, and the process for submitting pull requests.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by the classic Sort Visualizer.
- Built with ❤️ using the React ecosystem.
