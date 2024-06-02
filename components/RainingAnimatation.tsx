'use client';

import React, { useEffect } from 'react';

import hamburger from '../public/assets/burger_png.png';

const RainingBurgers = () => {
  useEffect(() => {
    // Code to start raining animation
    // You can use CSS animations or JavaScript animation libraries like GSAP
    // For simplicity, I'll use a basic JavaScript animation here

    const animateBurgers = () => {
      const container = document.getElementById('burger-container');
      const numBurgers = 200; // Number of burgers to rain down
      const screenHeight = window.innerHeight;

      // Create and animate burgers
      for (let i = 0; i < numBurgers; i++) {
        const burger = document.createElement('img');
        burger.src = hamburger.src;
        burger.className = 'burger w-14 fixed top-0';
        burger.style.left = Math.random() * 100 + '%';
        burger.style.top = -100 + 'px'; // Start off-screen at the top
        burger.style.transform = `rotate(${Math.random() * 360}deg)`; // Random rotation
        container?.appendChild(burger);

        setTimeout(() => {
          // Add transition for smooth animation
          // burger.style.top = screenHeight - 50 + 'px'; // Adjust the final position
        }, Math.random() * 1000); // Adjust the duration for more or less time

        setTimeout(() => {
          burger.style.transition = 'top ease-in 1.5s, opacity 8s';
          burger.style.top = screenHeight + 'px';
          burger.style.opacity = '0';
          // burger.style.transition = 'top 2s, opacity 2s'; // Add transition for smooth animation
        }, Math.random() * 1000); // Adjust the duration for more or less time
      }
    };

    animateBurgers();

    // Cleanup function
    return () => {
      // Clear the raining burgers
      const container = document.getElementById('burger-container');
      if (container) container.innerHTML = '';
    };
  }, []);

  return (
    <div
      id='burger-container'
      className='fixed top-0 left-0 w-full h-full z-50'
    ></div>
  );
};

export default RainingBurgers;
