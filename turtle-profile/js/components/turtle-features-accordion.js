function initTurtleFeaturesAccordion(turtleData = null) {
  console.log('Initializing turtle features accordion...');
  
  const defaultData = {
    categories: [
      {
        name: "Head/Neck",
        features: [
          {
            name: "Head/Neck Pattern",
            value: "Stripes",
            subFeatures: [
              { name: "Head/Neck Pattern Color", value: "Red, Yellow" }
            ]
          },
          {
            name: "Neck Texture",
            value: "Smooth",
            subFeatures: []
          }
        ]
      },
      {
        name: "Shell Top",
        features: [
          {
            name: "Shell Top Pattern",
            value: "Reticulated",
            subFeatures: [
              { name: "Shell Top Texture", value: "Rough" }
            ]
          }
        ]
      }
    ]
  };

  const data = turtleData || defaultData;
  const container = document.getElementById('turtle-features');
  
  if (!container) {
    console.error('Turtle features container not found!');
    return;
  }
  
  console.log('Container found, building accordion...');
  
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
    category.features.forEach((feature, index) => {
      // Add main feature
      const featureRow = document.createElement('div');
      featureRow.className = `feature-row main-feature ${index > 0 ? 'divider' : ''}`;
      featureRow.innerHTML = `
        <div class="feature-name">${feature.name}</div>
        <div class="feature-value">${feature.value}</div>
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
          <div class="feature-value">${subFeature.value}</div>
        `;
        content.appendChild(subFeatureRow);
      });
    });
    
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
}

// Make it available globally
window.initTurtleFeaturesAccordion = initTurtleFeaturesAccordion;
