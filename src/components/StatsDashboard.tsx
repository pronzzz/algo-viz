import React from 'react';
import { useVisualizerStore } from '../store/useVisualizerStore';
import { Activity, Clock } from 'lucide-react';

export const StatsDashboard: React.FC = () => {
    const { steps, currentStep, algorithm } = useVisualizerStore();
    const step = steps[currentStep];

    // Default complexities
    const complexities: Record<string, string> = {
        bubble: 'O(n²)',
        selection: 'O(n²)',
        insertion: 'O(n²)',
        merge: 'O(n log n)',
        quick: 'O(n log n)',
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                <Activity size={18} className="text-green-600" />
                <h2 className="font-semibold text-gray-700">Performance</h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">Total &quot;Writes&quot;</div>
                    <div className="font-mono text-xl font-bold text-gray-900">
                        {step?.stats?.swaps || 0}
                    </div>
                </div>

                <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                    <div className="text-xs text-green-700 mb-1 flex items-center gap-1">
                        <Clock size={12} />
                        Time Complexity
                    </div>
                    <div className="font-mono text-xl font-bold text-green-800">
                        {complexities[algorithm] || 'Unknown'}
                    </div>
                </div>
            </div>
        </div>
    );
};
