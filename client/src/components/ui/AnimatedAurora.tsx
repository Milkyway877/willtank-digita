import React, { useEffect, useRef } from 'react'

export const AnimatedAurora: React.FC = () => {
  const auroraRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const aurora = auroraRef.current;
    if (!aurora) return;
    
    // Create multiple aurora layers for a richer effect
    for (let i = 0; i < 3; i++) {
      const layer = document.createElement('div');
      layer.className = `aurora-layer aurora-layer-${i+1}`;
      aurora.appendChild(layer);
    }
    
    return () => {
      // Cleanup
      if (aurora) {
        aurora.innerHTML = '';
      }
    };
  }, []);
  
  return (
    <div className="aurora-container fixed inset-0 z-[-2] overflow-hidden">
      <div ref={auroraRef} className="aurora-wrapper"></div>
    </div>
  )
}

export default AnimatedAurora
