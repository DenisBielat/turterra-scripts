// turtle-features-accordion.js
async function initTurtleFeaturesAccordion() {
  console.log('Initializing turtle features accordion...');
  
  const container = document.getElementById('turtle-features');
  // Hard-coded species ID - you can change this value as needed
  const SPECIES_ID = '1';
  
  if (!container) {
    console.error('Turtle features container not found!');
    return;
  }

  try {
    // Clear existing content
    container.innerHTML = '';
    
    // Show loading state with proper styling
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
    
    // Fetch data using hard-coded species ID
    const response = await fetch(`/api/species/${SPECIES_ID}/features`);
    if (!response.ok) throw new Error('Failed to fetch turtle features');
    const data = await response.json();
    
    // Clear loading state
    container.innerHTML = '';
    
    // If no data is returned, show an empty state
    if (!data.categories || data.categories.length === 0) {
      const emptySection = document.createElement('div');
      emptySection.className = 'accordion-section';
      emptySection.innerHTML = `
        <div class="accordion-header">
          <span class="accordion-title">No Features Available</span>
        </div>
        <div class="accordion-content open">
          <div class="feature-row main-feature">
            <div class="feature-name">No physical features are available for this species.</div>
          </div>
        </div>
      `;
      container.appendChild(emptySection);
      return;
    }
    
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
    
    console.log('Accordion built successfully');
  } catch (error) {
    console.error('Error building accordion:', error);
    
    // Show error state with proper styling
    container.innerHTML = '';
    const errorSection = document.createElement('div');
    errorSection.className = 'accordion-section';
    errorSection.innerHTML = `
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
    `;
    container.appendChild(errorSection);
  }
}

// Auto-initialize when the page loads
document.addEventListener('DOMContentLoaded', initTurtleFeaturesAccordion);

// Also make it available globally in case you need to call it manually
window.initTurtleFeaturesAccordion = initTurtleFeaturesAccordion;
