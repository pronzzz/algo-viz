import type { VisualizerState } from '../types';

export class Renderer {
    private ctx: CanvasRenderingContext2D;
    private canvas: HTMLCanvasElement;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Could not get 2D context');
        this.ctx = context;
    }

    public draw(state: VisualizerState) {
        const { width, height } = this.canvas;
        this.ctx.clearRect(0, 0, width, height);

        const array = state.array;
        const len = array.length;
        if (len === 0) return;

        const barWidth = width / len;
        const maxVal = Math.max(...array, 100); // Avoid divide by zero, ensure some height

        // Determine active indices from the current step if any
        const currentStepIndex = state.currentStep;
        const step = state.steps[currentStepIndex];

        let compareIndices: number[] = [];
        let swapIndices: number[] = [];

        if (step) {
            if (step.type === 'compare') compareIndices = step.indices;
            if (step.type === 'swap') swapIndices = step.indices;
        }

        // Draw bars
        array.forEach((value, index) => {
            const barHeight = (value / maxVal) * (height - 20); // Leave some padding
            const x = index * barWidth;
            const y = height - barHeight;

            let color = '#6366f1'; // Indigo-500 (Default)

            if (compareIndices.includes(index)) {
                color = '#eab308'; // Yellow-500 (Compare)
            } else if (swapIndices.includes(index)) {
                color = '#ef4444'; // Red-500 (Swap)
            } else if (state.isSorted) {
                color = '#22c55e'; // Green-500 (Sorted)
            }

            this.ctx.fillStyle = color;
            this.ctx.fillRect(x, y, barWidth - 1, barHeight); // -1 for gap
        });
    }

    public resize(width: number, height: number) {
        this.canvas.width = width;
        this.canvas.height = height;
        // Redraw will happen on next update cycle
    }
}
