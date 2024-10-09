(function() {
  const scripts = [
    'https://turterra.vercel.app/fetch-turtle-species.js',
    'https://turterra.vercel.app/physical-features-slider.js',
    'https://turterra.vercel.app/distribution-map-script.js',
    'https://turterra.vercel.app/turtle-profile-hero-slider.js'
  ];
  
  scripts.forEach(src => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    document.head.appendChild(script);
  });
})();
