import React, { useEffect } from 'react';
import { useVisualizerStore } from '../store/useVisualizerStore';
import { ExecutionManager } from '../engine/ExecutionManager';
import { Play, Pause, RotateCcw, StepForward, Shuffle } from 'lucide-react';
import type { AlgorithmType } from '../types';

export const Controls: React.FC = () => {
    const {
        algorithm,
        setAlgorithm,
        isPlaying,
        setIsPlaying,
        reset,
        nextStep,
        prevStep,
        setArray,
        setSteps,
        array,
        code, // Get code from store
        playbackSpeed,
        setPlaybackSpeed,
        arraySize,
        setArraySize,
        inputType,
        setInputType,
    } = useVisualizerStore();

    const handleGenerate = () => {
        const newArray = Array.from({ length: 50 }, () => Math.floor(Math.random() * 250) + 10);
        setArray(newArray);
    };

    const computeSteps = () => {
        let steps: import('../types').AnimationStep[] = [];

        // Phase 1 Algos:
        // switch (algorithm) {
        //     case 'bubble': steps = Algorithms.bubbleSort(array); break;
        //     case 'selection': steps = Algorithms.selectionSort(array); break;
        //     case 'insertion': steps = Algorithms.insertionSort(array); break;
        //     default: steps = [];
        // }
        // setSteps(steps);

        // Phase 2: Use ExecutionManager with Store Code
        const result = ExecutionManager.execute(code, array);
        if (result.error) {
            console.error(result.error);
            alert(`Error: ${result.error}`);
            steps = [];
        } else {
            steps = result.steps;
        }
        setSteps(steps);
    };

    // Re-compute steps when array or code changes (debounce?)
    useEffect(() => {
        // Debounce or just wait for explicit run?
        // Immediate run is powerful but risky with invalid syntax.
        // Let's rely on explicit or just careful typing.
        // For now, run on change.
        try {
            computeSteps();
        } catch (e) {
            // ignore
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [array, code]); // Re-run when array or code changes

    return (
        <div className="flex flex-wrap gap-4 items-center justify-between p-4 bg-white border-t border-gray-200">
            <div className="flex items-center gap-2">
                <select
                    value={algorithm}
                    onChange={(e) => setAlgorithm(e.target.value as AlgorithmType)}
                    className="px-3 py-2 border rounded-lg bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="bubble">Bubble Sort</option>
                    <option value="selection">Selection Sort</option>
                    <option value="insertion">Insertion Sort</option>
                    <option value="merge">Merge Sort</option>
                    <option value="quick">Quick Sort</option>
                </select>

                <div className="flex flex-col gap-1 min-w-[120px]">
                    <label className="text-xs text-gray-500 font-medium">Input Type</label>
                    <select
                        value={inputType}
                        onChange={(e) => setInputType(e.target.value as any)}
                        className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="random">Random</option>
                        <option value="sorted">Sorted</option>
                        <option value="reverse">Reverse Sorted</option>
                        <option value="nearlySorted">Nearly Sorted</option>
                        <option value="fewUnique">Few Unique</option>
                    </select>
                </div>

                <div className="flex flex-col gap-1 w-32">
                    <label className="text-xs text-gray-500 font-medium">Size: {arraySize}</label>
                    <input
                        type="range"
                        min="10"
                        max="100" // 200 bars might be too thin for labels
                        value={arraySize}
                        onChange={(e) => setArraySize(Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                </div>

                <button onClick={handleGenerate} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600" title="Regenerate Array">
                    <Shuffle size={20} />
                </button>
            </div>

            <div className="flex items-center gap-2">
                <button onClick={prevStep} disabled={isPlaying} className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50">
                    <StepForward className="rotate-180" size={20} />
                </button>

                <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors shadow-sm"
                >
                    {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
                </button>

                <button onClick={nextStep} disabled={isPlaying} className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50">
                    <StepForward size={20} />
                </button>

                <button onClick={reset} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 ml-2" title="Reset">
                    <RotateCcw size={20} />
                </button>
            </div>

            <div className="flex items-center gap-2 max-w-xs w-full">
                <span className="text-xs text-gray-500 font-medium">Speed</span>
                <input
                    type="range"
                    min="1"
                    max="500"
                    step="10"
                    dir="rtl" // So left is slow (high ms), right is fast (low ms)? Or typical UI: right is fast.
                    // Usually range: left (min) -> right (max).
                    // If 'value' is delay in ms:
                    // Left (low val) = fast. Right (high val) = slow.
                    // Usually users expect Right = Fast.
                    // So let's invert visual logic or input logic.
                    // Let UI range be 1..100 (speed). Delay = 1000 / speed.
                    // For now, let's just stick to raw MS but maybe invert direction?
                    // standard: Left = Fast (1ms), Right = Slow (500ms).
                    // That feels wrong.
                    // Let's do: Left = Slow (high ms), Right = Fast (low ms).
                    // value = 501 - sliderVal
                    value={501 - playbackSpeed} // Invert: High slider val = Low delay (Fast)
                    onChange={(e) => {
                        const val = parseInt(e.target.value);
                        const delay = 501 - val;
                        // Ensure reasonable bounds if needed, though input min/max handles it
                        // If val is 500, delay=1. If val=1, delay=500.
                        setPlaybackSpeed(delay);
                    }}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
            </div>
        </div>
    );
};
