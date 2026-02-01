import React from 'react';
import { useVisualizerStore } from '../store/useVisualizerStore';
import { Layers } from 'lucide-react';

export const StackPanel: React.FC = () => {
    const { steps, currentStep } = useVisualizerStore();
    const step = steps[currentStep];

    // We expect step.callStack to be string[]
    // If not present (e.g. non-recursive), show "Global".
    const stack = step?.callStack || [];

    return (
        <div className="h-full bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                <Layers size={18} className="text-purple-600" />
                <h2 className="font-semibold text-gray-700">Call Stack</h2>
            </div>

            <div className="p-4 flex-1 overflow-y-auto flex flex-col-reverse gap-2">
                {/* Visualized as a stack (bottom-up growing) */}

                {stack.length === 0 && (
                    <div className="text-gray-400 text-sm p-2 text-center italic">
                        Main (Global Scope)
                    </div>
                )}

                {stack.map((frame, i) => (
                    <div
                        key={i}
                        className="bg-purple-50 border border-purple-100 p-2 rounded text-sm font-mono text-purple-900 shadow-sm animate-in fade-in slide-in-from-bottom-2"
                    >
                        <span className="font-bold text-purple-700">{i + 1}.</span> {frame}
                    </div>
                ))}
            </div>
        </div>
    );
};
