"use strict";
import * as Simulation from "./simulation.js";

// Wait for DOMContentLoaded to ensure all elements exist.
document.addEventListener("DOMContentLoaded", () => {
  // Tab functionality for element categories
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Remove active from all tab buttons
      tabButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      // Switch visible content
      const category = button.getAttribute('data-category');
      tabContents.forEach(content => {
        if (content.getAttribute('data-category') === category) {
          content.classList.add('active');
        } else {
          content.classList.remove('active');
        }
      });
    });
  });

  // When clicking a palette button, update the current element.
  const palette = document.getElementById('palette');
  const paletteButtons = palette.querySelectorAll('.element-button');
  paletteButtons.forEach(button => {
    button.addEventListener('click', () => {
      paletteButtons.forEach(btn => btn.classList.remove('selected'));
      button.classList.add('selected');
      Simulation.setCurrentElement(parseInt(button.getAttribute('data-element'), 10));
    });
    
    // Touch event handling for mobile.
    button.addEventListener('touchstart', (e) => {
      e.preventDefault();
      paletteButtons.forEach(btn => btn.classList.remove('selected'));
      button.classList.add('selected');
      Simulation.setCurrentElement(parseInt(button.getAttribute('data-element'), 10));
    });
  });
  
  // Reset button clears the grid.
  const resetButton = document.getElementById('reset-button');
  if (resetButton) {
    resetButton.addEventListener('click', () => {
      Simulation.clearGrid();
    });
  }
  
  // Thickness slider updates brush radius
  const thicknessSlider = document.getElementById('thickness-slider');
  if(thicknessSlider){
    thicknessSlider.addEventListener('input', (e) => {
      Simulation.setBrushRadius(parseInt(e.target.value, 10));
    });
    // Initialize with default thickness
    Simulation.setBrushRadius(parseInt(thicknessSlider.value, 10));
  }

  // Hover info for simulation canvas
  const hoverInfo = document.createElement('div');
  hoverInfo.id = 'hover-info';
  document.body.appendChild(hoverInfo);
  const canvas = document.getElementById('canvas');
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const gridX = Math.floor(x / Simulation.cellSize);
    const gridY = Math.floor(y / Simulation.cellSize);
    const type = Simulation.grid[gridY]?.[gridX];
    const name = Simulation.elementNames[type];
    if (name) {
      hoverInfo.textContent = name;
      hoverInfo.style.display = 'block';
    } else {
      hoverInfo.style.display = 'none';
    }
    hoverInfo.style.left = `${e.clientX + 10}px`;
    hoverInfo.style.top = `${e.clientY + 10}px`;
  });
  canvas.addEventListener('mouseleave', () => {
    hoverInfo.style.display = 'none';
  });
});