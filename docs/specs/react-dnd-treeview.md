# React DnD TreeView

A flexible and performant drag-and-drop tree view component for React applications.

- **NPM**: `@minoru/react-dnd-treeview`  
- **Repository**: <https://github.com/minop1205/react-dnd-treeview>
- **Version**: ^3.4.4
- **License**: MIT

## Overview

React DnD TreeView provides a highly customizable tree component with built-in drag-and-drop functionality. It leverages the react-dnd library for robust drag operations and supports both mouse and touch devices through its MultiBackend adapter.

## Key Features

- 🎯 **Hierarchical drag and drop** with automatic tree restructuring
- 📱 **Cross-device support** (mouse, touch, stylus) via MultiBackend
- 🎨 **Fully customizable** node rendering with render props
- ♿ **Accessibility-first** with keyboard navigation and ARIA attributes
- ⚡ **High performance** with virtual scrolling support for large datasets
- 📦 **TypeScript support** with comprehensive type definitions
- 🔧 **Flexible API** supporting controlled and uncontrolled patterns

## Installation

```bash
# npm
npm install react-dnd @minoru/react-dnd-treeview

# yarn
yarn add react-dnd @minoru/react-dnd-treeview

# pnpm
pnpm add react-dnd @minoru/react-dnd-treeview
```

### Requirements
- React 16.8+ (hooks support required)
- react-dnd for drag-and-drop functionality

## Data Model

### Node Structure

```typescript
interface NodeModel<T = any> {
  id: number | string;        // Unique identifier (required)
  parent: number | string;     // Parent node ID, 0 for root (required)
  text: string;               // Display text (required)
  droppable?: boolean;        // Can accept dropped items (default: false)
  data?: T;                   // Custom data attachment
}
```

## Core API

### Main Component Props

#### Required Props

| Prop | Type | Description |
|------|------|-------------|
| `tree` | `NodeModel<T>[]` | Array of tree nodes with hierarchical structure |
| `rootId` | `number \| string` | ID of the root node (typically 0) |
| `render` | `(node, params) => ReactNode` | Node rendering function |
| `onDrop` | `(tree, options) => void` | Callback for drop operations |

#### Optional Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `initialOpen` | `boolean \| (number\|string)[]` | `false` | Initially expanded nodes |
| `canDrag` | `(node) => boolean` | - | Control draggability per node |
| `canDrop` | `(tree, options) => boolean` | - | Control drop targets |
| `sort` | `(a, b) => number` | - | Custom sibling sorting |
| `dragPreviewRender` | `(monitor) => ReactNode` | - | Custom drag preview |
| `classes` | `object \| function` | - | CSS classes for styling |
| `onChangeOpen` | `(nodeIds) => void` | - | Expansion change callback |

### Render Parameters

The render function receives these parameters:

```typescript
interface RenderParams {
  depth: number;         // Nesting level
  isOpen: boolean;       // Expansion state
  isDropTarget: boolean; // Current drop target
  isDragging: boolean;   // Being dragged
  onToggle: () => void; // Toggle expansion
}
```

## Usage Examples

### Basic Implementation

```tsx
import { useState } from "react";
import { Tree, MultiBackend, getBackendOptions } from "@minoru/react-dnd-treeview";
import { DndProvider } from "react-dnd";

const initialData = [
  { id: 1, parent: 0, droppable: true, text: "Folder 1" },
  { id: 2, parent: 1, text: "File 1-1" },
  { id: 3, parent: 0, droppable: true, text: "Folder 2" },
  { id: 4, parent: 3, text: "File 2-1" }
];

export default function FileTree() {
  const [treeData, setTreeData] = useState(initialData);
  
  return (
    <DndProvider backend={MultiBackend} options={getBackendOptions()}>
      <Tree
        tree={treeData}
        rootId={0}
        onDrop={setTreeData}
        render={(node, { depth, isOpen, onToggle }) => (
          <div style={{ paddingLeft: depth * 20 }}>
            {node.droppable && (
              <span onClick={onToggle}>{isOpen ? "📂" : "📁"}</span>
            )}
            <span>{node.text}</span>
          </div>
        )}
      />
    </DndProvider>
  );
}
```

### Advanced TypeScript Example

```tsx
interface FileData {
  type: 'file' | 'folder';
  size?: number;
  modified?: Date;
}

type FileNode = NodeModel<FileData>;

const FileExplorer: React.FC = () => {
  const [tree, setTree] = useState<FileNode[]>(initialFiles);
  
  const handleDrop = useCallback(
    (newTree: FileNode[], options: DropOptions<FileData>) => {
      // Validate folder-only drops
      const target = newTree.find(n => n.id === options.dropTargetId);
      if (target?.data?.type === 'folder') {
        setTree(newTree);
      }
    },
    []
  );
  
  const renderNode = useCallback(
    (node: FileNode, params: RenderParams) => (
      <FileItem 
        node={node} 
        {...params}
        icon={node.data?.type === 'folder' ? '📁' : '📄'}
      />
    ),
    []
  );
  
  return (
    <DndProvider backend={MultiBackend} options={getBackendOptions()}>
      <Tree<FileData>
        tree={tree}
        rootId={0}
        render={renderNode}
        onDrop={handleDrop}
        canDrop={(_, opts) => {
          const target = tree.find(n => n.id === opts.dropTargetId);
          return target?.data?.type === 'folder' || false;
        }}
        sort={(a, b) => {
          // Folders first, then alphabetical
          if (a.droppable !== b.droppable) {
            return a.droppable ? -1 : 1;
          }
          return a.text.localeCompare(b.text);
        }}
      />
    </DndProvider>
  );
};
```

## Performance Optimization

### Best Practices

1. **Memoize render functions** to prevent unnecessary re-renders
2. **Implement virtual scrolling** for trees with >1000 nodes
3. **Use production builds** of react-dnd for optimal performance
4. **Debounce state updates** when persisting expansion state

### Performance Benchmarks

- Handles **10,000+ nodes** with virtual scrolling
- **Sub-100ms** drag response time
- **60fps** animations during drag operations
- **~45KB** minified bundle size

## Accessibility

The component includes comprehensive accessibility features:

- ✅ ARIA attributes for tree structure
- ✅ Keyboard navigation (Arrow keys, Enter, Space)
- ✅ Screen reader announcements
- ✅ Focus management during interactions

## Browser Compatibility

| Browser | Minimum Version |
|---------|----------------|
| Chrome | 90+ |
| Firefox | 88+ |
| Safari | 14+ |
| Edge | 90+ |

## Common Issues & Solutions

### Touch Device Drag Preview
**Problem**: Drag preview not showing on mobile devices  
**Solution**: Implement the `dragPreviewRender` prop with a custom preview component

### Large Dataset Performance
**Problem**: Sluggish performance with thousands of nodes  
**Solution**: Implement virtual scrolling or pagination strategies

### TypeScript Generic Types
**Problem**: TypeScript errors with custom data types  
**Solution**: Use the generic type parameter: `Tree<YourDataType>`

## Related Packages

- **react-dnd**: Core drag and drop library (required dependency)
- **react-sortable-tree**: Alternative with built-in features
- **rc-tree**: Ant Design tree component
- **react-arborist**: File-tree with virtualization

## Resources

- [Documentation](https://github.com/minop1205/react-dnd-treeview/blob/main/README.md)
- [Live Demo](https://minop1205.github.io/react-dnd-treeview/)
- [API Reference](https://github.com/minop1205/react-dnd-treeview/blob/main/docs/api.md)
- [Examples](https://github.com/minop1205/react-dnd-treeview/tree/main/examples)
- [Changelog](https://github.com/minop1205/react-dnd-treeview/blob/main/CHANGELOG.md)
- [GitHub Issues](https://github.com/minop1205/react-dnd-treeview/issues)

## Package Stats

- **Weekly Downloads**: ~5,000
- **GitHub Stars**: 400+
- **Last Published**: March 2024
- **Bundle Size**: ~45KB minified
- **License**: MIT