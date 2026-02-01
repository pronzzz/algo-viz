import React from 'react';
import Editor, { type OnMount } from '@monaco-editor/react';
import { useVisualizerStore } from '../store/useVisualizerStore';

export const CodeEditor: React.FC = () => {
    const { code, setCode, activeLine } = useVisualizerStore();
    const editorRef = React.useRef<any>(null);
    const decorationsRef = React.useRef<any[]>([]);

    const handleEditorDidMount: OnMount = (editor) => {
        editorRef.current = editor;
    };

    React.useEffect(() => {
        if (editorRef.current && activeLine !== undefined) {
            // Monaco numbers lines from 1, we assume our transformer captured 1-based lines.
            // Acorn loc is 1-based.

            decorationsRef.current = editorRef.current.deltaDecorations(decorationsRef.current, [
                {
                    range: new (window as any).monaco.Range(activeLine, 1, activeLine, 1),
                    options: {
                        isWholeLine: true,
                        className: 'bg-yellow-100 dark:bg-yellow-900/30 border-l-4 border-yellow-500',
                    }
                }
            ]);

            editorRef.current.revealLineInCenter(activeLine);
        } else if (editorRef.current) {
            decorationsRef.current = editorRef.current.deltaDecorations(decorationsRef.current, []);
        }
    }, [activeLine]);

    return (
        <div className="h-full w-full border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <Editor
                height="100%"
                defaultLanguage="javascript"
                value={code}
                onChange={(val) => setCode(val || '')}
                onMount={handleEditorDidMount}
                options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                }}
            />
        </div>
    );
};
