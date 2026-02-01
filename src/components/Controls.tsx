import React, { useEffect } from 'react';
import { useVisualizerStore } from '../store/useVisualizerStore';
import { ExecutionManager } from '../engine/ExecutionManager';
import { Play, Pause, RotateCcw, StepForward, Shuffle, GitGraph, BarChart3, Activity } from 'lucide-react';
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
        setSteps,
        array,
        code,
        playbackSpeed,
        setPlaybackSpeed,
        arraySize,
        setArraySize,
        inputType,
        setInputType,
        mode,
        setMode,
        graphData,
        generateGraph
    } = useVisualizerStore();

    const handleGenerate = () => {
        if (mode === 'sorting') {
            const { generateArray } = useVisualizerStore.getState();
            generateArray();
        } else {
            generateGraph();
        }
        setSteps([]);
    };

    const computeSteps = () => {
        let steps: import('../types').AnimationStep[] = [];
        let inputs: any[] = [];

        if (mode === 'sorting') {
            inputs = [array];
        } else {
            const nodeCount = graphData.nodes.length;
            const adj: number[][] = Array.from({ length: nodeCount }, () => []);
            graphData.edges.forEach(e => {
                adj[e.source].push(e.target);
                if (!graphData.isDirected) {
                    adj[e.target].push(e.source);
                }
            });
            const visited = new Array(nodeCount).fill(0);
            inputs = [adj, visited];
        }

        const result = ExecutionManager.execute(code, inputs);
        if (result.error) {
            console.error(result.error);
            steps = [];
        } else {
            steps = result.steps;
        }
        setSteps(steps);
    };

    useEffect(() => {
        try {
            computeSteps();
        } catch (e) {
            // ignore
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [array, graphData, code, mode]);

    return (
        <div className="flex flex-col gap-4 p-6 bg-white/80 backdrop-blur-xl border-t border-gray-200 shadow-[0_-4px_24px_rgba(0,0,0,0.05)] rounded-t-[32px] mx-4 mb-0 transition-all duration-300">
            <div className="flex items-center justify-center mb-2">
                <div className="flex bg-gray-100/80 p-1 rounded-2xl">
                    <button
                        onClick={() => setMode('sorting')}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${mode === 'sorting' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <span className="flex items-center gap-2"><BarChart3 size={16} /> Sorting</span>
                    </button>
                    <button
                        onClick={() => setMode('graph')}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${mode === 'graph' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <span className="flex items-center gap-2"><GitGraph size={16} /> Graph</span>
                    </button>
                </div>
            </div>

            <div className="flex flex-wrap gap-4 items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <select
                            value={algorithm}
                            onChange={(e) => setAlgorithm(e.target.value as AlgorithmType)}
                            className="appearance-none pl-4 pr-10 py-3 bg-gray-50 border-0 rounded-2xl text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-blue-100 hover:bg-gray-100 transition-colors cursor-pointer"
                        >
                            {mode === 'sorting' ? (
                                <>
                                    <option value="bubble">Bubble Sort</option>
                                    <option value="selection">Selection Sort</option>
                                    <option value="insertion">Insertion Sort</option>
                                    <option value="merge">Merge Sort</option>
                                    <option value="quick">Quick Sort</option>
                                </>
                            ) : (
                                <>
                                    <option value="bfs">Breadth-First Search</option>
                                    <option value="dfs">Depth-First Search</option>
                                </>
                            )}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                            <Activity size={16} />
                        </div>
                    </div>

                    {mode === 'sorting' ? (
                        <>
                            <div className="hidden md:flex flex-col gap-1 min-w-[120px]">
                                <select
                                    value={inputType}
                                    onChange={(e) => setInputType(e.target.value as any)}
                                    className="px-3 py-2 bg-transparent text-gray-500 text-xs font-medium hover:text-blue-600 cursor-pointer outline-none"
                                >
                                    <option value="random">Random</option>
                                    <option value="sorted">Sorted</option>
                                    <option value="reverse">Reverse</option>
                                    <option value="nearlySorted">Nearly Sorted</option>
                                    <option value="fewUnique">Unique</option>
                                </select>
                            </div>
                            <div className="hidden md:flex items-center gap-2">
                                <span className="text-xs text-gray-400">N={arraySize}</span>
                                <input
                                    type="range"
                                    min="10"
                                    max="100"
                                    value={arraySize}
                                    onChange={(e) => setArraySize(Number(e.target.value))}
                                    className="w-24 h-1 bg-gray-200 rounded-full appearance-none accent-blue-600"
                                />
                            </div>
                        </>
                    ) : (
                        <button onClick={handleGenerate} className="p-3 bg-gray-50 hover:bg-blue-50 text-blue-600 rounded-2xl transition-colors" title="New Graph">
                            <Shuffle size={20} />
                        </button>
                    )}

                    {mode === 'sorting' && (
                        <button onClick={handleGenerate} className="p-3 hover:bg-gray-100 rounded-2xl text-gray-600 transition-colors" title="Shuffle">
                            <Shuffle size={20} />
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-[24px]">
                    <button onClick={prevStep} disabled={isPlaying} className="p-3 hover:bg-white hover:shadow-sm rounded-xl text-gray-600 disabled:opacity-30 transition-all">
                        <StepForward className="rotate-180" size={20} />
                    </button>

                    <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="w-12 h-12 flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white rounded-2xl transition-all shadow-md active:scale-95"
                    >
                        {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
                    </button>

                    <button onClick={nextStep} disabled={isPlaying} className="p-3 hover:bg-white hover:shadow-sm rounded-xl text-gray-600 disabled:opacity-30 transition-all">
                        <StepForward size={20} />
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <button onClick={reset} className="p-3 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-2xl transition-colors" title="Reset">
                        <RotateCcw size={20} />
                    </button>

                    <div className="hidden sm:flex flex-col items-end gap-1 w-24">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Speed</span>
                        <input
                            type="range"
                            min="1"
                            max="500"
                            step="10"
                            value={501 - playbackSpeed}
                            onChange={(e) => {
                                setPlaybackSpeed(501 - parseInt(e.target.value));
                            }}
                            className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-blue-600"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
