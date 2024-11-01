// turtle-features-accordion.js
(function() {
  let initialized = false;
  const SPECIES_ID = 1;
  let categoryImages = new Map();

  // Helper function to convert Title Case to snake_case for data lookup
  function toSnakeCase(str) {
    return str
      .toLowerCase()
      .replace(/\//g, '_')
      .replace(/\s+/g, '_');
  }

  // Helper function to capitalize the first letter of each word
  function capitalizeValue(value) {
    if (!value || value === 'N/A') return value;
    return value
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  // Helper function to format feature values
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
    if (!window.currentTurtleCommonName) return;

    const encodedCommonName = encodeURIComponent(window.currentTurtleCommonName);
    try {
      const response = await fetch(`https://turterra.vercel.app/cloudinary/${encodedCommonName}/physical-features`);
      if (!response.ok) throw new Error('Failed to fetch images');
      
      const images = await response.json();
      
      // Create a map of category to image URL
      images.forEach(image => {
        if (image.tags) {
          image.tags.forEach(tag => {
            if (!categoryImages.has(tag)) {
              categoryImages.set(tag, []);
            }
            categoryImages.get(tag).push(image.public_id);
          });
        }
      });
    } catch (error) {
      // Silently fail - we'll just not show images if they're not available
    }
  }

  async function createAccordion(container, data) {
    data.categories.forEach((category, categoryIndex) => {
      const section = document.createElement('div');
      section.className = 'accordion-section';
      
      // Create image container for this category
      const imageContainer = document.createElement('div');
      imageContainer.className = 'category-image-container';
      imageContainer.style.display = 'none';
      
      // If we have images for this category, add them
      const categoryTag = toSnakeCase(category.name);
      if (categoryImages.has(categoryTag)) {
        const images = categoryImages.get(categoryTag);
        images.forEach(publicId => {
          const img = document.createElement('img');
          img.src = `https://res.cloudinary.com/your-cloud-name/image/upload/${publicId}`; // Replace with your cloud name
          img.alt = `${category.name} feature`;
          img.className = 'category-feature-image';
          imageContainer.appendChild(img);
        });
      }
      
      section.appendChild(imageContainer);
      
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
        imageContainer.style.display = 'block';
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
      
      // Add click handler
      header.addEventListener('click', () => {
        const isOpen = content.classList.contains('open');
        const icon = header.querySelector('.accordion-icon');
        
        // Close all other sections and hide their images
        document.querySelectorAll('.accordion-content').forEach(el => {
          el.classList.remove('open');
        });
        document.querySelectorAll('.accordion-icon').forEach(el => {
          el.classList.remove('open');
        });
        document.querySelectorAll('.category-image-container').forEach(el => {
          el.style.display = 'none';
        });
        
        // Toggle current section
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

  async function initTurtleFeaturesAccordion() {
    if (initialized) return;

    const container = document.getElementById('turtle-features');
    if (!container) return;

    try {
      container.innerHTML = '';
      
      const baseUrl = window.baseUrl || 'https://turterra.vercel.app';
      
      // Load images first
      await loadCategoryImages();
      
      // Fetch feature data
      const response = await fetch(`${baseUrl}/supabase/data`);
      if (!response.ok) throw new Error('Failed to fetch turtle features');
      const rawData = await response.json();

      const speciesFeatures = rawData.find(item => Number(item.species_id) === Number(SPECIES_ID));
      if (!speciesFeatures) throw new Error('Species not found');

      // Fetch feature keys
      const featureKeysResponse = await fetch(`${baseUrl}/supabase/feature-keys`);
      if (!featureKeysResponse.ok) throw new Error('Failed to fetch feature keys');
      const featureKeys = await featureKeysResponse.json();
      
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
                value: formatFeatureValue(speciesFeatures[toSnakeCase(key.physical_feature)]),
                subFeatures: featureKeys
                  .filter(k => k.parent_feature === key.id)
                  .map(sub => ({
                    name: sub.physical_feature,
                    value: formatFeatureValue(speciesFeatures[toSnakeCase(sub.physical_feature)])
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
                There was an error loading the turtle features. Please try again later.
              </div>
            </div>
          </div>
        </div>
      `;
    }
  }

  window.initTurtleFeaturesAccordion = initTurtleFeaturesAccordion;
})();
