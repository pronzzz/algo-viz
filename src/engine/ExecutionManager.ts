import { CodeTransformer } from './CodeTransformer';
import type { AnimationStep } from '../types';

export class ExecutionManager {
    static execute(userCode: string, inputs: any[]): { steps: AnimationStep[]; error?: string } {
        try {
            const instrumentedCode = CodeTransformer.transform(userCode);

            const steps: AnimationStep[] = [];
            let currentLine = 0;
            const callStack: string[] = [];
            let swaps = 0;
            let comparisons = 0;

            const __line = (line: number) => {
                currentLine = line;
            };

            const __enter = (name: string, args: any[]) => {
                // Format args
                const argStr = args.map(a => {
                    if (Array.isArray(a)) return `[Array(${a.length})]`;
                    return String(a);
                }).join(', ');
                callStack.push(`${name}(${argStr})`);

                steps.push({
                    type: 'overwrite',
                    indices: [],
                    value: 0,
                    lineNumber: currentLine,
                    callStack: [...callStack],
                    stats: { comparisons, swaps }
                });
            };

            const __exit = () => {
                callStack.pop();
                steps.push({
                    type: 'overwrite',
                    indices: [],
                    value: 0,
                    lineNumber: currentLine,
                    callStack: [...callStack],
                    stats: { comparisons, swaps }
                });
            };

            // Proxy all array inputs
            const proxiedInputs = inputs.map(input => {
                if (Array.isArray(input)) {
                    const data = [...input];
                    return new Proxy(data, {
                        get: (target, prop) => {
                            return Reflect.get(target, prop);
                        },
                        set: (target, prop, value) => {
                            const index = Number(prop);
                            if (!isNaN(index)) {
                                swaps++;
                                steps.push({
                                    type: 'overwrite',
                                    indices: [index],
                                    value: Number(value),
                                    lineNumber: currentLine,
                                    callStack: [...callStack],
                                    stats: { comparisons: 0, swaps }
                                });
                            }
                            return Reflect.set(target, prop, value);
                        }
                    });
                }
                return input;
            });

            // Dynamic entry point for any function
            const entryPointAttempt = `
        ${instrumentedCode}
        
        // Try standard algorithms and graph algorithms
        // We use 'arguments[0]' which is the 'proxiedInputs' array passed to the wrapper
        const inputs = arguments[0];
        
        if (typeof bubbleSort === 'function') { bubbleSort(...inputs); return; }
        if (typeof selectionSort === 'function') { selectionSort(...inputs); return; }
        if (typeof insertionSort === 'function') { insertionSort(...inputs); return; }
        if (typeof mergeSort === 'function') { mergeSort(...inputs); return; }
        if (typeof quickSort === 'function') { quickSort(...inputs); return; }
        if (typeof bfs === 'function') { bfs(...inputs); return; }
        if (typeof dfs === 'function') { dfs(...inputs); return; }
        
        // Fallback for generic 'sort'
        if (typeof sort === 'function') { sort(...inputs); return; }
      `;

            // Function signature: (inputsArray, __line, __enter, __exit)
            // We pass proxiedInputs as the first argument 'inputs'
            const fn = new Function('inputs', '__line', '__enter', '__exit', entryPointAttempt);
            fn(proxiedInputs, __line, __enter, __exit);

            return { steps };
        } catch (e: any) {
            return { steps: [], error: e.message };
        }
    }
}
