import React, { useState, useEffect } from 'react';
import { ResponsiveGridLayout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

// Import existing components as requested
import DataChart from '../components/DataChart';
import MapPanel from '../components/MapPanel';
import InfoCard from '../components/InfoCard';

const DEFAULT_LAYOUT = [
  { i: 'chart', x: 0, y: 0, w: 8, h: 4, minW: 4, minH: 3 },
  { i: 'map', x: 8, y: 0, w: 4, h: 4, minW: 3, minH: 3 },
  { i: 'info', x: 0, y: 4, w: 12, h: 2, minW: 4, minH: 2 }
];

export default function Dashboard() {
  const [layout, setLayout] = useState([]);
  const [panels, setPanels] = useState([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Load from localStorage on mount
    try {
      const savedLayout = localStorage.getItem('geoLayout');
      if (savedLayout) {
        const parsed = JSON.parse(savedLayout);
        if (parsed && parsed.length > 0) {
          setLayout(parsed);
          // Reconstruct panels based on the layout ids
          const loadedPanels = parsed.map(item => ({
            id: item.i,
            type: ['chart', 'map', 'info'].includes(item.i) ? item.i : 'custom'
          }));
          setPanels(loadedPanels);
          setMounted(true);
          return;
        }
      }
    } catch (e) {
      console.error("Failed to load layout from localStorage", e);
    }
    
    // Fallback to default
    setLayout(DEFAULT_LAYOUT);
    setPanels([
      { id: 'chart', type: 'chart' },
      { id: 'map', type: 'map' },
      { id: 'info', type: 'info' }
    ]);
    setMounted(true);
  }, []);

  const handleLayoutChange = (newLayout) => {
    setLayout(newLayout);
    localStorage.setItem('geoLayout', JSON.stringify(newLayout));
  };

  const addPanel = () => {
    const newId = `panel-${Date.now()}`;
    const newPanelLayout = {
      i: newId,
      x: 0, // It will automatically be placed at the bottom if x:0, y:Infinity
      y: Infinity,
      w: 4,
      h: 3,
      minW: 2,
      minH: 2
    };
    
    setPanels([...panels, { id: newId, type: 'custom' }]);
    setLayout([...layout, newPanelLayout]);
  };

  const removePanel = (idToRemove) => {
    setPanels(panels.filter(p => p.id !== idToRemove));
    setLayout(layout.filter(l => l.i !== idToRemove));
  };

  const renderComponent = (type) => {
    switch (type) {
      case 'chart': return <DataChart />;
      case 'map': return <MapPanel />;
      case 'info': return <InfoCard />;
      default: return <div className="p-4 bg-white h-full flex items-center justify-center text-slate-400">Custom Panel</div>;
    }
  };

  // Avoid rendering layout until client-side hydration is done to prevent layout jumping
  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Dynamic Dashboard</h1>
          <p className="text-slate-500 mt-1">Drag, resize, and organize your workspace</p>
        </div>
        <button 
          onClick={addPanel}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded shadow transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Panel
        </button>
      </div>

      <div className="max-w-7xl mx-auto">
        <ResponsiveGridLayout
          className="layout"
          layouts={{ lg: layout }}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={100}
          onLayoutChange={handleLayoutChange}
          draggableHandle=".drag-handle"
          margin={[16, 16]}
        >
          {panels.map(panel => (
            <div key={panel.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
              {/* Panel Header */}
              <div className="drag-handle bg-slate-100 border-b border-slate-200 px-4 py-2 flex justify-between items-center cursor-move select-none">
                <span className="font-medium text-slate-700 capitalize">
                  {panel.type === 'custom' ? 'New Panel' : `${panel.type} Panel`}
                </span>
                <button 
                  onClick={(e) => { e.stopPropagation(); removePanel(panel.id); }}
                  className="text-slate-400 hover:text-red-500 transition-colors"
                  title="Remove panel"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {/* Panel Content */}
              <div className="flex-1 overflow-auto">
                {renderComponent(panel.type)}
              </div>
            </div>
          ))}
        </ResponsiveGridLayout>
      </div>
    </div>
  );
}
