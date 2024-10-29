(function() {
  const baseUrl = 'https://turterra.vercel.app';
  
  // Define resource paths by section/module
  const PATHS = {
    TURTLE_PROFILE: '/turtle-profile',
    ROOT: ''
  };

  // Define resource types and their corresponding directories
  const resourceMap = {
    turtleProfile: {
      basePath: PATHS.TURTLE_PROFILE,
      css: [
        '/css/components/turtle-profile-hero-slider.css',
        '/css/components/turtle-profile-search-bar.css',
        '/css/sections/turtle-profile-content-at-a-glance.css',
        '/css/sections/turtle-profile-id-section.css',
      ],
      js: [
        '/js/page/fetch-turtle-species.js',
        '/js/components/species-distribution-map.js',
        '/js/components/turtle-profile-hero-slider.js',
        '/js/components/turtle-profile-search-bar.js',
        '/js/components/populate-taxonomy.js',
        '/js/page/init-turtle-profile.js',
        '/js/page/init-breakout-containers.js',
      ]
    },
    global: {
      basePath: PATHS.ROOT,
      css: ['/icons/css/icons.css'],
      js: []
    }
  };

  function createResource(path, type) {
    const element = document.createElement(type === 'css' ? 'link' : 'script');
    
    if (type === 'css') {
      element.rel = 'stylesheet';
      element.href = path;
    } else {
      element.src = path;
    }
    
    return element;
  }

  function loadResource(path, type) {
    return new Promise((resolve, reject) => {
      const element = createResource(path, type);
      element.onload = resolve;
      element.onerror = reject;
      document.head.appendChild(element);
    });
  }

  async function loadResourcesByType(type) {
    const resources = Object.values(resourceMap).flatMap(section => 
      section[type].map(path => baseUrl + section.basePath + path)
    );

    const results = await Promise.allSettled(
      resources.map(path => loadResource(path, type))
    );

    const failed = results
      .filter(result => result.status === 'rejected')
      .map((result, index) => resources[index]);

    if (failed.length > 0) {
      console.error('Failed to load resources:', failed);
    }

    return failed.length === 0;
  }

  async function loadResources() {
    try {
      // Load CSS files first
      const cssLoaded = await loadResourcesByType('css');
      console.log('CSS files loaded:', cssLoaded ? 'successfully' : 'with some failures');

      // Then load JS files
      const jsLoaded = await loadResourcesByType('js');
      console.log('JS files loaded:', jsLoaded ? 'successfully' : 'with some failures');

      // Fetch Supabase data after resources have loaded
      await fetchSupabaseData();
      
    } catch (error) {
      console.error('Error in resource loading:', error);
    }
  }

  // Fetch data from Supabase using the endpoint in server.mjs
  async function fetchSupabaseData() {
    try {
      const response = await fetch(`${baseUrl}/supabase-data`);
      if (!response.ok) throw new Error(`Error fetching Supabase data: ${response.statusText}`);
      
      const data = await response.json();
      console.log('Supabase data:', data);
      
      // Additional code to handle or display Supabase data goes here
      
    } catch (error) {
      console.error('Error fetching Supabase data:', error);
    }
  }

  // Start loading resources and then fetch Supabase data
  loadResources();
})();
