import React, { useEffect, useRef, useLayoutEffect } from 'react';
import { useVisualizerStore } from '../store/useVisualizerStore';
import { Renderer } from '../engine/Renderer';
import { CanvasOverlay } from './CanvasOverlay'; // Add import

export const CanvasStage: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rendererRef = useRef<Renderer | null>(null);

    // Connect to store
    const {
        array,
        algorithm,
        currentStep,
        steps,
        isSorted,
        isPlaying,
        playbackSpeed,
        nextStep,
        mode,
        graphData
    } = useVisualizerStore();

    // Initialize Renderer
    useEffect(() => {
        if (canvasRef.current && !rendererRef.current) {
            rendererRef.current = new Renderer(canvasRef.current);
        }
    }, []);

    // Handle Resizing
    useLayoutEffect(() => {
        const handleResize = () => {
            if (canvasRef.current && rendererRef.current) {
                const parent = canvasRef.current.parentElement;
                if (parent) {
                    rendererRef.current.resize(parent.clientWidth, parent.clientHeight);
                    rendererRef.current.draw(useVisualizerStore.getState());
                }
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // Initial resize

        return () => window.removeEventListener('resize', handleResize);
    }, []); // Only on mount

    // Draw on state change
    useEffect(() => {
        if (rendererRef.current) {
            // We pass the partial state needed or just fetch fresh state? 
            // The dependency array ensures we re-draw when these change.
            // Ideally draw() takes the whole state or relevant parts.
            rendererRef.current.draw({
                array,
                algorithm,
                currentStep,
                steps,
                isSorted,
                isPlaying,
                playbackSpeed,
                mode,
                graphData
            } as any);
        }
    }, [array, algorithm, currentStep, steps, isSorted, isPlaying, playbackSpeed]); // Re-draw trigger

    // Animation Loop
    useEffect(() => {
        let timeoutId: number;

        if (isPlaying) {
            const loop = () => {
                nextStep();
                // The state change in nextStep will trigger the Draw effect, 
                // but we need to schedule the next loop *after* the speed delay.
                // Actually, if we just call nextStep(), the component re-renders (or not, zustand subscription).
                // If we want a continuous loop, we should use setTimeout recursively or interval.
                // BUT currentStep change triggers this effect again if we include it in deps?
                // NO, including 'isPlaying' and 'currentStep' in deps causes re-run.
                // Let's rely on timeout here.
            };
            timeoutId = window.setTimeout(loop, playbackSpeed);
        }

        return () => clearTimeout(timeoutId);
    }, [isPlaying, currentStep, nextStep, playbackSpeed]);

    return (
        <div className="w-full h-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden relative">
            <canvas ref={canvasRef} className="block w-full h-full" />
            {canvasRef.current && (
                <CanvasOverlay
                    width={canvasRef.current.width}
                    height={canvasRef.current.height}
                />
            )}
        </div>
    );
};
