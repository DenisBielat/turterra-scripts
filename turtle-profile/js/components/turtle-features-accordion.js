// turtle-features-accordion.js
(function() {
  let initialized = false;
  let initializing = false;
  let categoryImages = new Map();
  let currentVariant = null;
  let allVariants = null;

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
    if (!window.currentTurtleCommonName) {
      return new Promise((resolve) => {
        document.addEventListener('turtleDataLoaded', async () => {
          if (window.currentTurtleCommonName) {
            await fetchCategoryImages();
            resolve();
          }
        });
      });
    }
    return fetchCategoryImages();
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
        if (image.tags?.length > 0) {
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
    
    const section = document.createElement('div');
    section.className = 'accordion-section';
    section.id = `feature-${categoryTag}`;
    
    const header = document.createElement('button');
    header.className = 'accordion-header';
    header.setAttribute('aria-expanded', categoryIndex === 0 ? 'true' : 'false');
    header.setAttribute('aria-controls', `content-${categoryTag}`);
    header.innerHTML = `
      <span class="accordion-title">${category.name}</span>
      <svg class="accordion-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    `;

    // Create image container
    const imageContainer = document.createElement('div');
    imageContainer.className = 'category-image-container';
    
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
    
    const content = document.createElement('div');
    content.className = 'accordion-content';
    content.id = `content-${categoryTag}`;

    // Add header row for features table
    const headerRow = document.createElement('div');
    headerRow.className = 'feature-row feature-header';
    headerRow.innerHTML = `
      <div class="feature-header-text">Feature</div>
      <div class="feature-header-text">Value</div>
    `;
    content.appendChild(headerRow);

    // Create animated content wrapper
    const animatedContent = document.createElement('div');
    animatedContent.className = 'accordion-animated-content';
    
    // Properly nest elements
    section.appendChild(header);
    animatedContent.appendChild(imageContainer);
    animatedContent.appendChild(content);
    section.appendChild(animatedContent);

    // Set initial state
    if (categoryIndex === 0) {
      setTimeout(() => {
        content.classList.add('open');
        header.querySelector('.accordion-icon').classList.add('open');
        imageContainer.classList.add('visible');
      }, 0);
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
      let previousWasSubFeature = false;
      
      category.features.forEach((feature, index) => {
        // Create a group container for each main feature and its sub-features
        const featureGroup = document.createElement('div');
        featureGroup.className = 'feature-group';
        
        const featureRow = document.createElement('div');
        featureRow.className = 'feature-row main-feature';
        
        if (index > 0 || previousWasSubFeature) {
          featureRow.classList.add('with-border');
        }
        
        featureRow.innerHTML = `
          <div class="feature-name">${feature.name}</div>
          <div class="feature-value">${feature.value}</div>
        `;
        featureGroup.appendChild(featureRow);
        
        previousWasSubFeature = false;
        
        feature.subFeatures.forEach((subFeature, subIndex) => {
          const subFeatureRow = document.createElement('div');
          subFeatureRow.className = 'feature-row sub-feature';
          subFeatureRow.innerHTML = `
            <div class="feature-name icon-before icon-ui-filled-flow-arrow-1">
              ${subFeature.name}
            </div>
            <div class="feature-value">${subFeature.value}</div>
          `;
          featureGroup.appendChild(subFeatureRow);
          previousWasSubFeature = true;
        });
        
        content.appendChild(featureGroup);
      });
    }
    
    header.addEventListener('click', (e) => {
      e.preventDefault();
      const isOpen = content.classList.contains('open');
      const icon = header.querySelector('.accordion-icon');
      
      // First, get the current section's position relative to its parent
      const sectionRect = section.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const relativePosition = sectionRect.top - containerRect.top;
      
      // Close all sections
      document.querySelectorAll('.accordion-content').forEach(el => {
        el.classList.remove('open');
        el.parentElement.querySelector('.accordion-header')?.setAttribute('aria-expanded', 'false');
      });
      document.querySelectorAll('.accordion-icon').forEach(el => {
        el.classList.remove('open');
      });
      document.querySelectorAll('.category-image-container').forEach(el => {
        el.classList.remove('visible');
      });
      
      // Toggle clicked section
      if (!isOpen) {
        content.classList.add('open');
        icon.classList.add('open');
        imageContainer.classList.add('visible');
        header.setAttribute('aria-expanded', 'true');
        
        // Calculate the final scroll position
        const headerOffset = 20; // Adjust this value as needed
        const containerTop = container.getBoundingClientRect().top + window.pageYOffset;
        const scrollPosition = containerTop + relativePosition - headerOffset;
        
        window.scrollTo({
          top: scrollPosition,
          behavior: 'smooth'
        });
        
        // Update URL
        history.pushState(null, '', `#feature-${categoryTag}`);
      } else {
        // Remove hash from URL when closing
        history.pushState(null, '', window.location.pathname);
      }
    });
    
    container.appendChild(section);
  });
  
  // Handle direct link to a section
  if (window.location.hash) {
    const sectionId = window.location.hash.substring(1);
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
      const header = targetSection.querySelector('.accordion-header');
      header?.click();
    }
  }
}

    async function initTurtleFeaturesAccordion() {
    if (initialized || initializing) return;
    initializing = true;

    const container = document.getElementById('turtle-features');
    if (!container) {
      initializing = false;
      return;
    }

    try {
      container.innerHTML = '';
      const baseUrl = window.baseUrl || 'https://turterra.vercel.app';
      
      if (!window.currentSpeciesId) {
        throw new Error('Species ID not available');
      }

      // Load category images and feature keys in parallel
      const [featureKeysResponse] = await Promise.all([
        fetch(`${baseUrl}/supabase/feature-keys`),
        loadCategoryImages()
      ]);

      if (!featureKeysResponse.ok) {
        throw new Error('Failed to fetch feature keys');
      }

      // Get feature keys
      const featureKeys = await featureKeysResponse.json();

      // Fetch physical features with all variants
      const featuresResponse = await fetch(`${baseUrl}/supabase/data/${window.currentSpeciesId}`);
      if (!featuresResponse.ok) {
        throw new Error('Failed to fetch physical features');
      }

      const { defaultVariant, allVariants: variants } = await featuresResponse.json();
      
      // Store the variants for potential future use
      currentVariant = defaultVariant;
      allVariants = variants;

      const transformedData = {
        categories: Array.from(new Map(
          featureKeys.reduce((acc, key) => {
            if (!key.parent_feature) {
              if (!acc.has(key.category)) {
                acc.set(key.category, {
                  name: key.category,
                  features: []
                });
              }
              const feature = {
                name: key.physical_feature,
                value: formatFeatureValue(currentVariant[toSnakeCase(key.physical_feature)]),
                subFeatures: featureKeys
                  .filter(k => k.parent_feature === key.id)
                  .map(sub => ({
                    name: sub.physical_feature,
                    value: formatFeatureValue(currentVariant[toSnakeCase(sub.physical_feature)])
                  }))
              };
              acc.get(key.category).features.push(feature);
            }
            return acc;
          }, new Map())
        ).values())
      };

      await createAccordion(container, transformedData);
      initialized = true;

    } catch (error) {
      container.innerHTML = `
        <div class="accordion-section">
          <div class="accordion-header">
            <span class="accordion-title">Error Loading Features</span>
          </div>
          <div class="accordion-content open">
            <div class="feature-row main-feature">
              <div class="feature-name">
                Unable to load turtle features. Please try again later.
              </div>
            </div>
          </div>
        </div>
      `;
    } finally {
      initializing = false;
    }
  }

  function initialize() {
    if (window.currentTurtleCommonName && window.currentSpeciesId) {
      initTurtleFeaturesAccordion();
    } else {
      const initHandler = () => {
        if (window.currentTurtleCommonName && window.currentSpeciesId) {
          document.removeEventListener('turtleDataLoaded', initHandler);
          initTurtleFeaturesAccordion();
        }
      };
      document.addEventListener('turtleDataLoaded', initHandler);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
  } else {
    initialize();
  }

  window.initTurtleFeaturesAccordion = function() {
    if (!initialized) {
      initialize();
    }
  };
})();
