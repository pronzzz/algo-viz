import type { AnimationStep } from '../types';

export const bubbleSort = (array: number[]): AnimationStep[] => {
    const steps: AnimationStep[] = [];
    const arr = [...array];
    const n = arr.length;

    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            steps.push({ type: 'compare', indices: [j, j + 1] });
            if (arr[j] > arr[j + 1]) {
                steps.push({ type: 'swap', indices: [j, j + 1] });
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
            }
        }
    }

    // Mark all as sorted at the end? Or progressively?
    // For 'sorted' steps, we can add them at the end of each pass or all at once.
    // Let's add simple visual cue at end for now.
    steps.push({ type: 'sorted', indices: Array.from({ length: n }, (_, i) => i) });

    return steps;
};

export const selectionSort = (array: number[]): AnimationStep[] => {
    const steps: AnimationStep[] = [];
    const arr = [...array];
    const n = arr.length;

    for (let i = 0; i < n; i++) {
        let minIdx = i;
        for (let j = i + 1; j < n; j++) {
            steps.push({ type: 'compare', indices: [minIdx, j] });
            if (arr[j] < arr[minIdx]) {
                minIdx = j;
            }
        }
        if (minIdx !== i) {
            steps.push({ type: 'swap', indices: [i, minIdx] });
            [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
        }
    }
    steps.push({ type: 'sorted', indices: Array.from({ length: n }, (_, i) => i) });
    return steps;
};

export const insertionSort = (array: number[]): AnimationStep[] => {
    const steps: AnimationStep[] = [];
    const arr = [...array];
    const n = arr.length;

    for (let i = 1; i < n; i++) {
        let key = arr[i];
        let j = i - 1;

        // We visualize 'key' being compared
        steps.push({ type: 'compare', indices: [i, j] });

        while (j >= 0 && arr[j] > key) {
            steps.push({ type: 'compare', indices: [j, j + 1] }); // Re-compare as we shift
            steps.push({ type: 'overwrite', indices: [j + 1], value: arr[j] });
            arr[j + 1] = arr[j];
            j = j - 1;
        }
        steps.push({ type: 'overwrite', indices: [j + 1], value: key });
        arr[j + 1] = key;
    }
    steps.push({ type: 'sorted', indices: Array.from({ length: n }, (_, i) => i) });
    return steps;
};
