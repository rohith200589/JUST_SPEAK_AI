import React, { useCallback, useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import ReactFlow, {
  Controls,
  Background,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  MarkerType,
  Handle,
  Position,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { toPng } from 'html-to-image';

// Utility function to convert color names to hex for input[type="color"] compatibility
const colorNameToHex = (color) => {
  const colors = {
    'black': '#000000', 'white': '#FFFFFF', 'red': '#FF0000', 'green': '#008000',
    'blue': '#0000FF', 'yellow': '#FFFF00', 'purple': '#800080', 'orange': '#FFA500',
    'gray': '#808080', 'lightcoral': '#F08080', 'cyan': '#00FFFF', 'magenta': '#FF00FF',
    'lime': '#00FF00', 'pink': '#FFC0CB', 'teal': '#008080', 'indigo': '#4B0082',
    'brown': '#A52A2A', 'gold': '#FFD700', 'silver': '#C0C0C0', 'darkblue': '#00008B',
    'darkgreen': '#006400', 'darkred': '#8B0000',
  };
  if (colors[color.toLowerCase()]) {
    return colors[color.toLowerCase()];
  }
  if (color.startsWith('#') || color.startsWith('rgb') || color.startsWith('var(')) {
    return color;
  }
  return '#000000';
};

// Custom Modal Component for prompts and confirmations
const Modal = ({ show, title, message, inputType, inputValue, onConfirm, onCancel, children }) => {
  if (!show) return null;

  const [value, setValue] = useState(inputValue || '');

  const handleConfirm = () => {
    onConfirm(inputType ? value : true);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="modal-bg rounded-lg shadow-xl p-6 w-full max-w-sm border modal-border">
        <h3 className="text-xl font-semibold mb-4 modal-text">{title}</h3>
        {message && <p className="mb-4 modal-info-text">{message}</p>}
        {inputType === 'text' && (
          <input
            type="text"
            className="w-full p-2 border input-border rounded-md mb-4 input-focus-ring input-bg input-text-color"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            autoFocus
          />
        )}
        {inputType === 'color' && (
          <input
            type="color"
            className="w-full p-2 border input-border rounded-md mb-4 h-12"
            value={colorNameToHex(value)}
            onChange={(e) => setValue(e.target.value)}
          />
        )}
        {children}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 modal-button-bg modal-button-text rounded-md modal-button-hover-bg transition duration-150 ease-in-out"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 btn-primary-gradient btn-primary-text rounded-md transition duration-150 ease-in-out"
          >
            {inputType ? 'Save' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Base style for all custom nodes for consistency and professionalism
const baseNodeStyle = (data, selected) => ({
  background: data.color || 'var(--color-node-bg)',
  color: data.textColor || 'var(--color-node-text)',
  fontWeight: data.fontWeight || 'normal',
  border: data.border || '1px solid var(--color-border)', // Added a default border
  fontFamily: 'Inter, sans-serif',
  fontSize: data.fontSize ? `${data.fontSize}px` : '14px', // Slightly increased default font size
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: selected ? '0 0 0 3px var(--color-accent), 0 2px 8px rgba(0,0,0,0.1)' : '0 2px 5px rgba(0,0,0,0.08)', // Enhanced shadow for selected state
  transition: 'all 0.2s ease-in-out', // Smooth transitions for selection/hover effects
});

// Text span style for all custom nodes
const nodeTextStyle = (data) => ({
  transform: `translate(${data.textOffsetX || 0}px, ${data.textOffsetY || 0}px)`,
  display: 'block',
  textAlign: 'center',
  wordBreak: 'break-word',
  zIndex: 1,
  padding: '0 5px', // Added horizontal padding to text
});

// Handles for all custom nodes
const NodeHandles = () => (
  <>
    <Handle type="target" position={Position.Top} className="!bg-[var(--color-icon)] !w-3 !h-3 !border !border-[var(--color-border-dark)]" />
    <Handle type="target" position={Position.Left} className="!bg-[var(--color-icon)] !w-3 !h-3 !border !border-[var(--color-border-dark)]" />
    <Handle type="source" position={Position.Bottom} className="!bg-[var(--color-icon)] !w-3 !h-3 !border !border-[var(--color-border-dark)]" />
    <Handle type="source" position={Position.Right} className="!bg-[var(--color-icon)] !w-3 !h-3 !border !border-[var(--color-border-dark)]" />
  </>
);

// Custom Node Component for Rectangle
const CustomRectangleNode = ({ data, selected }) => {
  return (
    <div
      className="p-3 rounded-lg"
      style={{
        ...baseNodeStyle(data, selected),
        width: data.nodeWidth ? `${data.nodeWidth}px` : '160px', // Slightly larger default
        height: data.nodeHeight ? `${data.nodeHeight}px` : '90px', // Slightly larger default
        minWidth: '100px',
        minHeight: '50px',
      }}
    >
      <NodeHandles />
      <span style={nodeTextStyle(data)}>
        {data.label}
      </span>
    </div>
  );
};

// Custom Node Component for Circle
const CustomCircleNode = ({ data, selected }) => {
  return (
    <div
      className="p-3 rounded-full"
      style={{
        ...baseNodeStyle(data, selected),
        width: data.nodeWidth ? `${data.nodeWidth}px` : '110px', // Slightly larger default
        height: data.nodeHeight ? `${data.nodeHeight}px` : '110px', // Slightly larger default
      }}
    >
      <NodeHandles />
      <span style={nodeTextStyle(data)}>
        {data.label}
      </span>
    </div>
  );
};

// Custom Node Component for Diamond
const CustomDiamondNode = ({ data, selected }) => {
  return (
    <div
      style={{
        ...baseNodeStyle(data, selected),
        width: data.nodeWidth ? `${data.nodeWidth}px` : '130px', // Slightly larger default
        height: data.nodeHeight ? `${data.nodeHeight}px` : '130px', // Slightly larger default
        transform: 'rotate(45deg)', // Apply rotation for diamond shape
        padding: '8px', // Padding for content inside the rotated div
        overflow: 'hidden', // Hide content overflowing due to rotation
      }}
    >
      {/* Handles need to be rotated back if placed directly on the diamond div */}
      <Handle type="target" position={Position.Top} className="!bg-[var(--color-icon)] !w-3 !h-3 !border !border-[var(--color-border-dark)]" style={{ transform: 'rotate(-45deg)' }} />
      <Handle type="target" position={Position.Left} className="!bg-[var(--color-icon)] !w-3 !h-3 !border !border-[var(--color-border-dark)]" style={{ transform: 'rotate(-45deg)' }} />
      <Handle type="source" position={Position.Bottom} className="!bg-[var(--color-icon)] !w-3 !h-3 !border !border-[var(--color-border-dark)]" style={{ transform: 'rotate(-45deg)' }} />
      <Handle type="source" position={Position.Right} className="!bg-[var(--color-icon)] !w-3 !h-3 !border !border-[var(--color-border-dark)]" style={{ transform: 'rotate(-45deg)' }} />
      <span
        style={{
          transform: `rotate(-45deg) translate(${data.textOffsetX || 0}px, ${data.textOffsetY || 0}px)`,
          whiteSpace: 'normal', // Allow text to wrap within the rotated span
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          width: '100%',
          textAlign: 'center',
          wordBreak: 'break-word',
          zIndex: 1,
          boxSizing: 'border-box', // Include padding in the element's total width and height
          padding: '5px', // Inner padding for the text
        }}
      >
        {data.label}
      </span>
    </div>
  );
};

// Custom Node Component for an Arrow (standalone shape)
const CustomArrowNode = ({ data, selected }) => {
  const arrowHeadPath = {
    'Closed': 'M0,0 L-5,-5 L-5,5 Z', // Closed triangle
    'Open': 'M0,0 L-5,-5 M0,0 L-5,5', // V-shape
    'None': '', // No arrowhead
  };

  const svgWidth = data.nodeWidth || 150;
  const svgHeight = data.nodeHeight || 50;
  const lineEndY = svgHeight / 2;
  const arrowheadOffset = 10;
  const lineEndX = svgWidth - arrowheadOffset;

  return (
    <div
      style={{
        ...baseNodeStyle(data, selected),
        background: 'transparent', // Arrows should not have a background color like other nodes
        border: 'none', // Arrows should not have a border
        boxShadow: selected ? '0 0 0 2px var(--color-accent)' : 'none', // Lighter shadow for arrows
        width: `${svgWidth}px`,
        height: `${svgHeight}px`,
        transform: `rotate(${data.rotation || 0}deg)`,
      }}
    >
      {/* Arrow SVG */}
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ overflow: 'visible' }}
      >
        {/* Arrow line */}
        <line
          x1="0" y1={lineEndY}
          x2={lineEndX} y2={lineEndY}
          stroke={data.color || 'var(--color-border)'}
          strokeWidth="2"
        />
        {/* Arrowhead */}
        <path
          d={arrowHeadPath[data.arrowheadStyle || 'Closed']}
          transform={`translate(${lineEndX},${lineEndY})`}
          fill={data.arrowheadColor || data.color || 'var(--color-border)'}
          stroke={data.arrowheadColor || data.color || 'var(--color-border)'}
          strokeWidth={data.arrowheadStyle === 'Open' ? '2' : '0'}
        />
      </svg>
      {/* Text Label */}
      {data.label && (
        <span
          style={{
            position: 'absolute',
            color: data.textColor || 'var(--color-node-text)',
            fontWeight: data.fontWeight || 'normal',
            fontSize: data.fontSize ? `${data.fontSize}px` : '12px',
            transform: `translate(${data.textOffsetX || 0}px, ${data.textOffsetY || 0}px) rotate(${-(data.rotation || 0)}deg)`,
            whiteSpace: 'nowrap',
            zIndex: 1,
            pointerEvents: 'none', // Ensure text doesn't interfere with arrow selection
          }}
        >
          {data.label}
        </span>
      )}
    </div>
  );
};


// Define node types for ReactFlow
const nodeTypes = {
  rectangle: CustomRectangleNode,
  circle: CustomCircleNode,
  diamond: CustomDiamondNode,
  arrow: CustomArrowNode,
};

// DiagramCanvas component now contains the ReactFlow instance and logic dependent on useReactFlow
const DiagramCanvas = forwardRef(({
  nodes, onNodesChange, edges, onEdgesChange, onConnect,
  onNodeClick, onEdgeClick, onPaneClick, onElementContextMenu,
  canvasTitle, error,
}, ref) => {

  const reactFlowInstance = useReactFlow();
  const diagramWrapperRef = useRef(null);

  // Expose specific functions via ref
  useImperativeHandle(ref, () => ({
    fitView: () => {
      if (reactFlowInstance && typeof reactFlowInstance.fitView === 'function') {
        reactFlowInstance.fitView({ padding: 0.2, includeHiddenNodes: true }); // Added padding for better fit
      } else {
        console.warn('fitView not available from ReactFlow instance.');
      }
    },
    toPng: () => {
      if (diagramWrapperRef.current) {
        return toPng(diagramWrapperRef.current, {
          backgroundColor: 'var(--color-section-bg)',
          cacheBust: true,
          padding: 20, // Add some padding around the diagram in the export
        });
      } else {
        console.warn('Diagram wrapper ref not available for PNG export.');
        return Promise.reject('Diagram not ready for PNG export.');
      }
    },
    applyLayout: () => {
      if (reactFlowInstance && typeof reactFlowInstance.fitView === 'function') {
        reactFlowInstance.fitView();
      } else {
        console.warn('fitView not available for layout from ReactFlow instance.');
      }
      alert('Applying tree layout (conceptual). In a full build, this would use a layout library like ELK or Dagre to arrange nodes automatically.');
    },
  }), [reactFlowInstance]);

  return (
    <div className="flex-grow relative bg-[var(--color-section-bg)]" ref={diagramWrapperRef}>
        <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
            onPaneClick={onPaneClick}
            onNodeContextMenu={onElementContextMenu}
            onEdgeContextMenu={onElementContextMenu}
            nodeTypes={nodeTypes}
            fitView
            attributionPosition="bottom-left"
            proOptions={{ hideAttribution: true }} // Hide React Flow attribution for cleaner look
        >
            <Background variant="dots" gap={16} size={1} className="!bg-[var(--color-section-bg)]" /> {/* Increased gap for better visual separation */}
            <Controls className="!border panel-border !rounded-lg !shadow-md panel-bg" /> {/* Slightly stronger shadow */}
            <MiniMap
                nodeColor={(n) => n.data?.color || 'var(--color-node-bg)'}
                className="!bg-[var(--color-button-secondary-bg)] !rounded-lg !opacity-95 !border panel-border" // MiniMap with border and less opacity
                zoomable // Make minimap zoomable
                pannable // Make minimap pannable
            />

            <div className="absolute top-6 left-1/2 -translate-x-1/2 text-4xl font-serif font-bold text-primary-color pointer-events-none z-10 opacity-90">
                {canvasTitle}
            </div>

            {error && (
              <div className="absolute top-24 left-1/2 -translate-x-1/2 message-bg border message-border message-text px-4 py-3 rounded-md relative max-w-sm mx-auto shadow-lg" role="alert" style={{ zIndex: 100 }}>
                <strong className="font-bold">Error!</strong>
                <span className="block sm:inline"> {error}</span>
              </div>
            )}
        </ReactFlow>
    </div>
  );
});

// Main App component
const Mindmap = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesState] = useEdgesState([]);

  const [promptText, setPromptText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [canvasTitle, setCanvasTitle] = useState('AI Generated Diagram');
  const [diagramType, setDiagramType] = useState('Flow Chart');

  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: '', message: '', inputType: null, inputValue: '', onConfirm: () => {}, onCancel: () => {},
  });
  const [selectedElementId, setSelectedElementId] = useState(null);

  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [activeLeftPanelTab, setActiveLeftPanelTab] = useState('shapes');

  // History state for undo/redo
  const [history, setHistory] = useState([]);
  const [historyPointer, setHistoryPointer] = useState(-1);
  const isRestoring = useRef(false);

  const selectedNode = selectedElementId ? nodes.find(n => n.id === selectedElementId) : null;
  const selectedEdge = selectedElementId ? edges.find(e => e.id === selectedElementId) : null;

  const diagramCanvasRef = useRef(null);

  /**
   * Generates a unique ID for nodes and edges.
   */
  const generateId = () => `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Initialize history with initial empty state
  useEffect(() => {
    if (history.length === 0) {
      setHistory([{ nodes: [], edges: [] }]);
      setHistoryPointer(0);
    }
  }, []);

  // Effect to save history when nodes or edges change
  useEffect(() => {
    if (isRestoring.current) {
      isRestoring.current = false;
      return;
    }
    const newHistory = history.slice(0, historyPointer + 1);
    const newSnapshot = { nodes, edges };
    setHistory([...newHistory, newSnapshot]);
    setHistoryPointer(newHistory.length);
  }, [nodes, edges]);

  // Custom onNodesChange handler to ensure history is updated only when user makes changes
  const customOnNodesChange = useCallback((changes) => {
    if (!isRestoring.current) {
      onNodesChange(changes);
    }
  }, [onNodesChange]);

  // Custom onEdgesChange handler
  const customOnEdgesChange = useCallback((changes) => {
    if (!isRestoring.current) {
      onEdgesState(changes);
    }
  }, [onEdgesState]);

  // Undo functionality
  const handleUndo = useCallback(() => {
    if (historyPointer > 0) {
      isRestoring.current = true;
      const previousState = history[historyPointer - 1];
      setNodes(previousState.nodes);
      setEdges(previousState.edges);
      setHistoryPointer(prev => prev - 1);
    }
  }, [history, historyPointer, setNodes, setEdges]);

  // Redo functionality
  const handleRedo = useCallback(() => {
    if (historyPointer < history.length - 1) {
      isRestoring.current = true;
      const nextState = history[historyPointer + 1];
      setNodes(nextState.nodes);
      setEdges(nextState.edges);
      setHistoryPointer(prev => prev + 1);
    }
  }, [history, historyPointer, setNodes, setEdges]);

  // Define a color palette for nodes to ensure variety
  const nodeColorPalette = [
    '#FFADAD', '#FFD6A5', '#FDFFB6', '#CAFFBF', '#9BF6FF',
    '#A0C4FF', '#BDB2FF', '#FFC6FF', '#FFFFFC', '#CCE2CB',
    '#E7CBA9', '#FFABAB', '#FFC3A0', '#FFE6AA', '#D7FFB9'
  ];
  const getRandomColor = () => nodeColorPalette[Math.floor(Math.random() * nodeColorPalette.length)];

  /**
   * Adds a new node of a specific shape.
   */
  const addShape = (shapeType) => {
    const id = generateId();
    const newNodeColor = getRandomColor(); // Use a random color from the palette
    let newNode = {
      id,
      position: { x: 150, y: 150 },
      data: {
        label: shapeType === 'arrow' ? '' : `New ${shapeType.charAt(0).toUpperCase() + shapeType.slice(1)}`,
        color: newNodeColor,
        textColor: 'var(--color-node-text)',
        fontWeight: 'normal',
        nodeWidth: (shapeType === 'rectangle' ? 160 : (shapeType === 'circle' ? 110 : (shapeType === 'diamond' ? 130 : 150))),
        nodeHeight: (shapeType === 'rectangle' ? 90 : (shapeType === 'circle' ? 110 : (shapeType === 'diamond' ? 130 : 50))),
        fontSize: 14,
        textOffsetX: 0,
        textOffsetY: 0,
        rotation: 0,
        arrowheadStyle: 'Closed',
        arrowheadColor: 'var(--color-border)',
      },
      type: shapeType,
      zIndex: 10,
    };
    setNodes((nds) => [...nds, newNode]);
    setSelectedElementId(newNode.id);
  };

  /**
   * Callback for when an edge is created.
   */
  const onConnect = useCallback(
    (params) => {
      setEdges((eds) => addEdge({
        ...params,
        id: generateId(),
        animated: true,
        type: 'smoothstep',
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: 'var(--color-border)',
        },
      }, eds));
    },
    [setEdges]
  );

  /**
   * Handles click on a node.
   */
  const onNodeClick = useCallback((event, node) => {
    setSelectedElementId(node.id);
  }, []);

  /**
   * Handles click on an edge.
   */
  const onEdgeClick = useCallback((event, edge) => {
    setSelectedElementId(edge.id);
  }, []);

  /**
   * Handles background (pane) click.
   */
  const onPaneClick = useCallback(() => {
    setSelectedElementId(null);
  }, []);

  /**
   * Deletes the specified node or edge.
   */
  const deleteSelectedElement = useCallback((idToDelete = selectedElementId) => {
    if (!idToDelete) return;

    const isNode = nodes.some(n => n.id === idToDelete);
    if (isNode) {
      setNodes((nds) => nds.filter((n) => n.id !== idToDelete));
      setEdges((eds) => eds.filter((e) => e.source !== idToDelete && e.target !== idToDelete));
    } else {
      setEdges((eds) => eds.filter((e) => e.id !== idToDelete));
    }
    setSelectedElementId(null);
  }, [selectedElementId, nodes, edges, setNodes, setEdges]);

  /**
   * Handles right-click (context menu) on a node or edge.
   */
  const onElementContextMenu = useCallback((event, element) => {
    event.preventDefault();
    setSelectedElementId(element.id);
    const isNode = nodes.some(n => n.id === element.id);
    const elementType = isNode ? 'Node' : 'Edge';
    const elementLabel = isNode ? element.data.label : `Edge ${element.source}-${element.target}`;

    setModalConfig({
      title: `Delete ${elementType}`,
      message: `Are you sure you want to delete "${elementLabel}"?`,
      inputType: null,
      onConfirm: () => {
        deleteSelectedElement(element.id);
        setShowModal(false);
      },
      onCancel: () => setShowModal(false),
    });
    setShowModal(true);
  }, [setModalConfig, deleteSelectedElement, nodes]);

  /**
   * Updates the label of the selected node.
   */
  const updateNodeLabel = (newLabel) => {
    if (!selectedElementId) return;
    setNodes((nds) =>
      nds.map((n) =>
        n.id === selectedElementId ? { ...n, data: { ...n.data, label: newLabel } } : n
      )
    );
  };

  /**
   * Updates the background color of the selected node.
   */
  const updateNodeColor = (newColor) => {
    if (!selectedElementId) return;
    setNodes((nds) =>
      nds.map((n) =>
        n.id === selectedElementId
          ? { ...n, data: { ...n.data, color: newColor } }
          : n
      )
    );
  };

  /**
   * Updates the text color of the selected node.
   */
  const updateNodeTextColor = (newTextColor) => {
    if (!selectedElementId) return;
    setNodes((nds) =>
      nds.map((n) =>
        n.id === selectedElementId
          ? { ...n, data: { ...n.data, textColor: newTextColor } }
          : n
      )
    );
  };

  /**
   * Updates the font weight of the selected node.
   */
  const updateNodeFontWeight = (newFontWeight) => {
    if (!selectedElementId) return;
    setNodes((nds) =>
      nds.map((n) =>
        n.id === selectedElementId
          ? { ...n, data: { ...n.data, fontWeight: newFontWeight } }
          : n
      )
    );
  };

  /**
   * Updates the width of the selected node.
   */
  const updateNodeWidth = (newWidth) => {
    if (!selectedElementId || isNaN(newWidth) || newWidth <= 0) return;
    setNodes((nds) =>
      nds.map((n) =>
        n.id === selectedElementId
          ? { ...n, data: { ...n.data, nodeWidth: parseFloat(newWidth) } }
          : n
      )
    );
  };

  /**
   * Updates the height of the selected node.
   */
  const updateNodeHeight = (newHeight) => {
    if (!selectedElementId || isNaN(newHeight) || newHeight <= 0) return;
    setNodes((nds) =>
      nds.map((n) =>
        n.id === selectedElementId
          ? { ...n, data: { ...n.data, nodeHeight: parseFloat(newHeight) } }
          : n
      )
    );
  };

  /**
   * Updates the font size of the selected node.
   */
  const updateNodeFontSize = (newSize) => {
    if (!selectedElementId || isNaN(newSize) || newSize <= 0) return;
    setNodes((nds) =>
      nds.map((n) =>
        n.id === selectedElementId
          ? { ...n, data: { ...n.data, fontSize: parseFloat(newSize) } }
          : n
      )
    );
  };

  /**
   * Updates the X offset of the text within the selected node.
   */
  const updateNodeTextOffsetX = (newOffsetX) => {
    if (!selectedElementId || isNaN(newOffsetX)) return;
    setNodes((nds) =>
      nds.map((n) =>
        n.id === selectedElementId
          ? { ...n, data: { ...n.data, textOffsetX: parseFloat(newOffsetX) } }
          : n
      )
    );
  };

  /**
   * Updates the Y offset of the text within the selected node.
   */
  const updateNodeTextOffsetY = (newOffsetY) => {
    if (!selectedElementId || isNaN(newOffsetY)) return;
    setNodes((nds) =>
      nds.map((n) =>
        n.id === selectedElementId
          ? { ...n, data: { ...n.data, textOffsetY: parseFloat(newOffsetY) } }
          : n
      )
    );
  };

  /**
   * Updates the rotation of the selected arrow node.
   */
  const updateArrowRotation = (newRotation) => {
    if (!selectedElementId || isNaN(newRotation)) return;
    setNodes((nds) =>
      nds.map((n) =>
        n.id === selectedElementId && n.type === 'arrow'
          ? { ...n, data: { ...n.data, rotation: parseFloat(newRotation) } }
          : n
      )
    );
  };

  /**
   * Updates the arrowhead style of the selected arrow node.
   */
  const updateArrowheadStyle = (newStyle) => {
    if (!selectedElementId) return;
    setNodes((nds) =>
      nds.map((n) =>
        n.id === selectedElementId && n.type === 'arrow'
          ? { ...n, data: { ...n.data, arrowheadStyle: newStyle } }
          : n
      )
    );
  };

  /**
   * Updates the arrowhead color of the selected arrow node.
   */
  const updateArrowheadColor = (newColor) => {
    if (!selectedElementId) return;
    setNodes((nds) =>
      nds.map((n) =>
        n.id === selectedElementId && n.type === 'arrow'
          ? { ...n, data: { ...n.data, arrowheadColor: newColor } }
          : n
      )
    );
  };

  /**
   * Updates the label of the selected edge.
   */
  const updateEdgeLabel = (newLabel) => {
    if (!selectedElementId) return;
    setEdges((eds) =>
      eds.map((e) =>
        e.id === selectedElementId ? { ...e, label: newLabel } : e
      )
    );
  };

  /**
   * Updates the marker end type of the selected edge.
   */
  const updateEdgeMarkerEndType = (newMarkerType) => {
    if (!selectedElementId) return;
    setEdges((eds) =>
      eds.map((e) =>
        e.id === selectedElementId
          ? {
              ...e,
              markerEnd: {
                ...e.markerEnd,
                type: newMarkerType === 'None' ? null : MarkerType[newMarkerType],
              },
            }
          : e
      )
    );
  };

  /**
   * Updates the marker end color of the selected edge.
   */
  const updateEdgeMarkerEndColor = (newColor) => {
    if (!selectedElementId) return;
    setEdges((eds) =>
      eds.map((e) =>
        e.id === selectedElementId
          ? {
              ...e,
              markerEnd: {
                ...e.markerEnd,
                color: newColor,
              },
            }
          : e
      )
    );
  };

  /**
   * Changes the z-index (layering) of the selected node.
   */
  const changeNodeLayer = (direction) => {
    if (!selectedElementId || !selectedNode) return;

    setNodes((prevNodes) => {
      const updatedNodes = [...prevNodes];
      const selectedNodeIndex = updatedNodes.findIndex(n => n.id === selectedElementId);

      if (selectedNodeIndex === -1) return prevNodes;

      const nodeToMove = updatedNodes[selectedNodeIndex];
      let newZIndex = nodeToMove.zIndex || 10;

      if (direction === 'front') {
        newZIndex = Math.max(...updatedNodes.map(n => n.zIndex || 10)) + 1;
      } else if (direction === 'back') {
        newZIndex = Math.min(...updatedNodes.map(n => n.zIndex || 10)) - 1;
      }

      updatedNodes[selectedNodeIndex] = { ...nodeToMove, zIndex: newZIndex };
      return updatedNodes;
    });
  };

  /**
   * Clears all nodes and edges from the diagram.
   */
  const clearDiagram = () => {
    setNodes([]);
    setEdges([]);
    setSelectedElementId(null);
    setError(null);
  };

  /**
   * Triggers the layout function in the DiagramCanvas component.
   */
  const triggerApplyLayout = () => {
    if (diagramCanvasRef.current && typeof diagramCanvasRef.current.applyLayout === 'function') {
      diagramCanvasRef.current.applyLayout();
    } else {
        alert('Layout function not ready yet. Please ensure the diagram has loaded.');
    }
  };

  /**
   * Handles adding new nodes and connecting them with an edge.
   */
  const handleAddNewNodesWithEdge = () => {
    const id1 = generateId();
    const id2 = generateId();
    const newNode1Color = getRandomColor();
    const newNode2Color = getRandomColor();

    const newNodes = [
      {
        id: id1,
        position: { x: 50, y: 50 },
        data: { label: 'Node 1', color: newNode1Color, textColor: 'var(--color-node-text)', fontWeight: 'normal', nodeWidth: 160, nodeHeight: 90, fontSize: 14, textOffsetX: 0, textOffsetY: 0 },
        type: 'rectangle',
        zIndex: 10,
      },
      {
        id: id2,
        position: { x: 300, y: 50 },
        data: { label: 'Node 2', color: newNode2Color, textColor: 'var(--color-node-text)', fontWeight: 'normal', nodeWidth: 160, nodeHeight: 90, fontSize: 14, textOffsetX: 0, textOffsetY: 0 },
        type: 'rectangle',
        zIndex: 10,
      },
    ];
    const newEdge = {
      id: generateId(),
      source: id1,
      target: id2,
      animated: true,
      type: 'smoothstep',
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: 'var(--color-border)',
      },
    };
    setNodes((nds) => [...nds, ...newNodes]);
    setEdges((eds) => [...eds, newEdge]);
    setSelectedElementId(newEdge.id);
  };

  /**
   * Handles general "Add Edge" guidance.
   */
  const handleAddEdge = () => {
    alert('To add an edge between existing nodes, drag a connection line from a blue handle on one node to a blue handle on another node.');
  };

  /**
   * Triggers PNG download via the DiagramCanvas component.
   */
  const triggerDownloadPng = () => {
    if (diagramCanvasRef.current && typeof diagramCanvasRef.current.toPng === 'function') {
      diagramCanvasRef.current.toPng()
        .then((dataUrl) => {
          const a = document.createElement('a');
          a.setAttribute('download', `${canvasTitle || 'diagram'}.png`);
          a.setAttribute('href', dataUrl);
          a.click();
        })
        .catch((err) => {
          alert('Failed to download PNG. Please try again.');
          console.error('Failed to download PNG:', err);
        });
    } else {
      alert('PNG download function not available yet. Please try again after the diagram loads.');
    }
  };

  /**
   * Triggers JPG download via the DiagramCanvas component.
   */
  const triggerDownloadJpg = () => {
    alert('JPG download is not directly supported. Please download as PNG and convert it using an external tool if needed.');
  };


  /**
   * Generates a diagram using the Gemini LLM.
   */
  const generateDiagram = async () => {
    setIsLoading(true);
    setError(null);
    clearDiagram();

    try {
      let chatHistory = [];
      chatHistory.push({
        role: "user",
        parts: [{
          text: `Generate a ${diagramType} diagram based on the following description. Provide the output as a JSON object with two arrays: 'nodes' and 'edges'. Ensure that node positions (x, y) are diverse and well-distributed within a 50-700 range for clear visibility and no overlap on a typical canvas. Each node must have an 'id' (string, unique), 'position' (object with 'x', 'y' numbers), 'data' (object with 'label' string, 'color' string like a hex code or CSS color name, and optionally 'borderColor' for a border, 'textColor' string for text color, 'fontWeight' string for text boldness (e.g., 'normal', 'bold', 'bolder'), 'nodeWidth' number, 'nodeHeight' number, 'fontSize' number, 'textOffsetX' number, 'textOffsetY' number), and a 'type' (string, one of 'rectangle', 'circle', 'diamond', 'arrow'). For 'arrow' type nodes, also include 'rotation' (number, degrees) and 'arrowheadStyle' (string, 'Closed', 'Open', or 'None'), and 'arrowheadColor' (string, hex color). Also include a 'zIndex' (number, default 10) for layering. Each edge must have an 'id' (string, unique), 'source' (string, ID of source node), 'target' (string, ID of target node), 'animated' (boolean, true), 'label' (string, optional, for text on the edge), and 'markerEnd' (object with type 'arrowclosed' or 'arrow' and color '#333' for a standard arrowhead). Ensure all generated IDs are unique and reference existing nodes for edges. When generating nodes, ensure to use a *variety of distinct, visually pleasing colors* (e.g., different pastel or vibrant shades) for different nodes to enhance visual distinction, rather than a single color. User description: ${promptText}`
        }]
      });

      const payload = {
        contents: chatHistory,
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              nodes: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: {
                    id: { type: "STRING" },
                    position: {
                      type: "OBJECT",
                      properties: {
                        x: { type: "NUMBER", minimum: 50, maximum: 700 },
                        y: { type: "NUMBER", minimum: 50, maximum: 700 }
                      },
                      required: ["x", "y"],
                    },
                    data: {
                      type: "OBJECT",
                      properties: {
                        label: { type: "STRING" },
                        color: { type: "STRING" },
                        borderColor: { type: "STRING", nullable: true },
                        textColor: { type: "STRING", default: "black" },
                        fontWeight: { type: "STRING", enum: ["normal", "bold", "bolder"], default: "normal" },
                        nodeWidth: { type: "NUMBER", default: 160 },
                        nodeHeight: { type: "NUMBER", default: 90 },
                        fontSize: { type: "NUMBER", default: 14 },
                        textOffsetX: { type: "NUMBER", default: 0 },
                        textOffsetY: { type: "NUMBER", default: 0 },
                        rotation: { type: "NUMBER", default: 0 },
                        arrowheadStyle: { type: "STRING", enum: ["Closed", "Open", "None"], default: "Closed" },
                        arrowheadColor: { type: "STRING", default: "#333" },
                      },
                      required: ["label", "color"],
                    },
                    type: { type: "STRING", enum: ["rectangle", "circle", "diamond", "arrow"], default: "rectangle" },
                    zIndex: { type: "NUMBER", default: 10 }
                  },
                  required: ["id", "position", "data", "type"],
                },
              },
              edges: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: {
                    id: { type: "STRING" },
                    source: { type: "STRING" },
                    target: { type: "STRING" },
                    animated: { type: "BOOLEAN" },
                    label: { type: "STRING", nullable: true },
                    markerEnd: {
                      type: "OBJECT",
                      properties: {
                        type: { type: "STRING", enum: ["arrowclosed", "arrow"] },
                        color: { type: "STRING" },
                      },
                      required: ["type", "color"],
                    },
                  },
                  required: ["id", "source", "target", "animated"],
                },
              },
            },
            required: ["nodes", "edges"],
          },
        }
      };
      const apiKey = "AIzaSyB4wZ7nYvgUtDmpAS4PFD5h07l8q7Z6QSQ"; // Replace with your actual API Key if needed
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API error: ${errorData.error.message || response.statusText}`);
      }

      const result = await response.json();
      if (result.candidates && result.candidates.length > 0 && result.candidates[0].content && result.candidates[0].content.parts && result.candidates[0].content.parts.length > 0) {
        const jsonString = result.candidates[0].content.parts[0].text;
        const parsedData = JSON.parse(jsonString);

        if (parsedData.nodes && Array.isArray(parsedData.nodes) && parsedData.edges && Array.isArray(parsedData.edges)) {
          const newNodes = parsedData.nodes.map(node => ({
            ...node,
            selected: false,
            data: {
              ...node.data,
              textColor: node.data.textColor || 'var(--color-node-text)',
              fontWeight: node.data.fontWeight || 'normal',
              nodeWidth: node.data.nodeWidth || (node.type === 'rectangle' ? 160 : (node.type === 'circle' ? 110 : (node.type === 'diamond' ? 130 : 150))),
              nodeHeight: node.data.nodeHeight || (node.type === 'rectangle' ? 90 : (node.type === 'circle' ? 110 : (node.type === 'diamond' ? 130 : 50))),
              fontSize: node.data.fontSize || 14,
              textOffsetX: node.data.textOffsetX || 0,
              textOffsetY: node.data.textOffsetY || 0,
              rotation: node.data.rotation || 0,
              arrowheadStyle: node.data.arrowheadStyle || 'Closed',
              arrowheadColor: node.data.arrowheadColor || 'var(--color-border)',
            },
            zIndex: node.zIndex || 10,
          }));
          setNodes(newNodes);
          setEdges(parsedData.edges);
          if (diagramCanvasRef.current && typeof diagramCanvasRef.current.fitView === 'function') {
            diagramCanvasRef.current.fitView();
          }
        } else {
          setError('Invalid diagram structure received from AI. Please try a different prompt.');
        }
      } else {
        setError('No valid response from AI. Please try again.');
      }
    } catch (err) {
      console.error("Error generating diagram:", err);
      setError(`Failed to generate diagram: ${err.message}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen font-sans antialiased theme-bg-gradient text-primary-color">
      {/* Top Header Section */}
      <div className="chat-header-gradient p-3 shadow-lg flex items-center justify-between z-30"> {/* Stronger shadow */}
        <div className="flex items-center pl-4">
          <span className="chat-header-text text-2xl font-bold">Just🎙️Speak</span>
        </div>
        <div className="flex items-center space-x-4 pr-4">
          {/* Undo Button */}
          <button
            onClick={handleUndo}
            disabled={historyPointer <= 0}
            className={`px-3 py-1.5 rounded-full shadow-md text-sm font-semibold flex items-center transition duration-150 ease-in-out ${historyPointer <= 0 ? 'bg-[var(--color-button-secondary-hover-bg)] text-secondary-color cursor-not-allowed' : 'btn-secondary-bg btn-secondary-text btn-secondary-hover-bg btn-secondary-hover-text'}`}
            title="Undo"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z"></path></svg>
          </button>
          {/* Redo Button */}
          <button
            onClick={handleRedo}
            disabled={historyPointer >= history.length - 1}
            className={`px-3 py-1.5 rounded-full shadow-md text-sm font-semibold flex items-center transition duration-150 ease-in-out ${historyPointer >= history.length - 1 ? 'bg-[var(--color-button-secondary-hover-bg)] text-secondary-color cursor-not-allowed' : 'btn-secondary-bg btn-secondary-text btn-secondary-hover-bg btn-secondary-hover-text'}`}
            title="Redo"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 9l3 3m0 0l-3 3m3-3H6m10 0a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </button>
          <div className="relative">
            <input type="text" placeholder="Search..." className="pl-10 pr-4 py-2 rounded-full input-bg bg-opacity-20 text-[var(--color-input-text)] placeholder-[var(--color-input-text)] outline-none ring-2 ring-[var(--color-input-focus-ring)] focus:bg-opacity-30" />
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--color-input-text)] w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>
          {/* Download Options */}
          <div className="flex space-x-2">
            <button onClick={triggerDownloadPng} className="px-3 py-1.5 btn-secondary-bg btn-secondary-text rounded-full shadow-md btn-secondary-hover-bg btn-secondary-hover-text transition duration-150 ease-in-out text-sm font-semibold flex items-center" title="Download as PNG" >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg> PNG
            </button>
            <button onClick={triggerDownloadJpg} className="px-3 py-1.5 btn-secondary-bg btn-secondary-text rounded-full shadow-md btn-secondary-hover-bg btn-secondary-hover-text transition duration-150 ease-in-out text-sm font-semibold flex items-center" title="Download as JPG (approx.)" >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg> JPG
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel */}
        <div
          className={`flex-shrink-0 chat-sidebar-gradient p-4 border-r panel-border overflow-y-auto custom-scrollbar transition-all duration-300 ease-in-out ${showLeftPanel ? 'w-80' : 'w-0 p-0 overflow-hidden'}`}
        >
          {showLeftPanel && (
            <>
              {/* Panel Header/Tabs */}
              <div className="mb-4 border-b pb-2 border-dashed border-gray-300">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-xl font-semibold text-primary-color">Tools & Properties</h2>
                  <button onClick={() => setShowLeftPanel(false)} className="text-secondary-color hover:text-primary-color transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                  </button>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setActiveLeftPanelTab('shapes')}
                    className={`px-3 py-1 rounded-md text-sm font-medium ${activeLeftPanelTab === 'shapes' ? 'btn-tab-active-bg btn-tab-active-text' : 'btn-tab-inactive-bg btn-tab-inactive-text'}`}
                  >
                    Shapes
                  </button>
                  <button
                    onClick={() => setActiveLeftPanelTab('properties')}
                    className={`px-3 py-1 rounded-md text-sm font-medium ${activeLeftPanelTab === 'properties' ? 'btn-tab-active-bg btn-tab-active-text' : 'btn-tab-inactive-bg btn-tab-inactive-text'}`}
                  >
                    Properties
                  </button>
                </div>
              </div>

              {/* Shapes Tab Content */}
              {activeLeftPanelTab === 'shapes' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-primary-color mb-3">Add Elements</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => addShape('rectangle')} className="btn-secondary-bg btn-secondary-text py-2 px-3 rounded-md text-sm font-medium shadow-sm hover:btn-secondary-hover-bg hover:btn-secondary-hover-text transition duration-150 ease-in-out">
                      Add Rectangle
                    </button>
                    <button onClick={() => addShape('circle')} className="btn-secondary-bg btn-secondary-text py-2 px-3 rounded-md text-sm font-medium shadow-sm hover:btn-secondary-hover-bg hover:btn-secondary-hover-text transition duration-150 ease-in-out">
                      Add Circle
                    </button>
                    <button onClick={() => addShape('diamond')} className="btn-secondary-bg btn-secondary-text py-2 px-3 rounded-md text-sm font-medium shadow-sm hover:btn-secondary-hover-bg hover:btn-secondary-hover-text transition duration-150 ease-in-out">
                      Add Diamond
                    </button>
                    <button onClick={() => addShape('arrow')} className="btn-secondary-bg btn-secondary-text py-2 px-3 rounded-md text-sm font-medium shadow-sm hover:btn-secondary-hover-bg hover:btn-secondary-hover-text transition duration-150 ease-in-out">
                      Add Arrow Node
                    </button>
                  </div>
                  <div className="border-t border-dashed border-gray-300 pt-4 mt-4">
                    <h3 className="text-lg font-medium text-primary-color mb-3">Connections</h3>
                    <div className="grid grid-cols-1 gap-3">
                      <button onClick={handleAddEdge} className="btn-secondary-bg btn-secondary-text py-2 px-3 rounded-md text-sm font-medium shadow-sm hover:btn-secondary-hover-bg hover:btn-secondary-hover-text transition duration-150 ease-in-out">
                        Guide: Add Edge
                      </button>
                      <button onClick={handleAddNewNodesWithEdge} className="btn-secondary-bg btn-secondary-text py-2 px-3 rounded-md text-sm font-medium shadow-sm hover:btn-secondary-hover-bg hover:btn-secondary-hover-text transition duration-150 ease-in-out">
                        Add Two Nodes + Edge
                      </button>
                    </div>
                  </div>
                  <div className="border-t border-dashed border-gray-300 pt-4 mt-4">
                    <h3 className="text-lg font-medium text-primary-color mb-3">Layout & Clear</h3>
                    <div className="grid grid-cols-1 gap-3">
                      <button onClick={triggerApplyLayout} className="btn-secondary-bg btn-secondary-text py-2 px-3 rounded-md text-sm font-medium shadow-sm hover:btn-secondary-hover-bg hover:btn-secondary-hover-text transition duration-150 ease-in-out">
                        Apply Auto-Layout
                      </button>
                      <button onClick={clearDiagram} className="btn-danger-bg btn-danger-text py-2 px-3 rounded-md text-sm font-medium shadow-sm hover:btn-danger-hover-bg transition duration-150 ease-in-out">
                        Clear All
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Properties Tab Content */}
              {activeLeftPanelTab === 'properties' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-primary-color mb-3">Element Properties</h3>
                  {!selectedElementId && (
                    <p className="text-secondary-color text-sm">Select a node or edge to edit its properties.</p>
                  )}

                  {selectedNode && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-primary-color text-md">Node: {selectedNode.data.label || 'Unnamed Node'}</h4>
                      <div>
                        <label htmlFor="nodeLabel" className="block text-sm font-medium text-secondary-color">Label</label>
                        <input
                          id="nodeLabel"
                          type="text"
                          value={selectedNode.data.label || ''}
                          onChange={(e) => updateNodeLabel(e.target.value)}
                          className="mt-1 w-full p-2 border input-border rounded-md input-bg input-text-color focus:ring-2 focus:ring-[var(--color-input-focus-ring)]"
                        />
                      </div>
                      <div>
                        <label htmlFor="nodeColor" className="block text-sm font-medium text-secondary-color">Background Color</label>
                        <input
                          id="nodeColor"
                          type="color"
                          value={colorNameToHex(selectedNode.data.color || 'var(--color-node-bg)')}
                          onChange={(e) => updateNodeColor(e.target.value)}
                          className="mt-1 w-full p-1 border input-border rounded-md h-10 cursor-pointer"
                        />
                      </div>
                      <div>
                        <label htmlFor="nodeTextColor" className="block text-sm font-medium text-secondary-color">Text Color</label>
                        <input
                          id="nodeTextColor"
                          type="color"
                          value={colorNameToHex(selectedNode.data.textColor || 'var(--color-node-text)')}
                          onChange={(e) => updateNodeTextColor(e.target.value)}
                          className="mt-1 w-full p-1 border input-border rounded-md h-10 cursor-pointer"
                        />
                      </div>
                      <div>
                        <label htmlFor="nodeFontWeight" className="block text-sm font-medium text-secondary-color">Font Weight</label>
                        <select
                          id="nodeFontWeight"
                          value={selectedNode.data.fontWeight || 'normal'}
                          onChange={(e) => updateNodeFontWeight(e.target.value)}
                          className="mt-1 w-full p-2 border input-border rounded-md input-bg input-text-color focus:ring-2 focus:ring-[var(--color-input-focus-ring)]"
                        >
                          <option value="normal">Normal</option>
                          <option value="bold">Bold</option>
                          <option value="bolder">Bolder</option>
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label htmlFor="nodeWidth" className="block text-sm font-medium text-secondary-color">Width (px)</label>
                          <input
                            id="nodeWidth"
                            type="number"
                            value={selectedNode.data.nodeWidth || ''}
                            onChange={(e) => updateNodeWidth(e.target.value)}
                            className="mt-1 w-full p-2 border input-border rounded-md input-bg input-text-color focus:ring-2 focus:ring-[var(--color-input-focus-ring)]"
                          />
                        </div>
                        <div>
                          <label htmlFor="nodeHeight" className="block text-sm font-medium text-secondary-color">Height (px)</label>
                          <input
                            id="nodeHeight"
                            type="number"
                            value={selectedNode.data.nodeHeight || ''}
                            onChange={(e) => updateNodeHeight(e.target.value)}
                            className="mt-1 w-full p-2 border input-border rounded-md input-bg input-text-color focus:ring-2 focus:ring-[var(--color-input-focus-ring)]"
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="nodeFontSize" className="block text-sm font-medium text-secondary-color">Font Size (px)</label>
                        <input
                          id="nodeFontSize"
                          type="number"
                          value={selectedNode.data.fontSize || ''}
                          onChange={(e) => updateNodeFontSize(e.target.value)}
                          className="mt-1 w-full p-2 border input-border rounded-md input-bg input-text-color focus:ring-2 focus:ring-[var(--color-input-focus-ring)]"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label htmlFor="textOffsetX" className="block text-sm font-medium text-secondary-color">Text Offset X (px)</label>
                          <input
                            id="textOffsetX"
                            type="number"
                            value={selectedNode.data.textOffsetX || 0}
                            onChange={(e) => updateNodeTextOffsetX(e.target.value)}
                            className="mt-1 w-full p-2 border input-border rounded-md input-bg input-text-color focus:ring-2 focus:ring-[var(--color-input-focus-ring)]"
                          />
                        </div>
                        <div>
                          <label htmlFor="textOffsetY" className="block text-sm font-medium text-secondary-color">Text Offset Y (px)</label>
                          <input
                            id="textOffsetY"
                            type="number"
                            value={selectedNode.data.textOffsetY || 0}
                            onChange={(e) => updateNodeTextOffsetY(e.target.value)}
                            className="mt-1 w-full p-2 border input-border rounded-md input-bg input-text-color focus:ring-2 focus:ring-[var(--color-input-focus-ring)]"
                          />
                        </div>
                      </div>
                      {selectedNode.type === 'arrow' && (
                        <>
                          <div>
                            <label htmlFor="arrowRotation" className="block text-sm font-medium text-secondary-color">Rotation (deg)</label>
                            <input
                              id="arrowRotation"
                              type="number"
                              value={selectedNode.data.rotation || 0}
                              onChange={(e) => updateArrowRotation(e.target.value)}
                              className="mt-1 w-full p-2 border input-border rounded-md input-bg input-text-color focus:ring-2 focus:ring-[var(--color-input-focus-ring)]"
                            />
                          </div>
                          <div>
                            <label htmlFor="arrowheadStyle" className="block text-sm font-medium text-secondary-color">Arrowhead Style</label>
                            <select
                              id="arrowheadStyle"
                              value={selectedNode.data.arrowheadStyle || 'Closed'}
                              onChange={(e) => updateArrowheadStyle(e.target.value)}
                              className="mt-1 w-full p-2 border input-border rounded-md input-bg input-text-color focus:ring-2 focus:ring-[var(--color-input-focus-ring)]"
                            >
                              <option value="Closed">Closed</option>
                              <option value="Open">Open</option>
                              <option value="None">None</option>
                            </select>
                          </div>
                          <div>
                            <label htmlFor="arrowheadColor" className="block text-sm font-medium text-secondary-color">Arrowhead Color</label>
                            <input
                              id="arrowheadColor"
                              type="color"
                              value={colorNameToHex(selectedNode.data.arrowheadColor || selectedNode.data.color || 'var(--color-border)')}
                              onChange={(e) => updateArrowheadColor(e.target.value)}
                              className="mt-1 w-full p-1 border input-border rounded-md h-10 cursor-pointer"
                            />
                          </div>
                        </>
                      )}
                      <div className="border-t border-dashed border-gray-300 pt-4 mt-4">
                        <h4 className="font-semibold text-primary-color text-md mb-2">Layering</h4>
                        <div className="grid grid-cols-2 gap-3">
                          <button onClick={() => changeNodeLayer('front')} className="btn-secondary-bg btn-secondary-text py-2 px-3 rounded-md text-sm font-medium shadow-sm hover:btn-secondary-hover-bg transition duration-150 ease-in-out">
                            Bring to Front
                          </button>
                          <button onClick={() => changeNodeLayer('back')} className="btn-secondary-bg btn-secondary-text py-2 px-3 rounded-md text-sm font-medium shadow-sm hover:btn-secondary-hover-bg transition duration-150 ease-in-out">
                            Send to Back
                          </button>
                        </div>
                      </div>
                      <div className="border-t border-dashed border-gray-300 pt-4 mt-4">
                        <button
                          onClick={() => deleteSelectedElement()}
                          className="btn-danger-bg btn-danger-text py-2 px-3 rounded-md text-sm font-medium shadow-sm w-full hover:btn-danger-hover-bg transition duration-150 ease-in-out"
                        >
                          Delete Node
                        </button>
                      </div>
                    </div>
                  )}

                  {selectedEdge && (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-primary-color text-md">Edge: {selectedEdge.id}</h4>
                      <div>
                        <label htmlFor="edgeLabel" className="block text-sm font-medium text-secondary-color">Label (Optional)</label>
                        <input
                          id="edgeLabel"
                          type="text"
                          value={selectedEdge.label || ''}
                          onChange={(e) => updateEdgeLabel(e.target.value)}
                          className="mt-1 w-full p-2 border input-border rounded-md input-bg input-text-color focus:ring-2 focus:ring-[var(--color-input-focus-ring)]"
                        />
                      </div>
                      <div>
                        <label htmlFor="edgeMarkerEndType" className="block text-sm font-medium text-secondary-color">Arrowhead Type</label>
                        <select
                          id="edgeMarkerEndType"
                          value={selectedEdge.markerEnd?.type === MarkerType.ArrowClosed ? 'ArrowClosed' : selectedEdge.markerEnd?.type === MarkerType.Arrow ? 'Arrow' : 'None'}
                          onChange={(e) => updateEdgeMarkerEndType(e.target.value)}
                          className="mt-1 w-full p-2 border input-border rounded-md input-bg input-text-color focus:ring-2 focus:ring-[var(--color-input-focus-ring)]"
                        >
                          <option value="ArrowClosed">Closed Arrow</option>
                          <option value="Arrow">Open Arrow</option>
                          <option value="None">None</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="edgeMarkerEndColor" className="block text-sm font-medium text-secondary-color">Arrowhead Color</label>
                        <input
                          id="edgeMarkerEndColor"
                          type="color"
                          value={colorNameToHex(selectedEdge.markerEnd?.color || 'var(--color-border)')}
                          onChange={(e) => updateEdgeMarkerEndColor(e.target.value)}
                          className="mt-1 w-full p-1 border input-border rounded-md h-10 cursor-pointer"
                        />
                      </div>
                      <div className="border-t border-dashed border-gray-300 pt-4 mt-4">
                        <button
                          onClick={() => deleteSelectedElement()}
                          className="btn-danger-bg btn-danger-text py-2 px-3 rounded-md text-sm font-medium shadow-sm w-full hover:btn-danger-hover-bg transition duration-150 ease-in-out"
                        >
                          Delete Edge
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Canvas Area */}
        <ReactFlowProvider>
          <DiagramCanvas
            ref={diagramCanvasRef}
            nodes={nodes}
            onNodesChange={customOnNodesChange}
            edges={edges}
            onEdgesChange={customOnEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
            onPaneClick={onPaneClick}
            onElementContextMenu={onElementContextMenu}
            canvasTitle={canvasTitle}
            error={error}
          />
        </ReactFlowProvider>

        {/* Right Panel */}
        <div
          className={`flex-shrink-0 chat-sidebar-gradient p-4 border-l panel-border transition-all duration-300 ease-in-out flex flex-col ${showRightPanel ? 'w-96' : 'w-0 p-0 overflow-hidden'}`}
        >
          {showRightPanel && (
            <>
              <div className="flex justify-between items-center mb-4 border-b pb-2 border-dashed border-gray-300">
                <h2 className="text-xl font-semibold text-primary-color">AI Diagram Generator</h2>
                <button onClick={() => setShowRightPanel(false)} className="text-secondary-color hover:text-primary-color transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                </button>
              </div>

              <div className="mb-4">
                <label htmlFor="diagramType" className="block text-sm font-medium text-secondary-color mb-1">Diagram Type</label>
                <select
                  id="diagramType"
                  value={diagramType}
                  onChange={(e) => setDiagramType(e.target.value)}
                  className="w-full p-2 border input-border rounded-md input-bg input-text-color focus:ring-2 focus:ring-[var(--color-input-focus-ring)]"
                  disabled={isLoading}
                >
                  <option value="Flow Chart">Flow Chart</option>
                  <option value="Mind Map">Mind Map</option>
                  <option value="ER Diagram">ER Diagram</option>
                  <option value="UML Diagram">UML Diagram</option>
                  <option value="Org Chart">Org Chart</option>
                </select>
              </div>

              <div className="mb-6 flex-grow">
                <label htmlFor="promptText" className="block text-sm font-medium text-secondary-color mb-1">Describe your diagram</label>
                <textarea
                  id="promptText"
                  className="w-full p-3 border input-border rounded-md min-h-[120px] input-bg input-text-color focus:ring-2 focus:ring-[var(--color-input-focus-ring)] resize-y custom-scrollbar"
                  rows="6"
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  placeholder="e.g., A flow chart for user login process: Start -> Enter Credentials -> Authenticate -> Access Dashboard. If authentication fails, show an error and return to Enter Credentials."
                  disabled={isLoading}
                ></textarea>
              </div>

              <div className="mb-4">
                <label htmlFor="canvasTitle" className="block text-sm font-medium text-secondary-color mb-1">Diagram Title</label>
                <input
                  id="canvasTitle"
                  type="text"
                  value={canvasTitle}
                  onChange={(e) => setCanvasTitle(e.target.value)}
                  className="w-full p-2 border input-border rounded-md input-bg input-text-color focus:ring-2 focus:ring-[var(--color-input-focus-ring)]"
                  disabled={isLoading}
                />
              </div>

              <button
                onClick={generateDiagram}
                className="w-full py-3 btn-primary-gradient btn-primary-text rounded-md text-lg font-semibold shadow-lg hover:brightness-110 transition duration-150 ease-in-out flex items-center justify-center"
                disabled={isLoading}
              >
                {isLoading ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                )}
                {isLoading ? 'Generating...' : 'Generate Diagram'}
              </button>
            </>
          )}
        </div>

        {/* Toggle Buttons */}
        {!showLeftPanel && (
          <button
            onClick={() => setShowLeftPanel(true)}
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-[var(--color-button-secondary-bg)] text-[var(--color-button-secondary-text)] p-2 rounded-r-md shadow-md z-20 hover:bg-[var(--color-button-secondary-hover-bg)] transition-colors"
            title="Show Left Panel"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
          </button>
        )}
        {!showRightPanel && (
          <button
            onClick={() => setShowRightPanel(true)}
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-[var(--color-button-secondary-bg)] text-[var(--color-button-secondary-text)] p-2 rounded-l-md shadow-md z-20 hover:bg-[var(--color-button-secondary-hover-bg)] transition-colors"
            title="Show Right Panel"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
          </button>
        )}
      </div>

      {/* Modal */}
      <Modal {...modalConfig} show={showModal} />
    </div>
  );
};

export default Mindmap;