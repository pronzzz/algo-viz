import { create } from 'zustand';
import type { VisualizerState, AnimationStep, AlgorithmType, VisualizerMode, GraphData } from '../types';

interface VisualizerStore extends VisualizerState {
  setArray: (array: number[]) => void;
  setAlgorithm: (algo: AlgorithmType) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setSteps: (steps: AnimationStep[]) => void;
  setCurrentStep: (step: number) => void;
  reset: () => void;
  nextStep: () => void;
  prevStep: () => void;
  setPlaybackSpeed: (speed: number) => void;
  code: string;
  activeLine: number | undefined;
  setCode: (code: string) => void;

  // Phase 6
  arraySize: number;
  inputType: 'random' | 'sorted' | 'reverse' | 'nearlySorted' | 'fewUnique';
  setArraySize: (size: number) => void;
  setInputType: (type: 'random' | 'sorted' | 'reverse' | 'nearlySorted' | 'fewUnique') => void;
  generateArray: () => void;

  // Phase 7
  mode: VisualizerMode;
  graphData: GraphData;
  setMode: (mode: VisualizerMode) => void;
  generateGraph: () => void;
}

const DEFAULT_BUBBLE = `function bubbleSort(arr) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        let temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
      }
    }
  }
}`;

const DEFAULT_MERGE = `function mergeSort(arr, l = 0, r = arr.length - 1) {
  if (l >= r) return;
  
  const m = Math.floor(l + (r - l) / 2);
  
  mergeSort(arr, l, m);
  mergeSort(arr, m + 1, r);
  
  merge(arr, l, m, r);
}

function merge(arr, l, m, r) {
  const n1 = m - l + 1;
  const n2 = r - m;
  
  const L = [];
  const R = [];
  
  for (let i = 0; i < n1; i++) L[i] = arr[l + i];
  for (let j = 0; j < n2; j++) R[j] = arr[m + 1 + j];
    
  let i = 0, j = 0, k = l;
  
  while (i < n1 && j < n2) {
    if (L[i] <= R[j]) {
      arr[k] = L[i];
      i++;
    } else {
      arr[k] = R[j];
      j++;
    }
    k++;
  }
  
  while (i < n1) {
    arr[k] = L[i];
    i++;
    k++;
  }
  
  while (j < n2) {
    arr[k] = R[j];
    j++;
    k++;
  }
}`;

const DEFAULT_QUICK = `function quickSort(arr, low = 0, high = arr.length - 1) {
  if (low < high) {
    const pi = partition(arr, low, high);
    
    quickSort(arr, low, pi - 1);
    quickSort(arr, pi + 1, high);
  }
}

function partition(arr, low, high) {
  const pivot = arr[high];
  let i = (low - 1);
  
  for (let j = low; j <= high - 1; j++) {
    if (arr[j] < pivot) {
      i++;
      const temp = arr[i];
      arr[i] = arr[j];
      arr[j] = temp;
    }
  }
  const temp = arr[i + 1];
  arr[i + 1] = arr[high];
  arr[high] = temp;
  
  return (i + 1);
}`;

const DEFAULT_BFS = `function bfs(adj, visited, startNode = 0) {
  // adj: adjacency list (array of arrays)
  // visited: boolean array [0, 0...] (0=unvisited, 1=visited)
  
  const queue = [startNode];
  visited[startNode] = 1; 

  while (queue.length > 0) {
    const u = queue.shift();
    const neighbors = adj[u] || [];
    
    for (let i = 0; i < neighbors.length; i++) {
        const v = neighbors[i];
        if (visited[v] === 0) {
            visited[v] = 1; 
            queue.push(v);
        }
    }
  }
}`;

const DEFAULT_DFS = `function dfs(adj, visited, u = 0) {
  visited[u] = 1; 
  
  const neighbors = adj[u] || [];
  
  for (let i = 0; i < neighbors.length; i++) {
      const v = neighbors[i];
      if (visited[v] === 0) {
          dfs(adj, visited, v);
      }
  }
}`;

// Helper to generate array based on type
const generateArrayData = (length: number, type: 'random' | 'sorted' | 'reverse' | 'nearlySorted' | 'fewUnique') => {
  const min = 10;
  const max = 300;
  let arr: number[] = [];
  switch (type) {
    case 'sorted':
      arr = Array.from({ length }, (_, i) => Math.floor(min + (i / length) * (max - min)));
      break;
    case 'reverse':
      arr = Array.from({ length }, (_, i) => Math.floor(min + (i / length) * (max - min))).reverse();
      break;
    case 'nearlySorted':
      arr = Array.from({ length }, (_, i) => Math.floor(min + (i / length) * (max - min)));
      const swaps = Math.max(1, Math.floor(length * 0.05));
      for (let k = 0; k < swaps; k++) {
        const i = Math.floor(Math.random() * length);
        const j = Math.floor(Math.random() * length);
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      break;
    case 'fewUnique':
      const uniqueValues = Array.from({ length: 5 }, () => Math.floor(Math.random() * (max - min + 1) + min)).sort((a, b) => a - b);
      arr = Array.from({ length }, () => uniqueValues[Math.floor(Math.random() * uniqueValues.length)]);
      break;
    case 'random':
    default:
      arr = Array.from({ length }, () => Math.floor(Math.random() * (max - min + 1) + min));
      break;
  }
  return arr;
};

// Helper for Graph Generation
const generateGraphData = (nodeCount: number = 8): GraphData => {
  const nodes = [];
  const edges = [];
  const centerX = 50; // Percent
  const centerY = 50; // Percent
  const radius = 35;  // Percent

  for (let i = 0; i < nodeCount; i++) {
    const angle = (i / nodeCount) * 2 * Math.PI;
    nodes.push({
      id: i,
      value: i,
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
      state: 'default'
    } as any);
  }

  for (let i = 0; i < nodeCount; i++) {
    edges.push({ source: i, target: (i + 1) % nodeCount });
    if (Math.random() > 0.5) {
      const target = (i + 2) % nodeCount;
      edges.push({ source: i, target: target });
    }
  }

  return { nodes, edges, isDirected: false };
};

export const useVisualizerStore = create<VisualizerStore>((set, get) => ({
  array: generateArrayData(50, 'random'),
  algorithm: 'bubble',
  isPlaying: false,
  isSorted: false,
  currentStep: -1,
  steps: [],
  playbackSpeed: 50, // ms delay
  code: DEFAULT_BUBBLE,
  activeLine: undefined,

  // Phase 7
  mode: 'sorting',
  graphData: generateGraphData(8),

  // Phase 6
  arraySize: 50,
  inputType: 'random',

  setArray: (array) => set({ array, isSorted: false, currentStep: -1, steps: [] }),
  setAlgorithm: (algorithm) => {
    let code = DEFAULT_BUBBLE;
    if (algorithm === 'merge') code = DEFAULT_MERGE;
    if (algorithm === 'quick') code = DEFAULT_QUICK;
    if (algorithm === 'bfs') code = DEFAULT_BFS;
    if (algorithm === 'dfs') code = DEFAULT_DFS;
    set({ algorithm, isSorted: false, currentStep: -1, steps: [], code });
  },
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setSteps: (steps) => set({ steps }),
  setCurrentStep: (currentStep) => {
    const { steps } = get();
    const step = steps[currentStep];
    set({ currentStep, activeLine: step?.lineNumber });
  },
  setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),
  setCode: (code) => set({ code, isSorted: false, currentStep: -1, steps: [] }),

  setArraySize: (size) => {
    set({ arraySize: size });
    get().generateArray();
  },
  setInputType: (type) => {
    set({ inputType: type });
    get().generateArray();
  },
  generateArray: () => {
    const { arraySize, inputType } = get();
    const array = generateArrayData(arraySize, inputType);
    set({ array, isSorted: false, currentStep: -1, steps: [] });
  },

  // Phase 7 Actions
  setMode: (mode) => set({ mode }),
  generateGraph: () => set({ graphData: generateGraphData(8), currentStep: -1, steps: [] }),

  reset: () => {
    set({ currentStep: -1, isPlaying: false, isSorted: false });
  },

  nextStep: () => {
    const { currentStep, steps, array } = get();
    if (currentStep >= steps.length - 1) {
      set({ isPlaying: false, isSorted: true });
      return;
    }

    const nextStepIndex = currentStep + 1;
    const step = steps[nextStepIndex];
    const newArray = [...array];

    if (step.type === 'swap') {
      const [i, j] = step.indices;
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    } else if (step.type === 'overwrite' && step.value !== undefined) {
      // For graphs (Phase 7), we might be overwriting a 'visited' array if we proxy passed it.
      // But 'array' state is the sorting array.
      // Wait, where do we store the 'visited' state for rendering?
      // Step 69 ExecutionManager pushes 'overwrite' steps with indices.
      // Renderer draws graph based on node colors.
      // We need to map 'AnimationStep' indices to 'GraphNode' state.
      // Current renderer uses 'step.indices' to color nodes.
      // This works IF the step refers to nodes by index 0..N.
      // The 'bfs' template writes to 'visited[nodeId]'. 
      // Since 'visited' is proxied, writing 'visited[5]=1' creates step { type: overwrite, indices: [5], value: 1 }.
      // Renderer checks step.indices. If 5 is in it, it colors node 5.
      // Perfect!

      const [i] = step.indices;
      newArray[i] = step.value;
    }

    set({ currentStep: nextStepIndex, array: newArray });
  },

  prevStep: () => {
    const { currentStep, steps, array } = get();
    if (currentStep < 0) return;

    const step = steps[currentStep];
    const newArray = [...array];

    if (step.type === 'swap') {
      const [i, j] = step.indices;
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    set({ currentStep: currentStep - 1, array: newArray, isSorted: false });
  }
}));
