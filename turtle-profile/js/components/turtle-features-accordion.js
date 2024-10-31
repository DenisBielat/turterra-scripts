// turtle-features-accordion.js
(function() {
  // Component state
  let initialized = false;
  const SPECIES_ID = '1'; // Hard-coded species ID

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
      
      // Fetch data using hard-coded species ID
      const response = await fetch(`${baseUrl}/api/species/${SPECIES_ID}/features`);
      if (!response.ok) throw new Error('Failed to fetch turtle features');
      const data = await response.json();
      
      // Clear loading state
      container.innerHTML = '';
      
      // Handle empty data
      if (!data.categories || data.categories.length === 0) {
        await showErrorState(container, 'No physical features are available for this species.');
        return;
      }
      
      // Create the accordion with the data
      await createAccordion(container, data);
      
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
