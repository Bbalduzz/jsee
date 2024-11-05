import React from 'react';
import { X } from 'lucide-react';

interface NodeDetailsProps {
  node: {
    name: string;
    value: any;
    type: string;
    path: string;
  };
  onClose: () => void;
}

export const NodeDetails: React.FC<NodeDetailsProps> = ({ node, onClose }) => {
  const getDirectContent = (value: any): string => {
    if (value === null || value === undefined) {
      return String(value);
    }

    if (typeof value !== 'object') {
      return String(value);
    }

    if (Array.isArray(value)) {
      return JSON.stringify(
        value.map(item => typeof item === 'object' ? '[Object]' : item),
        null,
        2
      );
    }

    const simplifiedObj = Object.fromEntries(
      Object.entries(value).map(([k, v]) => [
        k,
        typeof v === 'object' && v !== null ? '[Object]' : v
      ])
    );
    return JSON.stringify(simplifiedObj, null, 2);
  };

  return (
    <div className="w-96 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 overflow-auto transition-colors">
      <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-800 dark:text-white truncate">{node.name}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{node.path}</p>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full flex-shrink-0 ml-2 transition-colors"
          aria-label="Close details"
        >
          <X size={16} className="text-gray-600 dark:text-gray-400" />
        </button>
      </div>
      <div className="p-4">
        <pre className="text-sm font-mono bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 p-4 rounded-lg overflow-auto max-h-[calc(100vh-8rem)] whitespace-pre-wrap transition-colors">
          {getDirectContent(node.value)}
        </pre>
      </div>
    </div>
  );
};