import React from 'react';
import { CanvasStage } from './CanvasStage';
import { Controls } from './Controls';
import { CodeEditor } from './CodeEditor';
import { ExplanationPanel } from './ExplanationPanel';
import { StackPanel } from './StackPanel';
import { StatsDashboard } from './StatsDashboard';

export const VisualizerLayout: React.FC = () => {
    return (
        <div className="flex flex-col h-screen bg-gradient-to-br from-indigo-50 to-blue-50 text-gray-900 font-sans">
            <header className="px-8 py-5 flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                        A
                    </div>
                    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                        AlgoViz
                    </h1>
                </div>
                <div className="flex items-center gap-4">
                    <a href="#" className="text-sm font-medium text-gray-600 hover:text-gray-900">GitHub</a>
                </div>
            </header>

            <main className="flex-1 relative p-4 overflow-hidden flex gap-4">
                <div className="flex-[2] flex flex-col gap-4 min-w-0">
                    <div className="flex-1 min-h-0 bg-white/60 backdrop-blur-sm rounded-[32px] shadow-sm border border-white/50 overflow-hidden">
                        <CanvasStage />
                    </div>
                    <div className="shrink-0">
                        <StatsDashboard />
                    </div>
                    <div className="h-48 shrink-0 flex gap-4">
                        <div className="flex-1 min-w-0">
                            <ExplanationPanel />
                        </div>
                        <div className="w-64 shrink-0">
                            <StackPanel />
                        </div>
                    </div>
                </div>
                <div className="flex-1 min-w-0 bg-white/80 backdrop-blur-xl rounded-[32px] shadow-sm border border-white/50 overflow-hidden">
                    <CodeEditor />
                </div>
            </main>

            <footer className="shrink-0 z-20">
                <Controls />
            </footer>
        </div>
    );
};
