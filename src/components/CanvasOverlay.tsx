import React from 'react';
import { useVisualizerStore } from '../store/useVisualizerStore';

export const CanvasOverlay: React.FC<{ width: number, height: number }> = ({ width, height }) => {
    const { steps, currentStep, array } = useVisualizerStore();
    const step = steps[currentStep];

    if (!step || !step.indices || width === 0) return null;

    // Must match Renderer logic
    const len = array.length;
    if (len === 0) return null;
    const barWidth = width / len;

    // We only show overlay for Compare and Swap
    if (step.type !== 'compare' && step.type !== 'swap') return null;

    return (
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
            {step.indices.map((idx, i) => {
                const val = array[idx];
                const x = idx * barWidth + (barWidth / 2);
                // Position above the bar. 
                // Renderer: height - barHeight. 
                // BarHeight = (value / max) * (height-20).
                const maxVal = Math.max(...array, 100);
                const barHeight = (val / maxVal) * (height - 20);
                const y = height - barHeight - 25; // 25px above bar using bottom reference? 
                // SVG/HTML coords: Top is 0. 
                // Bar Top Y = height - barHeight.

                return (
                    <div
                        key={i}
                        className="absolute transform -translate-x-1/2 flex flex-col items-center transition-all duration-200"
                        style={{ left: x, top: y }}
                    >
                        <div className="bg-gray-900 text-white text-xs font-bold px-2 py-1 rounded shadow-lg mb-1 whitespace-nowrap">
                            {val}
                        </div>
                        <div className="w-0.5 h-3 bg-gray-400"></div>
                    </div>
                );
            })}
        </div>
    );
};
