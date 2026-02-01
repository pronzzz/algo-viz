export type AlgorithmType = 'bubble' | 'selection' | 'insertion' | 'merge' | 'quick' | 'bfs' | 'dfs';
export type VisualizerMode = 'sorting' | 'graph';

export interface GraphNode {
    id: number;
    x: number;
    y: number;
    value: number;
    label?: string;
    state?: 'default' | 'visited' | 'active' | 'queue';
}

export interface GraphEdge {
    source: number;
    target: number;
    weight?: number;
    state?: 'default' | 'active';
}

export interface GraphData {
    nodes: GraphNode[];
    edges: GraphEdge[];
    isDirected: boolean;
}

export interface VisualizerState {
    array: number[];
    algorithm: AlgorithmType;
    isPlaying: boolean;
    isSorted: boolean;
    currentStep: number;
    steps: AnimationStep[];
    playbackSpeed: number;

    // Phase 7
    mode: VisualizerMode;
    graphData: GraphData;
}

export type AnimationStep = {
    type: 'compare' | 'swap' | 'overwrite' | 'sorted';
    indices: number[]; // Indices involved in the operation
    value?: number; // For overwrite operations
    lineNumber?: number; // Line number in the source code
    callStack?: string[]; // Current recursion stack
    stats?: { comparisons: number; swaps: number };
};
