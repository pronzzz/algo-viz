export type AlgorithmType = 'bubble' | 'selection' | 'insertion' | 'merge' | 'quick';

export interface VisualizerState {
    array: number[];
    algorithm: AlgorithmType;
    isPlaying: boolean;
    isSorted: boolean;
    currentStep: number;
    steps: AnimationStep[];
    playbackSpeed: number;
}

export type AnimationStep = {
    type: 'compare' | 'swap' | 'overwrite' | 'sorted';
    indices: number[]; // Indices involved in the operation
    value?: number; // For overwrite operations
    lineNumber?: number; // Line number in the source code
    callStack?: string[]; // Current recursion stack
    stats?: { comparisons: number; swaps: number };
};
