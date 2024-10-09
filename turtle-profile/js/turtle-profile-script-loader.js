(function() {
  const baseUrl = 'https://turterra.vercel.app/turtle-profile';
  const resources = {
    css: [
      '/css/components/turtle-profile-hero-slider.css',
      '/css/components/turtle-profile-search-bar.css',
    ],
    js: [
      '/js/page/fetch-turtle-species.js',
      '/js/components/physical-features-slider.js',
      '/js/components/species-distribution-map.js',
      '/js/components/turtle-profile-hero-slider.js',
      '/js/components/turtle-profile-search-bar.js',
      '/js/components/populate-taxonomy.js',
      '/js/init-turtle-profile.js',
    ]
  };
  
  function loadResource(url, type) {
    return new Promise((resolve, reject) => {
      let element;
      if (type === 'css') {
        element = document.createElement('link');
        element.rel = 'stylesheet';
        element.href = baseUrl + url;
      } else if (type === 'js') {
        element = document.createElement('script');
        element.src = baseUrl + url;
      }
      element.onload = resolve;
      element.onerror = reject;
      document.head.appendChild(element);
    });
  }

  async function loadResources() {
    try {
      // Load CSS files first
      for (const cssFile of resources.css) {
        await loadResource(cssFile, 'css');
      }
      console.log('All CSS files loaded successfully');

      // Then load JS files
      for (const jsFile of resources.js) {
        await loadResource(jsFile, 'js');
      }
      console.log('All JS files loaded successfully');

    } catch (error) {
      console.error('Error loading resources:', error);
    }
  }

  // Start loading resources
  loadResources();
})();
