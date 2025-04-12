import React, { useEffect } from 'react'

interface ParticleProps {
  size: number;
  x: string;
  y: string;
  duration: number;
  delay: number;
}

const ParticlesBackground: React.FC = () => {
  useEffect(() => {
    const container = document.getElementById('particles-container');
    if (!container) return;
    
    // Clear existing particles if any
    container.innerHTML = '';
    
    const particleCount = 20;
    
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.classList.add('particle');
      
      // Random size between 2px and 6px
      const size = Math.random() * 4 + 2;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      
      // Random position
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      particle.style.left = `${x}%`;
      particle.style.top = `${y}%`;
      
      // Random opacity
      const opacity = Math.random() * 0.5 + 0.1;
      particle.style.backgroundColor = `rgba(255, 255, 255, ${opacity})`;
      
      // Animation duration and delay
      const duration = Math.random() * 20 + 10;
      const delay = Math.random() * 5;
      particle.style.animation = `float ${duration}s ease-in-out ${delay}s infinite`;
      
      container.appendChild(particle);
    }
    
    return () => {
      // Cleanup
      if (container) container.innerHTML = '';
    };
  }, []);

  return (
    <div id="particles-container" className="fixed inset-0 z-[-1] pointer-events-none"></div>
  )
}

export default ParticlesBackground
