import React, { useEffect, useRef } from 'react';

const AnimatedBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size to match window
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Draw 3D grid
    function draw3DGrid() {
      // Clear canvas
      ctx.fillStyle = 'rgba(0, 0, 0, 1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Set up 3D perspective
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const spacing = 40;
      const maxLines = 20;
      
      // Draw vertical lines (perspective effect)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      
      for (let i = -maxLines; i <= maxLines; i++) {
        const x = centerX + i * spacing;
        
        // Create perspective effect
        const startY = 0;
        const endY = canvas.height;
        const perspectiveFactor = 0.5;
        
        ctx.beginPath();
        ctx.moveTo(x, startY);
        ctx.lineTo(
          centerX + (x - centerX) * perspectiveFactor, 
          endY
        );
        ctx.stroke();
      }
      
      // Draw horizontal lines (perspective effect)
      for (let i = -maxLines; i <= maxLines; i++) {
        const y = centerY + i * spacing;
        
        // Create perspective effect
        const startX = 0;
        const endX = canvas.width;
        const perspectiveFactor = 0.5;
        
        ctx.beginPath();
        ctx.moveTo(startX, y);
        ctx.lineTo(
          endX, 
          centerY + (y - centerY) * perspectiveFactor
        );
        ctx.stroke();
      }
    }
    
    // Initial draw
    draw3DGrid();
    
    // Redraw on resize
    const handleResize = () => {
      resizeCanvas();
      draw3DGrid();
    };
    
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
    />
  );
};

export default AnimatedBackground;