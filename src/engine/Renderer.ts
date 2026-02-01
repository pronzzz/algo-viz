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

        if (state.mode === 'graph') {
            this.drawGraph(state);
            return;
        }

        const array = state.array;
        const len = array.length;
        if (len === 0) return;

        const barWidth = width / len;
        const maxVal = Math.max(...array, 100);

        // Determine active indices
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
            const barHeight = (value / maxVal) * (height - 20);
            const x = index * barWidth;
            const y = height - barHeight;

            let color = '#6366f1';

            if (compareIndices.includes(index)) {
                color = '#eab308';
            } else if (swapIndices.includes(index)) {
                color = '#ef4444';
            } else if (state.isSorted) {
                color = '#22c55e';
            }

            this.ctx.fillStyle = color;
            this.ctx.fillRect(x, y, barWidth - 1, barHeight);
        });
    }

    private drawGraph(state: VisualizerState) {
        const { width, height } = this.canvas;
        const { nodes, edges } = state.graphData;

        // Draw Edges
        this.ctx.strokeStyle = '#94a3b8'; // Slate-400
        this.ctx.lineWidth = 2;

        edges.forEach(edge => {
            const start = nodes.find(n => n.id === edge.source);
            const end = nodes.find(n => n.id === edge.target);
            if (start && end) {
                // Convert percent to pixels
                const x1 = (start.x / 100) * width;
                const y1 = (start.y / 100) * height;
                const x2 = (end.x / 100) * width;
                const y2 = (end.y / 100) * height;

                this.ctx.beginPath();
                this.ctx.moveTo(x1, y1);
                this.ctx.lineTo(x2, y2);
                this.ctx.stroke();
            }
        });

        // Draw Nodes
        nodes.forEach(node => {
            const x = (node.x / 100) * width;
            const y = (node.y / 100) * height;
            const radius = 20;

            this.ctx.beginPath();
            this.ctx.arc(x, y, radius, 0, Math.PI * 2);

            // Color based on state
            // We need to map 'AnimationStep' indices to node IDs if possible?
            // For now, let's assume node 'value' or 'id' matches the indices in the algorithm.
            let fill = '#e2e8f0'; // Slate-200 (Default)
            let stroke = '#64748b'; // Slate-500

            // Check if active in current step
            const currentStepIndex = state.currentStep;
            const step = state.steps[currentStepIndex];

            // Basic visualization: "compare" = visited/active, "swap" = ...?
            // "overwrite" (visited array) -> green
            if (step) {
                if (step.indices.includes(node.id)) {
                    if (step.type === 'compare') {
                        fill = '#fde047'; // Yellow-300
                        stroke = '#eab308';
                    } else if (step.type === 'overwrite') { // Marked visited
                        fill = '#86efac'; // Green-300
                        stroke = '#22c55e';
                    }
                }
            }

            this.ctx.fillStyle = fill;
            this.ctx.strokeStyle = stroke;
            this.ctx.lineWidth = 3;
            this.ctx.fill();
            this.ctx.stroke();

            // Label
            this.ctx.fillStyle = '#1e293b'; // Slate-800
            this.ctx.font = 'bold 12px Inter, sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(node.id.toString(), x, y);
        });
    }

    public resize(width: number, height: number) {
        this.canvas.width = width;
        this.canvas.height = height;
        // Redraw will happen on next update cycle
    }
}
