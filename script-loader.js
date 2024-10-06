(function() {
  const scripts = [
    'https://turterra.vercel.app/public/physical-features-slider.js',
    'https://turterra.vercel.app/public/distribution-map-script.js'
  ];
  
  scripts.forEach(src => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    document.head.appendChild(script);
  });
})();
