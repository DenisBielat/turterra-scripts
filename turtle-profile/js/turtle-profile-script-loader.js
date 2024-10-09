(function() {
  const baseUrl = 'https://turterra.vercel.app/turtle-profile';

  const resources = {
    css: [
      '/css/page/turtle-profile-layout.css',
    ],
    js: [
      '/js/page/fetch-turtle-species.js',
      '/js/components/turtle-profile-slider.js',
      '/js/components/distribution-map-script.js',
      '/js/components/turtle-profile-hero-slider.js'
    ]
  };
  
  scripts.forEach(src => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    document.head.appendChild(script);
  });
})();
