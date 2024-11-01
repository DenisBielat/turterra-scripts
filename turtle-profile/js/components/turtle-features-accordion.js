// turtle-features-accordion.js
(function() {
  let initialized = false;
  let initializing = false;
  let speciesId = null;
  let categoryImages = new Map();

  function toCategoryTag(category) {
    return category
      .toLowerCase()
      .replace(/\//, '-and-')
      .replace(/\s+/g, '-');
  }

  function toSnakeCase(str) {
    return str
      .toLowerCase()
      .replace(/\//g, '_')
      .replace(/\s+/g, '_');
  }

  function capitalizeValue(value) {
    if (!value || value === 'N/A') return value;
    return value
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  function formatFeatureValue(value) {
    if (!value) return 'N/A';
    if (Array.isArray(value)) {
      return value
        .map(item => capitalizeValue(item.toString()))
        .join(', ');
    }
    return capitalizeValue(value.toString());
  }

  async function loadCategoryImages() {
    // Wait for turtle data to be available
    if (!window.currentTurtleCommonName) {
      return new Promise((resolve) => {
        document.addEventListener('turtleDataLoaded', async () => {
          if (window.currentTurtleCommonName) {
            await fetchCategoryImages();
            resolve();
          }
        });
      });
    } else {
      return fetchCategoryImages();
    }
  }

  async function fetchCategoryImages() {
    const encodedCommonName = encodeURIComponent(window.currentTurtleCommonName);
    try {
      const baseUrl = window.baseUrl || 'https://turterra.vercel.app';
      const response = await fetch(`${baseUrl}/cloudinary/${encodedCommonName}/physical-features`);
      if (!response.ok) return;
      
      const images = await response.json();
      categoryImages.clear();
      
      images.forEach(image => {
        if (image.tags && image.tags.length > 0) {
          image.tags.forEach(tag => {
            if (!categoryImages.has(tag)) {
              categoryImages.set(tag, []);
            }
            categoryImages.get(tag).push({
              url: image.secure_url,
              credits: image.metadata.credits_basic
            });
          });
        }
      });
    } catch (error) {
      // Silent fail - we'll just not show images if they're not available
    }
  }

  async function createAccordion(container, data) {
    data.categories.forEach((category, categoryIndex) => {
      const categoryTag = toCategoryTag(category.name);
      console.log('Looking for images for category:', {
        category: category.name,
        tag: categoryTag,
        hasImages: categoryImages.has(categoryTag),
        imagesAvailable: categoryImages.get(categoryTag)
      });

      const section = document.createElement('div');
      section.className = 'accordion-section';
      
      // Create image container
      const imageContainer = document.createElement('div');
      imageContainer.className = 'category-image-container';
      imageContainer.style.display = 'none';
      
      if (categoryImages.has(categoryTag)) {
        const images = categoryImages.get(categoryTag);
        console.log(`Adding ${images.length} images for category ${category.name}`);
        
        images.forEach(image => {
          const imgWrapper = document.createElement('div');
          imgWrapper.className = 'category-image-wrapper';

          const img = document.createElement('img');
          img.src = image.url;
          img.alt = `${category.name} feature`;
          img.className = 'category-feature-image';
          
          // Add load event listener to verify image loading
          img.addEventListener('load', () => {
            console.log(`Image loaded successfully for ${category.name}:`, image.url);
          });
          
          img.addEventListener('error', (e) => {
            console.error(`Image failed to load for ${category.name}:`, image.url, e);
          });

          imgWrapper.appendChild(img);

          if (image.credits) {
            const credits = document.createElement('div');
            credits.className = 'category-image-credits';
            credits.textContent = `Photo: ${image.credits}`;
            imgWrapper.appendChild(credits);
          }

          imageContainer.appendChild(imgWrapper);
        });
      } else {
        console.log(`No images found for category ${category.name} with tag ${categoryTag}`);
      }
      
      section.appendChild(imageContainer);
      
      const header = document.createElement('button');
      header.className = 'accordion-header';
      header.innerHTML = `
        <span class="accordion-title">${category.name}</span>
        <svg class="accordion-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      `;
      
      const content = document.createElement('div');
      content.className = 'accordion-content';
      
      if (categoryIndex === 0) {
        content.classList.add('open');
        header.querySelector('.accordion-icon').classList.add('open');
        imageContainer.style.display = 'block';
      }
      
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
          const featureRow = document.createElement('div');
          featureRow.className = `feature-row main-feature ${index > 0 ? 'divider' : ''}`;
          featureRow.innerHTML = `
            <div class="feature-name">${feature.name}</div>
            <div class="feature-value">${feature.value}</div>
          `;
          content.appendChild(featureRow);
          
          feature.subFeatures.forEach(subFeature => {
            const subFeatureRow = document.createElement('div');
            subFeatureRow.className = 'feature-row sub-feature divider';
            subFeatureRow.innerHTML = `
              <div class="feature-name icon-before icon-ui-line-move-back">
                ${subFeature.name}
              </div>
              <div class="feature-value">${subFeature.value}</div>
            `;
            content.appendChild(subFeatureRow);
          });
        });
      }
      
      header.addEventListener('click', () => {
        const isOpen = content.classList.contains('open');
        const icon = header.querySelector('.accordion-icon');
        
        document.querySelectorAll('.accordion-content').forEach(el => {
          el.classList.remove('open');
        });
        document.querySelectorAll('.accordion-icon').forEach(el => {
          el.classList.remove('open');
        });
        document.querySelectorAll('.category-image-container').forEach(el => {
          el.style.display = 'none';
        });
        
        if (!isOpen) {
          content.classList.add('open');
          icon.classList.add('open');
          imageContainer.style.display = 'block';
        }
      });
      
      section.appendChild(header);
      section.appendChild(content);
      container.appendChild(section);
    });
  }

   async function getSpeciesId(slug) {
    try {
      const baseUrl = window.baseUrl || 'https://turterra.vercel.app';
      const response = await fetch(`${baseUrl}/supabase/species/${slug}`);
      if (!response.ok) throw new Error('Failed to fetch species ID');
      const data = await response.json();
      return data.id;
    } catch (error) {
      console.error('Error fetching species ID:', error);
      return null;
    }
  }

  async function initTurtleFeaturesAccordion() {
    // Prevent multiple concurrent initializations
    if (initialized || initializing) return;
    
    // Set initializing flag
    initializing = true;

    const container = document.getElementById('turtle-features');
    if (!container) {
      initializing = false;
      return;
    }

    try {
      container.innerHTML = '';
      
      const baseUrl = window.baseUrl || 'https://turterra.vercel.app';
      
      // Get the current slug from the URL
      const slug = window.location.pathname.split('/').pop();
      
      // Get the species ID using the slug
      speciesId = await getSpeciesId(slug);
      if (!speciesId) throw new Error('Species ID not found');
      
      // Wait for category images to be loaded
      await loadCategoryImages();
      
      const [response, featureKeysResponse] = await Promise.all([
        fetch(`${baseUrl}/supabase/data`),
        fetch(`${baseUrl}/supabase/feature-keys`)
      ]);

      if (!response.ok || !featureKeysResponse.ok) {
        throw new Error('Failed to fetch data');
      }

      const [rawData, featureKeys] = await Promise.all([
        response.json(),
        featureKeysResponse.json()
      ]);

      const speciesFeatures = rawData.find(item => Number(item.species_id) === Number(speciesId));
      if (!speciesFeatures) throw new Error('Species not found');

      // ... (rest of the function remains the same)
    } catch (error) {
      container.innerHTML = `
        <div class="accordion-section">
          <div class="accordion-header">
            <span class="accordion-title">Error Loading Features</span>
          </div>
          <div class="accordion-content open">
            <div class="feature-row main-feature">
              <div class="feature-name">
                There was an error loading the turtle features. Please try again later.
              </div>
            </div>
          </div>
        </div>
      `;
    } finally {
      initializing = false;
    }
  }
  
  // Create a single initialization function that handles all cases
  function initialize() {
    if (window.currentTurtleCommonName) {
      // If we already have the turtle data, initialize immediately
      initTurtleFeaturesAccordion();
    } else {
      // If we don't have turtle data yet, wait for it
      const initHandler = () => {
        if (window.currentTurtleCommonName) {
          document.removeEventListener('turtleDataLoaded', initHandler);
          initTurtleFeaturesAccordion();
        }
      };
      document.addEventListener('turtleDataLoaded', initHandler);
    }
  }

  // Only set up a single initialization trigger
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
  } else {
    initialize();
  }

  // Export the initialization function, but make it safe to call multiple times
  window.initTurtleFeaturesAccordion = function() {
    if (!initialized) {
      initialize();
    }
  };
})();
