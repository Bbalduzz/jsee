import React, { memo, useMemo, useState } from 'react';
import { ChevronRight, ChevronDown, X } from 'lucide-react';
import { VirtualScroll } from './VirtualScroll';
import { NodeDetails } from './NodeDetails';

interface FlatNode {
  id: string;
  level: number;
  name: string;
  value: any;
  type: string;
  hasChildren: boolean;
  isLast: boolean;
  path: string;
}

interface TreeNodeProps {
  node: FlatNode;
  expanded: Set<string>;
  onToggle: (id: string) => void;
  onSelect: (node: FlatNode) => void;
  isSelected: boolean;
}

const TreeNode = memo(({ node, expanded, onToggle, onSelect, isSelected }: TreeNodeProps) => {
  const { id, level, name, value, type, hasChildren } = node;
  const isExpanded = expanded.has(id);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (hasChildren) {
      onToggle(id);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    onSelect(node);
  };

  const renderValue = () => {
    switch (type) {
      case 'string':
        return <span className="text-green-600 dark:text-green-400 truncate">"{value}"</span>;
      case 'number':
        return <span className="text-blue-600 dark:text-blue-400">{value}</span>;
      case 'boolean':
        return <span className="text-purple-600 dark:text-purple-400">{value.toString()}</span>;
      case 'array':
        return <span className="text-gray-600 dark:text-gray-400">Array({value.length})</span>;
      case 'object':
        return value === null ? 
          <span className="text-gray-500 dark:text-gray-400">null</span> : 
          <span className="text-gray-600 dark:text-gray-400">Object</span>;
      default:
        return <span className="text-gray-600 dark:text-gray-400">{String(value)}</span>;
    }
  };

  return (
    <div
      className={`flex items-center py-1 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer select-none whitespace-nowrap transition-colors ${
        isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''
      }`}
      style={{ paddingLeft: `${level * 1.5}rem` }}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      title="Right-click to view details"
    >
      <span className="w-5 h-5 flex items-center">
        {hasChildren && (
          isExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          )
        )}
      </span>
      {hasChildren ? (
        <>
          <span className="text-gray-800 dark:text-gray-200">{name}</span>
          <span className="text-gray-400 dark:text-gray-500 ml-2">{renderValue()}</span>
        </>
      ) : (
        <>
          <span className="text-gray-800 dark:text-gray-200">{name}:&nbsp;</span>
          {renderValue()}
        </>
      )}
    </div>
  );
});

TreeNode.displayName = 'TreeNode';

interface TreeViewProps {
  data: any;
  expanded: Set<string>;
  onToggle: (id: string) => void;
}

const flattenTree = (
  data: any,
  path: string = 'root',
  level: number = 0,
  expanded: Set<string>
): FlatNode[] => {
  const nodes: FlatNode[] = [];
  const type = Array.isArray(data) ? 'array' : typeof data;
  const hasChildren = (type === 'object' || type === 'array') && data !== null;

  nodes.push({
    id: path,
    level,
    name: path.split('.').pop() || 'root',
    value: data,
    type,
    hasChildren,
    isLast: false,
    path
  });

  if (hasChildren && expanded.has(path)) {
    const entries = Object.entries(data);
    entries.forEach(([key, value], index) => {
      const childPath = `${path}.${key}`;
      const childNodes = flattenTree(value, childPath, level + 1, expanded);
      nodes.push(...childNodes);
    });
  }

  return nodes;
};

const TreeView: React.FC<TreeViewProps> = ({ data, expanded, onToggle }) => {
  const [selectedNode, setSelectedNode] = useState<FlatNode | null>(null);
  const flatNodes = useMemo(() => flattenTree(data, 'root', 0, expanded), [data, expanded]);

  return (
    <div className="flex h-[600px]">
      <div className="flex-1 overflow-hidden border-r border-gray-200 dark:border-gray-700">
        <VirtualScroll
          itemCount={flatNodes.length}
          height={600}
          itemHeight={28}
          overscan={5}
          renderItem={(index) => (
            <TreeNode
              node={flatNodes[index]}
              expanded={expanded}
              onToggle={onToggle}
              onSelect={setSelectedNode}
              isSelected={selectedNode?.id === flatNodes[index].id}
            />
          )}
        />
      </div>
      {selectedNode && (
        <NodeDetails
          node={selectedNode}
          onClose={() => setSelectedNode(null)}
        />
      )}
    </div>
  );
};

export default memo(TreeView);