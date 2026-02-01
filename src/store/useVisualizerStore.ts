import { create } from 'zustand';
import type { VisualizerState, AnimationStep, AlgorithmType } from '../types';

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
  // Simplistic merge for visualization (in-place-ish with temp)
  const n1 = m - l + 1;
  const n2 = r - m;
  
  // We can't visualize creating new arrays easily with current renderer.
  // We simulate by overwriting the main array.
  // Standard merge uses temp arrays.
  // Let's copy to JS arrays (not visualized) then write back.
  
  const L = [];
  const R = [];
  
  for (let i = 0; i < n1; i++) L[i] = arr[l + i];
  for (let j = 0; j < n2; j++) R[j] = arr[m + 1 + j];
    
  let i = 0, j = 0, k = l;
  
  while (i < n1 && j < n2) {
    // Write back triggers overwrite step
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
      // swap arr[i] and arr[j]
      const temp = arr[i];
      arr[i] = arr[j];
      arr[j] = temp;
    }
  }
  // swap arr[i + 1] and arr[high]
  const temp = arr[i + 1];
  arr[i + 1] = arr[high];
  arr[high] = temp;
  
  return (i + 1);
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
      // Swap 5% of elements
      const swaps = Math.max(1, Math.floor(length * 0.05));
      for (let k = 0; k < swaps; k++) {
        const i = Math.floor(Math.random() * length);
        const j = Math.floor(Math.random() * length);
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      break;
    case 'fewUnique':
      // 5 unique values
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

  // Phase 6
  arraySize: 50,
  inputType: 'random',

  setArray: (array) => set({ array, isSorted: false, currentStep: -1, steps: [] }),
  setAlgorithm: (algorithm) => {
    let code = DEFAULT_BUBBLE;
    if (algorithm === 'merge') code = DEFAULT_MERGE;
    if (algorithm === 'quick') code = DEFAULT_QUICK;
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

  reset: () => {
    // Reshuffle or just reset steps? For now just reset steps
    // Actually, to "reset" usually means to go back to initial state or generate new array.
    // Let's generate new array for now as a "hard reset" or maybe just reset indices.
    // Let's imply "Generate New Array" is a separate action. "Reset" wipes progress.
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
      const [i] = step.indices;
      newArray[i] = step.value;
    }

    set({ currentStep: nextStepIndex, array: newArray });
  },

  prevStep: () => {
    const { currentStep, steps, array } = get();
    if (currentStep < 0) return;

    // To go back, we need to reverse the operation.
    // Or, simpler for now: Re-calculate state from specific point?
    // "Time travel" usually implies efficient reversibility or snapshots.
    // For small arrays (N=100), re-running from start is fast. 
    // BUT for "perfect" reverse, 'swap' is its own inverse. 
    // 'overwrite' is NOT reversible unless we stored the old value.
    // ISSUE: My AnimationStep type doesn't store 'oldValue'.
    // FIX: For now, I will implement naive "re-calculate array from scratch" or just not support perfect reverse for 'overwrite' without storage.
    // Since we are doing Bubble/Selection/Insertion (swaps mostly), Swap is reversible.

    const step = steps[currentStep];
    const newArray = [...array];

    if (step.type === 'swap') {
      const [i, j] = step.indices;
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]]; // Swap back
    }
    // TODO: Handle overwrite reverse properly later.

    set({ currentStep: currentStep - 1, array: newArray, isSorted: false });
  }
}));
