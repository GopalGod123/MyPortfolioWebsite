import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const InteractiveGridContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: -1;
  cursor: crosshair;
`;

const GridTile = styled(motion.div)`
  position: absolute;
  border: 1px solid ${({ theme }) => theme.primary}20;
  background: transparent;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${({ theme }) => theme.primary}15;
    border-color: ${({ theme }) => theme.primary}60;
    box-shadow: 0 0 20px ${({ theme }) => theme.primary}30;
  }
`;

const GlowDot = styled(motion.div)`
  position: absolute;
  width: 4px;
  height: 4px;
  background: ${({ theme }) => theme.primary};
  border-radius: 50%;
  box-shadow: 0 0 10px ${({ theme }) => theme.primary};
`;

const InteractiveAnimatedGrid = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const gridSize = 50;
  const cols = Math.ceil(window.innerWidth / gridSize);
  const rows = Math.ceil(window.innerHeight / gridSize);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const springConfig = { damping: 25, stiffness: 700 };
  useSpring(mouseX, springConfig);
  useSpring(mouseY, springConfig);

  const handleMouseMove = useCallback((e) => {
    const { clientX, clientY } = e;
    setMousePosition({ x: clientX, y: clientY });
    mouseX.set(clientX);
    mouseY.set(clientY);
  }, [mouseX, mouseY]);

  const getDistanceFromMouse = (tileX, tileY) => {
    const dx = mousePosition.x - (tileX + gridSize / 2);
    const dy = mousePosition.y - (tileY + gridSize / 2);
    return Math.sqrt(dx * dx + dy * dy);
  };

  return (
    <InteractiveGridContainer onMouseMove={handleMouseMove}>
      {Array.from({ length: cols * rows }, (_, index) => {
        const col = index % cols;
        const row = Math.floor(index / cols);
        const x = col * gridSize;
        const y = row * gridSize;
        const distance = getDistanceFromMouse(x, y);
        const isNear = distance < 100;

        return (
          <GridTile
            key={index}
            style={{ 
              left: x, 
              top: y, 
              width: gridSize, 
              height: gridSize 
            }}
            animate={{
              scale: isNear ? 1.05 : 1,
              opacity: isNear ? 0.8 : 0.3,
            }}
            transition={{ duration: 0.3 }}
            whileHover={{
              scale: 1.1,
              background: "rgba(34, 197, 94, 0.2)",
            }}
          />
        );
      })}
      
      {/* Floating glow dots */}
      {[...Array(20)].map((_, i) => (
        <GlowDot
          key={i}
          animate={{
            x: [0, Math.random() * window.innerWidth],
            y: [0, Math.random() * window.innerHeight],
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: 8 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "linear",
          }}
        />
      ))}
    </InteractiveGridContainer>
  );
};

export default InteractiveAnimatedGrid;


