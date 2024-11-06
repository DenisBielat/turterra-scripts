// Get all anchor elements and nav items
const navAnchors = document.querySelectorAll('.nav-anchor');
const navItems = document.querySelectorAll('.profile-nav-item');

// Simple throttle function
function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }
}

// Function to get the current section in view
function getCurrentSection() {
  let currentSection = '';
  let minDistance = Infinity;
  
  navAnchors.forEach(anchor => {
    const rect = anchor.getBoundingClientRect();
    // Calculate distance from top of viewport
    const distance = Math.abs(rect.top);
    
    // If this element is closer to the top of the viewport than our previous best match
    if (distance < minDistance) {
      minDistance = distance;
      currentSection = anchor.id;
    }
  });
  
  // If we're very close to the top of the page, consider it the "intro" section
  if (window.scrollY < 100) {
    currentSection = 'intro';
  }
  
  return currentSection;
}

// Function to update active nav item states
function updateActiveNavItem() {
  const currentSection = getCurrentSection();
  
  if (currentSection) {
    navItems.forEach(item => {
      const navValue = item.getAttribute('nav-value');
      
      // Remove active class
      item.classList.remove('active');
      
      // Add active class if this is the current section
      if (navValue === currentSection) {
        item.classList.add('active');
      }
    });
  }
}

// Add scroll event listener with throttling to improve performance
window.addEventListener('scroll', throttle(updateActiveNavItem, 50));

// Initial call to set active nav item on page load
document.addEventListener('DOMContentLoaded', updateActiveNavItem);

// Click handlers for navigation
navItems.forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    const navValue = item.getAttribute('nav-value');
    
    // Special handling for "top" button
    if (navValue === 'top') {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      return;
    }
    
    // Normal section navigation
    const targetAnchor = document.getElementById(navValue);
    if (targetAnchor) {
      targetAnchor.scrollIntoView({ behavior: 'smooth' });
    }
  });
});
