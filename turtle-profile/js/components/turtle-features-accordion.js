// turtle-features-accordion.js
(function() {
  // Component state
  let initialized = false;
  const SPECIES_ID = 1;

  // Default feature keys structure based on your exact CSV
  const DEFAULT_FEATURE_KEYS = [
    {
      id: 1,
      physical_feature: "Head/Neck Pattern",
      category: "Head/Neck",
      parent_feature: null
    },
    {
      id: 2,
      physical_feature: "Head/Neck Pattern Color",
      category: "Head/Neck",
      parent_feature: 1
    },
    {
      id: 3,
      physical_feature: "Shell Top Pattern",
      category: "Shell Top",
      parent_feature: null
    },
    {
      id: 4,
      physical_feature: "Shell Top Texture",
      category: "Shell Top",
      parent_feature: null
    },
    {
      id: 5,
      physical_feature: "Skin Color",
      category: "Skin/Limbs",
      parent_feature: null
    },
    {
      id: 6,
      physical_feature: "Skin Pattern",
      category: "Skin/Limbs",
      parent_feature: null
    },
    {
      id: 7,
      physical_feature: "Skin Pattern Color",
      category: "Skin/Limbs",
      parent_feature: 6
    },
    {
      id: 8,
      physical_feature: "Shell Top Vertebral Keel",
      category: "Shell Top",
      parent_feature: null
    },
    {
      id: 9,
      physical_feature: "Shell Bottom Scute Number",
      category: "Shell Bottom",
      parent_feature: null
    },
    {
      id: 10,
      physical_feature: "Ear Color",
      category: "Head/Neck",
      parent_feature: null
    },
    {
      id: 11,
      physical_feature: "Eye Color",
      category: "Head/Neck",
      parent_feature: null
    },
    {
      id: 12,
      physical_feature: "Eye Pattern",
      category: "Head/Neck",
      parent_feature: null
    },
    {
      id: 13,
      physical_feature: "Neck Texture",
      category: "Head/Neck",
      parent_feature: null
    },
    {
      id: 14,
      physical_feature: "Chin Barbels Present",
      category: "Head/Neck",
      parent_feature: null
    },
    {
      id: 15,
      physical_feature: "Chin Barbels Size",
      category: "Head/Neck",
      parent_feature: 14
    }
  ];

  // Helper function to convert Title Case to snake_case for data lookup
  function toSnakeCase(str) {
    return str
      .toLowerCase()
      .replace(/\//g, '_')
      .replace(/\s+/g, '_');
  }

  // Transform raw Supabase data into the accordion structure
  function transformData(rawData, featureKeys) {
    console.log('Transforming data with:', { rawData, featureKeys });
    
    // Create a map to store categories
    const categories = new Map();
    
    // First, create all main categories from the feature keys
    featureKeys.forEach(key => {
      if (!categories.has(key.category)) {
        categories.set(key.category, {
          name: key.category,
          features: []
        });
      }
    });

    // Then, add features to their categories
    featureKeys.forEach(key => {
      // Skip sub-features for now
      if (key.parent_feature) return;

      // Convert the feature name to snake_case for data lookup
      const dataKey = toSnakeCase(key.physical_feature);
      console.log(`Looking up data for "${key.physical_feature}" using key "${dataKey}"`);

      const feature = {
        name: key.physical_feature, // Keep original Title Case for display
        value: rawData[dataKey] || 'N/A',
        subFeatures: []
      };

      // Find and add any sub-features
      const subFeatures = featureKeys.filter(k => k.parent_feature === key.id);
      subFeatures.forEach(sub => {
        const subFeatureDataKey = toSnakeCase(sub.physical_feature);
        const subFeatureValue = rawData[subFeatureDataKey];
        
        // Handle array values (like colors)
        const displayValue = Array.isArray(subFeatureValue) 
          ? subFeatureValue.join(', ')
          : subFeatureValue || 'N/A';

        feature.subFeatures.push({
          name: sub.physical_feature, // Keep original Title Case for display
          value: displayValue
        });
      });

      if (categories.has(key.category)) {
        categories.get(key.category).features.push(feature);
      }
    });

    const result = {
      categories: Array.from(categories.values())
    };
    
    console.log('Transformed data:', result);
    return result;
  }

  async function createAccordion(container, data) {
    data.categories.forEach((category, categoryIndex) => {
      const section = document.createElement('div');
      section.className = 'accordion-section';
      
      // Create header
      const header = document.createElement('button');
      header.className = 'accordion-header';
      header.innerHTML = `
        <span class="accordion-title">${category.name}</span>
        <svg class="accordion-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      `;
      
      // Create content
      const content = document.createElement('div');
      content.className = 'accordion-content';
      
      // Open first section by default
      if (categoryIndex === 0) {
        content.classList.add('open');
        header.querySelector('.accordion-icon').classList.add('open');
      }
      
      // Add features
      if (category.features.length === 0) {
        const emptyRow = document.createElement('div');
        emptyRow.className = 'feature-row main-feature';
        emptyRow.innerHTML = `
          <div class="feature-name">No features available in this category</div>
          <div class="feature-value">-</div>
        `;
        content.appendChild(emptyRow);
      } else {
        category.features.forEach((feature, index) => {
          // Add main feature
          const featureRow = document.createElement('div');
          featureRow.className = `feature-row main-feature ${index > 0 ? 'divider' : ''}`;
          featureRow.innerHTML = `
            <div class="feature-name">${feature.name}</div>
            <div class="feature-value">${feature.value || '-'}</div>
          `;
          content.appendChild(featureRow);
          
          // Add sub-features
          feature.subFeatures.forEach(subFeature => {
            const subFeatureRow = document.createElement('div');
            subFeatureRow.className = 'feature-row sub-feature divider';
            subFeatureRow.innerHTML = `
              <div class="feature-name icon-before icon-ui-line-move-back">
                ${subFeature.name}
              </div>
              <div class="feature-value">${subFeature.value || '-'}</div>
            `;
            content.appendChild(subFeatureRow);
          });
        });
      }
      
      // Add click handler
      header.addEventListener('click', () => {
        const isOpen = content.classList.contains('open');
        const icon = header.querySelector('.accordion-icon');
        
        // Close all other sections
        document.querySelectorAll('.accordion-content').forEach(el => {
          el.classList.remove('open');
        });
        document.querySelectorAll('.accordion-icon').forEach(el => {
          el.classList.remove('open');
        });
        
        // Toggle current section
        if (!isOpen) {
          content.classList.add('open');
          icon.classList.add('open');
        }
      });
      
      section.appendChild(header);
      section.appendChild(content);
      container.appendChild(section);
    });
  }

  async function showLoadingState(container) {
    const loadingSection = document.createElement('div');
    loadingSection.className = 'accordion-section';
    loadingSection.innerHTML = `
      <div class="accordion-header">
        <span class="accordion-title">Loading Features...</span>
      </div>
      <div class="accordion-content open">
        <div class="feature-row main-feature">
          <div class="feature-name">Please wait while we load the turtle features...</div>
        </div>
      </div>
    `;
    container.appendChild(loadingSection);
  }

  async function showErrorState(container, message) {
    container.innerHTML = '';
    const errorSection = document.createElement('div');
    errorSection.className = 'accordion-section';
    errorSection.innerHTML = `
      <div class="accordion-header">
        <span class="accordion-title">Error Loading Features</span>
      </div>
      <div class="accordion-content open">
        <div class="feature-row main-feature">
          <div class="feature-name">${message}</div>
        </div>
      </div>
    `;
    container.appendChild(errorSection);
  }

  async function initTurtleFeaturesAccordion() {
    // Prevent multiple initializations
    if (initialized) {
      console.warn('Turtle features accordion already initialized');
      return;
    }

    const container = document.getElementById('turtle-features');
    if (!container) {
      console.error('Turtle features container not found');
      return;
    }

    try {
      // Clear existing content
      container.innerHTML = '';
      await showLoadingState(container);
      
      // Get the base URL from the global scope if it exists
      const baseUrl = window.baseUrl || 'https://turterra.vercel.app';
      
      // Fetch data using your existing endpoint
      const response = await fetch(`${baseUrl}/supabase/data`);
      if (!response.ok) throw new Error('Failed to fetch turtle features');
      const rawData = await response.json();
      
      // Debug log to see what data we're getting
      console.log('Raw data from Supabase:', rawData);

      // Find the features data for our species, converting both to numbers for comparison
      const speciesFeatures = rawData.find(item => Number(item.species_id) === Number(SPECIES_ID));
      
      // Debug log for the found species
      console.log('Looking for species_id:', SPECIES_ID);
      console.log('Found species features:', speciesFeatures);

      if (!speciesFeatures) {
        throw new Error(`Species with ID ${SPECIES_ID} not found in data: ${JSON.stringify(rawData.map(item => item.species_id))}`);
      }

      // Get the feature keys structure
      const featureKeysResponse = await fetch(`${baseUrl}/supabase/feature-keys`);
      if (!featureKeysResponse.ok) throw new Error('Failed to fetch feature keys');
      const featureKeys = await featureKeysResponse.json();
      
      // Debug log for feature keys
      console.log('Feature keys:', featureKeys);

      // Transform the data into our accordion structure
      const transformedData = transformData(speciesFeatures, featureKeys);
      
      // Debug log for transformed data
      console.log('Transformed data:', transformedData);

      // Clear loading state
      container.innerHTML = '';
      
      // Handle empty data
      if (!transformedData.categories || transformedData.categories.length === 0) {
        await showErrorState(container, 'No physical features are available for this species.');
        return;
      }
      
      // Create the accordion with the transformed data
      await createAccordion(container, transformedData);
      
      // Mark as initialized
      initialized = true;
      console.log('Turtle features accordion initialized successfully');
      
    } catch (error) {
      console.error('Error initializing turtle features accordion:', error);
      await showErrorState(container, 'There was an error loading the turtle features. Please try again later.');
    }
  }

  // Export the initialization function
  window.initTurtleFeaturesAccordion = initTurtleFeaturesAccordion;
})();
