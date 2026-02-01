import React from 'react';
import { useVisualizerStore } from '../store/useVisualizerStore';
import { ExplanationEngine } from '../engine/ExplanationEngine';
import { Info, BookOpen } from 'lucide-react';

export const ExplanationPanel: React.FC = () => {
    const { steps, currentStep, array } = useVisualizerStore();

    // We need the state BEFORE the current step executed to show "what just happened"?
    // OR "what is happening now"?
    // Usually visualizers show the state AFTER the step.
    // ExplanationEngine needs the step object.

    const step = steps[currentStep];
    // Note: 'array' in store is the CURRENT state (already applied step).
    // If we want to explain a 'swap', the swap likely already happened in the store.
    // So 'val1' and 'val2' in the array are ALREADY swapped.
    // This makes generating text tricky: "Swapping 50 and 20" -> but array shows 20 and 50.
    // Ideally, ExplanationEngine should probably receive the 'prev' state or be robust.
    // Phase 3 MVP: Accept that values might be post-swap.

    const explanation = ExplanationEngine.explain(step, array);

    return (
        <div className="h-full bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                <BookOpen size={18} className="text-blue-600" />
                <h2 className="font-semibold text-gray-700">Explanation</h2>
            </div>

            <div className="p-4 flex-1 overflow-y-auto">
                <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-1 rounded">
                            {explanation.title}
                        </span>
                    </div>
                    <p className="text-gray-700 text-lg leading-relaxed">
                        {explanation.details}
                    </p>
                </div>

                {explanation.metrics && explanation.metrics.length > 0 && (
                    <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-gray-100">
                        {explanation.metrics.map((m, i) => (
                            <div key={i} className="bg-gray-50 p-3 rounded-lg">
                                <div className="text-xs text-gray-500 mb-1">{m.label}</div>
                                <div className="font-mono font-medium text-gray-900">{m.value}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="p-3 bg-blue-50/50 border-t border-blue-100 text-xs text-blue-600 flex items-start gap-2">
                <Info size={14} className="mt-0.5 shrink-0" />
                <p>The explanation updates automatically as you step through the algorithm.</p>
            </div>
        </div>
    );
};
