"use client";
import React, { useState, useEffect } from 'react';

/**
 * 2D Narrative Correlation Graph (Stitch ID Engine)
 * A visual representation of narrative connections within the archive.
 */
export default function NarrativeGraph({ stories = [] }) {
  const [nodes, setNodes] = useState([]);
  const [links, setLinks] = useState([]);

  useEffect(() => {
    // Mock Data Generation for initial MVP (Simulating real DB tags map)
    const generateGraph = () => {
      const storyNodes = stories.slice(0, 15).map((story, i) => ({
        id: story._id || `s-${i}`,
        label: story.title?.en || 'Unnamed Archive',
        x: 100 + Math.random() * 600,
        y: 100 + Math.random() * 400,
        category: story.category || 'general-horror'
      }));

      // Generate random links between nodes sharing same category (Correlation Logic map)
      const storyLinks = [];
      for (let i = 0; i < storyNodes.length; i++) {
        for (let j = i + 1; j < storyNodes.length; j++) {
           if (storyNodes[i].category === storyNodes[j].category && Math.random() > 0.5) {
             storyLinks.push({ source: storyNodes[i].id, target: storyNodes[j].id });
           }
        }
      }
      
      setNodes(storyNodes);
      setLinks(storyLinks);
    };

    generateGraph();
  }, [stories]);

  const getColor = (cat) => {
    const colors = {
      'real-horror': '#A31D1D',
      'paranormal': '#5C0F8B',
      'haunted-places': '#1D4ED8',
      'urban-legends': '#059669',
      'general-horror': '#4B5563'
    };
    return colors[cat] || colors['general-horror'];
  };

  return (
    <div className="relative w-full h-[600px] bg-black/40 rounded-3xl border border-outline-variant/30 overflow-hidden group">
      
      {/* Background Grid Registry */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none"></div>

      <svg className="w-full h-full cursor-crosshair">
        <defs>
           <filter id="glow">
             <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
             <feMerge>
                <feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/>
             </feMerge>
           </filter>
        </defs>

        {/* Connection Lines (Stitch Threads) */}
        {links.map((link, idx) => {
          const s = nodes.find(n => n.id === link.source);
          const t = nodes.find(n => n.id === link.target);
          if (!s || !t) return null;
          return (
            <line 
              key={idx} 
              x1={s.x} y1={s.y} x2={t.x} y2={t.y} 
              stroke="white" 
              strokeOpacity="0.1" 
              strokeWidth="1" 
              className="animate-pulse"
            />
          );
        })}

        {/* Archive Nodes (Stitch Points) */}
        {nodes.map((node, idx) => (
          <g key={idx} className="group/node cursor-pointer">
            <circle 
               cx={node.x} cy={node.y} r="6" 
               fill={getColor(node.category)} 
               className="transition-all duration-300 hover:r-10 blur-none group-hover/node:filter-glow"
               filter="url(#glow)"
            />
            {/* Label Display on Hover */}
            <text 
               x={node.x + 12} y={node.y + 4} 
               fill="white" 
               className="text-[9px] font-black uppercase tracking-widest opacity-0 group-hover/node:opacity-60 transition-opacity pointer-events-none select-none"
            >
               {node.label}
            </text>
          </g>
        ))}
      </svg>

      {/* Meta Legend */}
      <div className="absolute bottom-6 left-6 p-4 bg-black/60 backdrop-blur-xl border border-white/5 rounded-2xl flex flex-col gap-2">
         <p className="text-[9px] font-black uppercase tracking-[0.3em] text-on-surface-variant mb-2">Narrative Clusters</p>
         {['real-horror', 'paranormal', 'haunted-places', 'urban-legends'].map(cat => (
           <div key={cat} className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getColor(cat) }}></div>
              <span className="text-[8px] font-bold uppercase tracking-widest text-on-surface/60">{cat.replace('-', ' ')}</span>
           </div>
         ))}
      </div>

      <div className="absolute top-6 right-6 text-right">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary animate-pulse">Correlation Engine: ONLINE</p>
          <p className="text-[8px] text-on-surface-variant uppercase tracking-widest mt-1">Stitch ID Analysis: 0.04ms</p>
      </div>
    </div>
  );
}
