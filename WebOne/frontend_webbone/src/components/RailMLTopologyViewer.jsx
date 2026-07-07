import React, { useMemo, useState } from 'react';

const getTrackColor = (id) => {
  if (id === 'tr08') {
    return '#3b82f6'; // Bright blue for Open Track
  }
  return '#f97316'; // Orange for Station Tracks
};

const getAbsoluteLayouts = (nodes) => {
  const trackLayouts = {};
  
  const absRanges = {
    'tr01': { start: 0, end: 500, y: 260, name: 'a02' },
    'tr02': { start: 0, end: 500, y: 180, name: 'a01' },
    'tr03': { start: 500, end: 700, y: 220, name: 'a03' },
    'tr08': { start: 700, end: 3965, y: 220, name: 'x01' },
    'tr09': { start: 3965, end: 4500, y: 220, name: 'b03' },
    'tr07': { start: 4500, end: 5000, y: 180, name: 'b01' }, // b01 is top track
    'tr05': { start: 4500, end: 4550, y: 220, name: 'b04', isDiagonal: true }, // Diagonal connecting (4500,220) to (4550,260)
    'tr06': { start: 4550, end: 5000, y: 260, name: 'b02' }, // b02 is straight middle
    'tr04': { start: 4350, end: 4550, y: 340, name: 'b05' }  // b05 is bottom track
  };

  nodes.forEach(node => {
    const range = absRanges[node.id];
    if (range) {
      trackLayouts[node.id] = {
        id: node.id,
        startX: range.start,
        endX: range.end,
        y: range.y,
        name: range.name,
        isDiagonal: range.isDiagonal || false,
        track: node
      };
    }
  });

  return trackLayouts;
};

const RailMLTopologyViewer = ({ topology }) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const layouts = useMemo(() => {
    if (!topology || !topology.nodes || topology.nodes.length === 0) return {};
    return getAbsoluteLayouts(topology.nodes);
  }, [topology]);

  if (!topology || !topology.nodes || topology.nodes.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center bg-slate-100 rounded-lg border border-slate-200">
        <p className="text-slate-500">Nessun dato topologico disponibile. Importa un file RailML per generare lo schema.</p>
      </div>
    );
  }

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const zoomFactor = 1.1;
    if (e.deltaY < 0) {
      setZoom(z => Math.min(z * zoomFactor, 3));
    } else {
      setZoom(z => Math.max(z / zoomFactor, 0.5));
    }
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const scale = 0.224;
  const getScreenX = (absX) => 60 + absX * scale;

  const axisTicks = [
    { absPos: 300, label: '0.300' },
    { absPos: 500, label: '0.500' },
    { absPos: 700, label: '0.700' },
    { absPos: 2500, label: '2.500' },
    { absPos: 3965, label: '3.965' },
    { absPos: 4500, label: '4.500' },
    { absPos: 4550, label: '4.550' },
    { absPos: 4700, label: '4.700' }
  ];

  return (
    <div className="relative w-full border border-slate-300 bg-slate-50 rounded-xl overflow-hidden shadow-inner">
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <button onClick={() => setZoom(z => Math.min(z * 1.2, 3))} className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-700 font-bold border border-slate-200 rounded-md shadow-sm text-sm">+</button>
        <button onClick={() => setZoom(z => Math.max(z / 1.2, 0.5))} className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-700 font-bold border border-slate-200 rounded-md shadow-sm text-sm">-</button>
        <button onClick={resetView} className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-700 font-semibold border border-slate-200 rounded-md shadow-sm text-xs">Reset</button>
      </div>

      <div 
        className="w-full h-[550px] cursor-grab active:cursor-grabbing select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <svg 
          width="100%" 
          height="100%" 
          viewBox="0 0 1250 550"
        >
          <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
            {/* Grid background */}
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f1f5f9" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="2500" height="1000" x="-500" y="-200" fill="url(#grid)" pointerEvents="none" />

            {/* Station / Open Track background blocks */}
            {/* BF ARNAU */}
            <rect 
              x={getScreenX(0) - 40} 
              y={60} 
              width={700 * scale + 40} 
              height={320} 
              fill="#fffbeb" 
              stroke="#fed7aa" 
              strokeWidth={1.5}
              rx={8}
              opacity={0.7}
            />
            <text x={getScreenX(0) - 20} y={90} fill="#d97706" fontSize={14} fontWeight="800">BF ARNAU (Binari di Stazione)</text>

            {/* LINEA LIBERA */}
            <rect 
              x={getScreenX(700)} 
              y={60} 
              width={(3965 - 700) * scale} 
              height={320} 
              fill="#f0f9ff" 
              stroke="#bae6fd" 
              strokeWidth={1.5}
              rx={8}
              opacity={0.7}
            />
            <text x={getScreenX(2332)} y={90} textAnchor="middle" fill="#0284c7" fontSize={14} fontWeight="800">LINEA LIBERA (Open Track)</text>

            {/* BF CSTADT */}
            <rect 
              x={getScreenX(3965)} 
              y={60} 
              width={(5000 - 3965) * scale + 40} 
              height={320} 
              fill="#fffbeb" 
              stroke="#fed7aa" 
              strokeWidth={1.5}
              rx={8}
              opacity={0.7}
            />
            <text x={getScreenX(3965) + 20} y={90} fill="#d97706" fontSize={14} fontWeight="800">BF CSTADT (Binari di Stazione)</text>

            {/* Vertical tick dotted lines */}
            {axisTicks.map(t => {
              const x = getScreenX(t.absPos);
              return (
                <line 
                  key={`v-line-${t.absPos}`}
                  x1={x} 
                  y1={425} 
                  x2={x} 
                  y2={80} 
                  stroke="#cbd5e1" 
                  strokeWidth={1.2} 
                  strokeDasharray="4,4" 
                />
              );
            })}

            {/* Render Connection Edges / Switches (converging lines) */}
            {topology.edges?.map(edge => {
              const srcL = layouts[edge.source];
              const tgtL = layouts[edge.target];
              if (!srcL || !tgtL) return null;

              // Don't render diagonal connection lines if it's the diagonal track tr05 itself
              if (edge.source === 'tr05' || edge.target === 'tr05') return null;

              // We calculate converging bends
              let srcX = getScreenX(edge.sourceType === 'end' ? srcL.endX : srcL.startX + edge.sourcePos);
              let tgtX = getScreenX(edge.targetType === 'end' ? tgtL.endX : tgtL.startX + edge.targetPos);

              // Standard diagonal links
              return (
                <line
                  key={`edge-line-${edge.id}`}
                  x1={srcX}
                  y1={srcL.y}
                  x2={tgtX}
                  y2={tgtL.y}
                  stroke="#e2e8f0"
                  strokeWidth={5.5}
                  strokeLinecap="round"
                />
              );
            })}

            {/* Re-render foreground for connection lines */}
            {topology.edges?.map(edge => {
              const srcL = layouts[edge.source];
              const tgtL = layouts[edge.target];
              if (!srcL || !tgtL) return null;
              if (edge.source === 'tr05' || edge.target === 'tr05') return null;

              let srcX = getScreenX(edge.sourceType === 'end' ? srcL.endX : srcL.startX + edge.sourcePos);
              let tgtX = getScreenX(edge.targetType === 'end' ? tgtL.endX : tgtL.startX + edge.targetPos);

              return (
                <line
                  key={`edge-fg-${edge.id}`}
                  x1={srcX}
                  y1={srcL.y}
                  x2={tgtX}
                  y2={tgtL.y}
                  stroke="#f97316"
                  strokeWidth={3}
                  strokeLinecap="round"
                />
              );
            })}

            {/* Tracks */}
            {Object.values(layouts).map(({ id, startX, endX, y, track, name, isDiagonal }) => {
              const hasBeginEdge = topology.edges?.some(e => 
                (e.source === id && e.sourceType === 'begin') || (e.target === id && e.targetType === 'begin')
              );
              const hasEndEdge = topology.edges?.some(e => 
                (e.source === id && e.sourceType === 'end') || (e.target === id && e.targetType === 'end')
              );

              const color = getTrackColor(id);
              const scrStartX = getScreenX(startX);
              const scrEndX = getScreenX(endX);

              // Calculate start and end points for the main horizontal segments
              let lineStartX = scrStartX;
              let lineEndX = scrEndX;
              let hasDiagonalEnd = false;
              let diagEndX = scrEndX;
              let diagEndY = y;

              if (id === 'tr01') {
                lineEndX = getScreenX(endX - 25);
                hasDiagonalEnd = true;
                diagEndX = getScreenX(endX);
                diagEndY = 220; // Merges to Y=220
              } else if (id === 'tr02') {
                lineEndX = getScreenX(endX - 25);
                hasDiagonalEnd = true;
                diagEndX = getScreenX(endX);
                diagEndY = 220; // Merges to Y=220
              } else if (id === 'tr04') {
                lineEndX = getScreenX(endX - 25);
                hasDiagonalEnd = true;
                diagEndX = getScreenX(endX);
                diagEndY = 260; // Merges to Y=260 (tr06 start)
              }

              return (
                <g key={`track-group-${id}`}>
                  {isDiagonal ? (
                    <>
                      {/* Diagonal track like tr05 (b04) */}
                      <line 
                        x1={getScreenX(startX)} 
                        y1={220} 
                        x2={getScreenX(endX)} 
                        y2={260} 
                        stroke="#1e293b" 
                        strokeWidth={5.5} 
                        strokeLinecap="round"
                      />
                      <line 
                        x1={getScreenX(startX)} 
                        y1={220} 
                        x2={getScreenX(endX)} 
                        y2={260} 
                        stroke={color} 
                        strokeWidth={3} 
                        strokeLinecap="round"
                      />
                    </>
                  ) : (
                    <>
                      {/* Main track background */}
                      <line 
                        x1={lineStartX} 
                        y1={y} 
                        x2={lineEndX} 
                        y2={y} 
                        stroke="#1e293b" 
                        strokeWidth={5.5} 
                        strokeLinecap="round"
                      />
                      {/* Diagonal bend background */}
                      {hasDiagonalEnd && (
                        <line 
                          x1={lineEndX} 
                          y1={y} 
                          x2={diagEndX} 
                          y2={diagEndY} 
                          stroke="#1e293b" 
                          strokeWidth={5.5} 
                          strokeLinecap="round"
                        />
                      )}

                      {/* Main track foreground */}
                      <line 
                        x1={lineStartX} 
                        y1={y} 
                        x2={lineEndX} 
                        y2={y} 
                        stroke={color} 
                        strokeWidth={3} 
                        strokeLinecap="round"
                      />
                      {/* Diagonal bend foreground */}
                      {hasDiagonalEnd && (
                        <line 
                          x1={lineEndX} 
                          y1={y} 
                          x2={diagEndX} 
                          y2={diagEndY} 
                          stroke={color} 
                          strokeWidth={3} 
                          strokeLinecap="round"
                        />
                      )}

                      {/* Buffer Stops */}
                      {!hasBeginEdge && (
                        <g>
                          <line x1={scrStartX} y1={y - 8} x2={scrStartX} y2={y + 8} stroke="#1e293b" strokeWidth={3} />
                          <rect x={scrStartX - 4} y={y - 4} width={8} height={8} fill="#ef4444" stroke="#000" strokeWidth={1} />
                        </g>
                      )}
                      {!hasEndEdge && !hasDiagonalEnd && (
                        <g>
                          <line x1={scrEndX} y1={y - 8} x2={scrEndX} y2={y + 8} stroke="#1e293b" strokeWidth={3} />
                          <rect x={scrEndX - 4} y={y - 4} width={8} height={8} fill="#ef4444" stroke="#000" strokeWidth={1} />
                        </g>
                      )}
                    </>
                  )}

                  {/* Track label */}
                  <text 
                    x={isDiagonal ? getScreenX(startX + 25) : (scrStartX + scrEndX) / 2} 
                    y={isDiagonal ? 230 : y - 10} 
                    textAnchor="middle" 
                    fontSize={11} 
                    fill="#475569"
                    fontWeight="bold"
                    className="font-sans"
                  >
                    {name}
                  </text>

                  {/* Platform Edges */}
                  {track.features?.platformEdges?.map(pe => {
                    const peX = getScreenX(startX + pe.pos);
                    const peW = pe.length * scale;
                    const isLeft = pe.side === 'left';
                    return (
                      <g key={pe.id}>
                        <rect
                          x={peX}
                          y={isLeft ? y - 16 : y + 9}
                          width={peW}
                          height={7}
                          fill="#cbd5e1"
                          stroke="#475569"
                          strokeWidth={1}
                          rx={1.5}
                        />
                        <text 
                          x={peX + peW / 2} 
                          y={isLeft ? y - 22 : y + 24} 
                          textAnchor="middle" 
                          fontSize={8.5} 
                          fontWeight="bold" 
                          fill="#475569"
                        >
                          PERRON ({pe.name})
                        </text>
                      </g>
                    );
                  })}

                  {/* Signals */}
                  {track.features?.signals?.map(sig => {
                    const sigX = getScreenX(startX + sig.pos);
                    const isUp = sig.dir === 'up';
                    const labelY = isUp ? y - 32 : y + 22;
                    return (
                      <g key={sig.id}>
                        {/* Stem */}
                        <line x1={sigX} y1={y} x2={sigX} y2={isUp ? y - 18 : y + 18} stroke="#000" strokeWidth={2} />
                        {/* Head */}
                        {sig.type === 'shunting' || sig.function === 'distant' ? (
                          // Distant / subsidiary signal circular board with diagonal slash
                          <g transform={`translate(${sigX}, ${isUp ? y - 18 : y + 18})`}>
                            <circle cx={0} cy={0} r={5} fill="#fff" stroke="#000" strokeWidth={1.5} />
                            <line x1="-3.5" y1="3.5" x2="3.5" y2="-3.5" stroke="#000" strokeWidth={1.5} />
                          </g>
                        ) : (
                          // Main signal head
                          <g>
                            <circle cx={sigX} cy={isUp ? y - 18 : y + 18} r={5} fill="#000" />
                            <circle cx={sigX} cy={isUp ? y - 18 : y + 18} r={2} fill="#22c55e" />
                          </g>
                        )}
                        {/* Label Banner */}
                        <rect 
                          x={sigX - 18} 
                          y={isUp ? y - 36 : y + 26} 
                          width={36} 
                          height={13} 
                          fill="#fef08a" 
                          stroke="#eab308" 
                          strokeWidth={1} 
                          rx={2} 
                        />
                        <text 
                          x={sigX} 
                          y={isUp ? y - 26 : y + 36} 
                          textAnchor="middle" 
                          fontSize={8} 
                          fontWeight="bold" 
                          fill="#000"
                        >
                          {sig.name}
                        </text>
                      </g>
                    );
                  })}

                  {/* Axle Counters / Train Detectors */}
                  {track.features?.trainDetectionElements?.map(tde => {
                    const tdeX = getScreenX(startX + tde.pos);
                    return (
                      <g key={tde.id}>
                        <circle cx={tdeX} cy={y} r={3.5} fill="#1e293b" />
                        <rect 
                          x={tdeX - 16} 
                          y={y + 8} 
                          width={32} 
                          height={12} 
                          fill="#fef08a" 
                          stroke="#ca8a04" 
                          strokeWidth={0.8} 
                          rx={1.5} 
                        />
                        <text x={tdeX} y={y + 17} textAnchor="middle" fontSize={7.5} fontWeight="bold" fill="#000">{tde.id}</text>
                      </g>
                    );
                  })}

                  {/* Level Crossings */}
                  {track.features?.levelCrossings?.map(lc => {
                    const lcX = getScreenX(startX + lc.pos);
                    return (
                      <g key={lc.id} transform={`translate(${lcX}, ${y})`}>
                        {/* Road background */}
                        <rect x="-12" y="-20" width={24} height={40} fill="#cbd5e1" opacity={0.6} />
                        {/* St Andrew cross */}
                        <line x1="-7" y1="-7" x2="7" y2="7" stroke="#dc2626" strokeWidth={2.5} />
                        <line x1="7" y1="-7" x2="-7" y2="7" stroke="#dc2626" strokeWidth={2.5} />
                        <circle r="3.5" fill="none" stroke="#dc2626" strokeWidth={1.5} />
                      </g>
                    );
                  })}

                  {/* Derailers */}
                  {track.features?.derailers?.map(der => {
                    const derX = getScreenX(startX + der.pos);
                    return (
                      <g key={der.id}>
                        <rect 
                          x={derX - 4.5} 
                          y={y - 4.5} 
                          width={9} 
                          height={9} 
                          fill="#dc2626" 
                          stroke="#7f1d1d" 
                          strokeWidth={1.5} 
                        />
                        <rect 
                          x={derX - 22} 
                          y={y + 8} 
                          width={44} 
                          height={12} 
                          fill="#fef08a" 
                          stroke="#ca8a04" 
                          strokeWidth={0.8} 
                          rx={1.5} 
                        />
                        <text x={derX} y={y + 17} textAnchor="middle" fontSize={7.5} fontWeight="bold" fill="#000">{der.name}</text>
                      </g>
                    );
                  })}

                  {/* Speed Board Limits */}
                  {track.features?.speedChanges?.map(sc => {
                    const scX = getScreenX(startX + sc.pos);
                    if (sc.vMax === 'end') return null;
                    return (
                      <g key={sc.id} transform={`translate(${scX}, ${y - 28})`}>
                        <rect x="-7" y="-7" width={14} height={14} fill="#fef08a" stroke="#000" strokeWidth={1.5} />
                        <text x="0" y="3" textAnchor="middle" fontSize={9.5} fontWeight="bold" fill="#000">{parseInt(sc.vMax) / 10}</text>
                      </g>
                    );
                  })}
                </g>
              );
            })}

            {/* Switch Labels */}
            {/* swi01 */}
            <text x={getScreenX(500) - 25} y={155} fill="#ea580c" fontSize={10} fontWeight="bold">68W02 (40)</text>
            <rect x={getScreenX(500) - 10} y={135} width={12} height={12} fill="none" stroke="#ea580c" strokeWidth={1} />
            <text x={getScreenX(500) - 4} y={145} fill="#ea580c" fontSize={9} fontWeight="bold">8</text>

            {/* swi02 */}
            <text x={getScreenX(4500) - 10} y={155} fill="#ea580c" fontSize={10} fontWeight="bold">69W03 (40)</text>
            <rect x={getScreenX(4500) + 12} y={135} width={12} height={12} fill="none" stroke="#ea580c" strokeWidth={1} />
            <text x={getScreenX(4500) + 18} y={145} fill="#ea580c" fontSize={9} fontWeight="bold">8</text>

            {/* swi03 */}
            <text x={getScreenX(4550) + 15} y={305} fill="#ea580c" fontSize={10} fontWeight="bold">69W04</text>

            {/* Absolute Axis in Kilometer (bottom) */}
            <g transform="translate(0, 470)">
              {/* Main Line Axis */}
              <line x1={getScreenX(0)} y1={0} x2={getScreenX(5000)} y2={0} stroke="#475569" strokeWidth={1.5} />

              {/* Interval Marks (0.0km - 5.0km) */}
              {[0, 500, 1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000].map(m => {
                const x = getScreenX(m);
                return (
                  <g key={`km-tick-${m}`}>
                    <line x1={x} y1={0} x2={x} y2={8} stroke="#475569" strokeWidth={1.5} />
                    <text x={x} y={22} textAnchor="middle" fontSize={9.5} fill="#64748b" className="font-sans">{(m / 1000).toFixed(1)} km</text>
                  </g>
                );
              })}

              {/* Exact Progressive Position Labels */}
              {axisTicks.map(t => {
                const x = getScreenX(t.absPos);
                return (
                  <g key={`prog-tick-${t.absPos}`}>
                    <line x1={x} y1={0} x2={x} y2={-8} stroke="#0f172a" strokeWidth={1.5} />
                    <text x={x} y={-14} textAnchor="middle" fontSize={9} fontWeight="bold" fill="#0f172a">{t.label}</text>
                  </g>
                );
              })}
            </g>
          </g>
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 p-4 bg-white border-t border-slate-200 text-xs text-slate-600">
        <div className="flex items-center gap-1.5">
          <span className="w-6 h-2 rounded border border-slate-800 bg-[#f97316]" />
          <span>Binario di Stazione / Station Track (NEST View)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-6 h-2 rounded border border-slate-800 bg-[#3b82f6]" />
          <span>Binario di Linea Libera / Open Track (NEST View)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#22c55e] border border-slate-800" />
          <span>Segnale principale / Main Signal</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#1e293b]" />
          <span>Rilevatore d'asse / Axle Counter</span>
        </div>
      </div>
    </div>
  );
};

export default RailMLTopologyViewer;
