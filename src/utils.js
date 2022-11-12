mod = (n, m) => ((n % m) + m) % m;

createAnimationFPSThrottler = () => {
  let lastRenderTime = window.performance.now();
  const frameDuration = 1000 / 60;
  return {
    requestAnimationFrame: (renderer) => {
      const buffer = Math.max(
        0,
        frameDuration - (window.performance.now() - lastRenderTime)
      );
      let animate = () => {
        lastRenderTime = window.performance.now();
        renderer();
      };
      setTimeout(() => requestAnimationFrame(animate), buffer);
    },
  };
};
