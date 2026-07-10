import React, { useMemo, useState } from 'react';

const RailMLTopologyViewer = ({ topology, gisLayers = {}, line, t = (k) => k }) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [tooltip, setTooltip] = useState(null);
  const containerRef = React.useRef(null);

  const startKm = line && line.startKm !== undefined ? Number(line.startKm) : 0;
  const endKm = line && line.endKm !== undefined ? Number(line.endKm) : 5;
  const totalKm = endKm - startKm;

  const getRelativeCoords = (clientX, clientY) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (tooltip) {
      const { x, y } = getRelativeCoords(e.clientX, e.clientY);
      setTooltip(t => ({ ...t, x, y }));
    }
    if (!isDragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleElementMouseEnter = (e, data) => {
    const { x, y } = getRelativeCoords(e.clientX, e.clientY);
    setTooltip({ x, y, data });
  };

  const handleElementMouseLeave = () => {
    setTooltip(null);
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleWheel = (e) => {
    e.preventDefault();
    const zoomFactor = 1.1;
    if (e.deltaY < 0) setZoom(z => Math.min(z * zoomFactor, 3));
    else setZoom(z => Math.max(z / zoomFactor, 0.5));
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const paddingLeft = 60;
  const paddingRight = 60;
  const svgWidth = 1250;
  const usableWidth = svgWidth - paddingLeft - paddingRight;

  const getScreenX = (kmValue) => {
    if (totalKm <= 0) return paddingLeft;
    const ratio = (kmValue - startKm) / totalKm;
    return paddingLeft + ratio * usableWidth;
  };

  // Generate lower ticks (every 1 km, or 0.5 km depending on total length)
  const lowerTicks = useMemo(() => {
    const ticks = [];
    if (totalKm <= 0) return ticks;
    
    let step = 1; // 1 km
    if (totalKm <= 5) step = 0.5;
    if (totalKm > 50) step = 5;
    if (totalKm > 100) step = 10;
    
    const firstTick = Math.ceil(startKm / step) * step;
    for (let km = firstTick; km <= endKm; km += step) {
      ticks.push(km);
    }
    // Always include start and end if not present
    if (!ticks.includes(startKm)) ticks.unshift(startKm);
    if (!ticks.includes(endKm)) ticks.push(endKm);
    return ticks;
  }, [startKm, endKm, totalKm]);

  // Generate upper ticks from topology if available
  const upperTicks = useMemo(() => {
    const ticks = [];
    if (topology && topology.nodes) {
      topology.nodes.forEach(node => {
         if (node.pos !== undefined) {
           const nodeKm = startKm + (node.pos / 1000);
           if (nodeKm >= startKm && nodeKm <= endKm) {
             ticks.push({ km: nodeKm, label: node.id });
           }
         }
      });
    }
    return ticks;
  }, [topology, startKm, endKm]);

  return (
    <div ref={containerRef} className="relative w-full border border-slate-300 bg-slate-50 rounded-xl overflow-hidden shadow-inner">
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <button onClick={() => setZoom(z => Math.min(z * 1.2, 3))} className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-700 font-bold border border-slate-200 rounded-md shadow-sm text-sm">+</button>
        <button onClick={() => setZoom(z => Math.max(z / 1.2, 0.5))} className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-700 font-bold border border-slate-200 rounded-md shadow-sm text-sm">-</button>
        <button onClick={resetView} className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-700 font-semibold border border-slate-200 rounded-md shadow-sm text-xs">Reset</button>
      </div>

      <div 
        className="w-full h-[300px] cursor-grab active:cursor-grabbing select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <svg width="100%" height="100%" viewBox={`0 0 ${svgWidth} 300`}>
          <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
            {/* Grid background */}
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f1f5f9" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="2500" height="1000" x="-500" y="-200" fill="url(#grid)" pointerEvents="none" />

            {!line && (
              <text x={svgWidth/2} y={150} textAnchor="middle" fill="#94a3b8" fontSize="14" fontWeight="bold">
                {t('topoNoLineSelected')}
              </text>
            )}

            {/* Absolute Axis in Kilometer (centered vertically) */}
            {line && (
              <g transform="translate(0, 150)">
                {/* Main Track (RailML Style) */}
                <g transform="translate(0, -60)">
                  {/* Track Background */}
                  <line 
                    x1={getScreenX(startKm)} 
                    y1={0} 
                    x2={getScreenX(endKm)} 
                    y2={0} 
                    stroke="#1e293b" 
                    strokeWidth={8} 
                    strokeLinecap="round"
                  />
                  {/* Track Foreground (Blue) */}
                  <line 
                    x1={getScreenX(startKm)} 
                    y1={0} 
                    x2={getScreenX(endKm)} 
                    y2={0} 
                    stroke="#3b82f6" 
                    strokeWidth={5} 
                    strokeLinecap="round"
                  />
                  
                  {/* Start Node */}
                  <circle cx={getScreenX(startKm)} cy={0} r={5} fill="#fff" stroke="#1e293b" strokeWidth={2} />
                  <text x={getScreenX(startKm)} y={-15} textAnchor="middle" fontSize={10} fontWeight="bold" fill="#0f172a">
                    {startKm.toFixed(3)}
                  </text>

                  {/* End Node */}
                  <circle cx={getScreenX(endKm)} cy={0} r={5} fill="#fff" stroke="#1e293b" strokeWidth={2} />
                  <text x={getScreenX(endKm)} y={-15} textAnchor="middle" fontSize={10} fontWeight="bold" fill="#0f172a">
                    {endKm.toFixed(3)}
                  </text>
                  
                  {/* Track Label */}
                  <text x={(getScreenX(startKm) + getScreenX(endKm))/2} y={-12} textAnchor="middle" fontSize={12} fontWeight="bold" fill="#1d4ed8">
                    {line.name} - {t('topoMainTrack')}
                  </text>

                  {/* Rendering Stations as OCP Platforms */}
                  {(gisLayers.stations || []).map(st => {
                    const skm = parseFloat(st.startKm);
                    const ekm = parseFloat(st.endKm);
                    if (isNaN(skm) || isNaN(ekm)) return null;
                    const sx1 = getScreenX(skm);
                    const sx2 = getScreenX(ekm);
                    const w = Math.max(sx2 - sx1, 10);
                    return (
                      <g 
                        key={st.id} 
                        transform={`translate(${sx1}, -18)`}
                        onMouseEnter={(e) => handleElementMouseEnter(e, { type: 'Stazione', code: st.stationCode, name: st.name, startKm: skm, endKm: ekm })}
                        onMouseLeave={handleElementMouseLeave}
                        className="cursor-pointer transition-opacity hover:opacity-80"
                      >
                        <rect x={0} y={-12} width={w} height={8} fill="#f97316" rx={2} stroke="#c2410c" strokeWidth={1} />
                        <text x={w/2} y={-16} textAnchor="middle" fontSize={10} fontWeight="bold" fill="#ea580c">
                          {st.stationCode}
                        </text>
                      </g>
                    );
                  })}

                  {/* Rendering Switches as Branching Lines */}
                  {(gisLayers.switches || []).map((sw, idx) => {
                    const skm = parseFloat(sw.startKm ?? sw.km);
                    const ekm = parseFloat(sw.endKm ?? sw.km);
                    if (isNaN(skm) || isNaN(ekm)) return null;
                    const sx1 = getScreenX(skm);
                    const sx2 = getScreenX(ekm);
                    const isFacing = sw.switchType === 'Facing' || idx % 2 === 0;
                    const offset = isFacing ? 20 : -20;
                    return (
                      <g 
                        key={sw.id}
                        onMouseEnter={(e) => handleElementMouseEnter(e, { type: 'Scambio', id: sw.switchId, switchType: sw.switchType, angle: sw.angle, startKm: skm, endKm: ekm })}
                        onMouseLeave={handleElementMouseLeave}
                        className="cursor-pointer transition-opacity hover:opacity-80"
                      >
                        {/* Branch line */}
                        <path 
                          d={`M ${sx1} 0 Q ${(sx1+sx2)/2} ${offset} ${sx2} ${offset}`} 
                          fill="none" 
                          stroke={sw.color || "#0284c7"} 
                          strokeWidth={3} 
                          strokeLinecap="round" 
                        />
                        <circle cx={sx1} cy={0} r={3} fill="#fff" stroke="#0284c7" strokeWidth={1.5} />
                        <text x={sx2} y={offset + (isFacing ? 12 : -4)} textAnchor="middle" fontSize={9} fontWeight="bold" fill="#0369a1">
                          {sw.switchId} ({sw.angle})
                        </text>
                      </g>
                    );
                  })}
                </g>

                {/* Main Line Axis */}
                <line x1={getScreenX(startKm)} y1={0} x2={getScreenX(endKm)} y2={0} stroke="#475569" strokeWidth={1.5} />

                {/* Interval Marks (Lower Ticks) */}
                {lowerTicks.map((km, idx) => {
                  const x = getScreenX(km);
                  return (
                    <g key={`km-tick-${idx}`}>
                      <line x1={x} y1={0} x2={x} y2={8} stroke="#475569" strokeWidth={1.5} />
                      <text x={x} y={22} textAnchor="middle" fontSize={9.5} fill="#64748b" className="font-sans">
                        {km.toFixed(1)} km
                      </text>
                    </g>
                  );
                })}

                {/* Vertical tick dotted lines crossing the whole area */}
                {lowerTicks.map((km, idx) => {
                  const x = getScreenX(km);
                  return (
                    <line 
                      key={`v-line-${idx}`}
                      x1={x} 
                      y1={100} 
                      x2={x} 
                      y2={-100} 
                      stroke="#cbd5e1" 
                      strokeWidth={1.2} 
                      strokeDasharray="4,4" 
                    />
                  );
                })}

                {/* Exact Progressive Position Labels (Upper Ticks) */}
                {upperTicks.map((t, idx) => {
                  const x = getScreenX(t.km);
                  return (
                    <g key={`prog-tick-${idx}`}>
                      <line x1={x} y1={0} x2={x} y2={-8} stroke="#0f172a" strokeWidth={1.5} />
                      <text x={x} y={-14} textAnchor="middle" fontSize={9} fontWeight="bold" fill="#0f172a">
                        {t.km.toFixed(3)}
                      </text>
                      {t.label && (
                         <text x={x} y={-26} textAnchor="middle" fontSize={8} fill="#475569">
                           {t.label}
                         </text>
                      )}
                    </g>
                  );
                })}
              </g>
            )}
          </g>
        </svg>
      </div>

      {/* Tooltip Overlay */}
      {tooltip && tooltip.data && (
        <div 
          className="absolute z-50 bg-slate-800 text-white px-3 py-2 rounded-lg shadow-xl text-xs pointer-events-none border border-slate-600"
          style={{ left: tooltip.x, top: tooltip.y - 20, transform: 'translate(-50%, -100%)' }}
        >
          <div className="font-bold text-sm mb-1 text-slate-100 uppercase tracking-wider">{tooltip.data.type}</div>
          
          {tooltip.data.type === 'Stazione' && (
            <>
              <div className="mb-1">
                <span className="text-slate-400">Codice:</span> <span className="font-mono text-orange-300 font-semibold">{tooltip.data.code}</span>
                {tooltip.data.name && <span className="ml-1">- {tooltip.data.name}</span>}
              </div>
              <div><span className="text-slate-400">Tratta Km:</span> {tooltip.data.startKm.toFixed(3)} - {tooltip.data.endKm.toFixed(3)}</div>
            </>
          )}

          {tooltip.data.type === 'Scambio' && (
            <>
              <div className="mb-1">
                <span className="text-slate-400">ID:</span> <span className="font-mono text-sky-300 font-semibold">{tooltip.data.id}</span>
              </div>
              <div className="mb-1">
                <span className="text-slate-400">Tipo:</span> {tooltip.data.switchType || 'N/A'} <span className="text-slate-400 ml-2">Angolo:</span> {tooltip.data.angle || 'N/A'}
              </div>
              <div><span className="text-slate-400">Posizione Km:</span> {tooltip.data.startKm.toFixed(3)}</div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default RailMLTopologyViewer;
