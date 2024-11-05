import React, { useState, useCallback, useRef, useMemo } from 'react';
import { Upload, Clipboard, AlertTriangle } from 'lucide-react';
import TreeView from './components/TreeView';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ThemeToggle } from './components/ThemeToggle';
import { repairJSON, JSONRepairError } from './utils/jsonRepair';

function App() {
  const [jsonData, setJsonData] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [warning, setWarning] = useState<string>('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['root']));
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLDivElement>(null);

  const parseJSON = useCallback((input: string) => {
    try {
      const repairedJSON = repairJSON(input);
      
      if (repairedJSON !== input) {
        setWarning('JSON was automatically repaired');
      } else {
        setWarning('');
      }

      const parsed = JSON.parse(repairedJSON);
      setJsonData(parsed);
      setError('');
    } catch (e) {
      if (e instanceof JSONRepairError) {
        setError(`JSON Repair Error: ${e.message}`);
      } else {
        setError('Invalid JSON format');
      }
      setWarning('');
      setJsonData(null);
    }
  }, []);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      parseJSON(content);
    };
    reader.readAsText(file);
  }, [parseJSON]);

  const handlePaste = useCallback((event: React.ClipboardEvent) => {
    const content = event.clipboardData.getData('text');
    parseJSON(content);
    
    // Reset contentEditable div content after processing
    if (textareaRef.current) {
      textareaRef.current.textContent = '';
    }
  }, [parseJSON]);

  const handleToggle = useCallback((path: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }, []);

  const memoizedTree = useMemo(() => (
    jsonData ? (
      <TreeView
        data={jsonData}
        expanded={expanded}
        onToggle={handleToggle}
      />
    ) : (
      <div className="p-8 text-center text-gray-500 dark:text-gray-400">
        <Clipboard className="w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-500" />
        <p>Upload a JSON file or paste JSON content to view</p>
      </div>
    )
  ), [jsonData, expanded, handleToggle]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transition-colors">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              High-Performance JSON Tree Viewer
            </h1>
            <ThemeToggle />
          </div>
          
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              <Upload size={20} />
              Upload JSON
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
            
            <div className="flex-1">
              <div
                ref={textareaRef}
                onPaste={handlePaste}
                contentEditable
                className="w-full h-10 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors overflow-hidden"
                style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}
              />
            </div>
          </div>

          {warning && (
            <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 rounded-lg flex items-center gap-2">
              <AlertTriangle size={20} />
              {warning}
            </div>
          )}

          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg">
              {error}
            </div>
          )}

          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors">
            <ErrorBoundary>
              {memoizedTree}
            </ErrorBoundary>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;