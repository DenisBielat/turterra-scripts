function initTurtleFeaturesAccordion(turtleData = null) {
  // Default data structure if no data is provided
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
      // ... other categories
    ]
  };

  const data = turtleData || defaultData;
  const container = document.getElementById('turtle-features');
  if (!container) return;
  
  data.categories.forEach(category => {
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
          <div class="feature-name">${subFeature.name}</div>
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
}

// Make the function available globally
window.initTurtleFeaturesAccordion = initTurtleFeaturesAccordion;
