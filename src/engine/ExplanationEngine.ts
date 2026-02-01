import type { AnimationStep } from '../types';

export interface Explanation {
    title: string;
    details: string;
    metrics?: { label: string; value: string }[];
}

export class ExplanationEngine {
    static explain(step: AnimationStep | undefined, array: number[]): Explanation {
        if (!step) {
            return {
                title: "Ready to Start",
                details: "Click Play or Step Forward to begin the algorithm execution.",
            };
        }

        const { type, indices, value, lineNumber } = step;
        const val1 = indices[0] !== undefined ? array[indices[0]] : null;
        const val2 = indices[1] !== undefined ? array[indices[1]] : null;

        let title = "";
        let details = "";
        let metrics: { label: string; value: string }[] = [];

        // Base explanation on step type
        switch (type) {
            case 'compare':
                title = "Comparison";
                details = `Comparing elements at indices ${indices[0]} and ${indices[1]}.`;
                if (val1 !== null && val2 !== null) {
                    details += ` Values are ${val1} and ${val2}.`;
                    // Heuristic: Bubble Sort / Simple sorts usually compare adjacent or finding min
                    if (val1 > val2) {
                        details += ` ${val1} > ${val2}, so a swap might be needed depending on the sort order.`;
                    } else {
                        details += ` ${val1} <= ${val2}, no swap needed.`;
                    }
                }
                break;
            case 'swap':
                title = "Swap";
                details = `Swapping elements at indices ${indices[0]} and ${indices[1]}.`;
                if (val1 !== null && val2 !== null) {
                    details += ` Moving ${val1} to index ${indices[1]} and ${val2} to index ${indices[0]}.`;
                }
                break;
            case 'overwrite':
                title = "Overwrite";
                details = `Writing value ${value} to index ${indices[0]}.`;
                break;
            case 'sorted':
                title = "Sorted";
                details = "The array is now sorted.";
                break;
        }

        if (lineNumber) {
            metrics.push({ label: "Line", value: lineNumber.toString() });
        }

        return { title, details, metrics };
    }
}
