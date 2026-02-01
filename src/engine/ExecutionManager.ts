import { CodeTransformer } from './CodeTransformer';
import type { AnimationStep } from '../types';

export class ExecutionManager {
    static execute(userCode: string, inputData: number[]): { steps: AnimationStep[]; error?: string } {
        try {
            const instrumentedCode = CodeTransformer.transform(userCode);

            const steps: AnimationStep[] = [];
            let currentLine = 0;
            const callStack: string[] = []; // Track active function calls
            let swaps = 0;

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
            };

            const __exit = () => {
                callStack.pop();
            };

            const data = [...inputData];
            const proxy = new Proxy(data, {
                set: (target, prop, value) => {
                    const index = Number(prop);
                    if (!isNaN(index)) {
                        swaps++; // Every write is a mutation
                        steps.push({
                            type: 'overwrite',
                            indices: [index],
                            value: Number(value),
                            lineNumber: currentLine,
                            callStack: [...callStack],
                            stats: { comparisons: 0, swaps } // We only track swaps faithfully for now
                        });
                    }
                    return Reflect.set(target, prop, value);
                }
            });

            const entryPointAttempt = `
        ${instrumentedCode}
        if (typeof sort === 'function') { sort(arr); return; }
        if (typeof bubbleSort === 'function') { bubbleSort(arr); return; }
        if (typeof selectionSort === 'function') { selectionSort(arr); return; }
        if (typeof insertionSort === 'function') { insertionSort(arr); return; }
        // If unnamed function expression is the code?
        // We might just evaluate it? 
      `;

            // We pass 'arr' (the proxy) and '__line' (the tracker)
            const fn = new Function('arr', '__line', '__enter', '__exit', entryPointAttempt);
            fn(proxy, __line, __enter, __exit);

            return { steps };
        } catch (e: any) {
            return { steps: [], error: e.message };
        }
    }
}
