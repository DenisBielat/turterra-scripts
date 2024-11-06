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
  
  navAnchors.forEach(anchor => {
    const rect = anchor.getBoundingClientRect();
    // Check if element is in viewport (with some offset for better UX)
    // Adjusted to consider elements near the top of the viewport
    if (rect.top <= 150 && rect.bottom >= 150) {
      currentSection = anchor.id;
      console.log('Current section:', currentSection); // Debug log
    }
  });
  
  return currentSection;
}

// Function to update active nav item states
function updateActiveNavItem() {
  const currentSection = getCurrentSection();
  
  if (currentSection) { // Only update if we found a current section
    navItems.forEach(item => {
      const navValue = item.getAttribute('nav-value');
      console.log('Comparing nav-value:', navValue, 'with current section:', currentSection); // Debug log
      
      // Remove active class
      item.classList.remove('active');
      
      // Add active class if this is the current section
      if (navValue === currentSection) {
        item.classList.add('active');
        console.log('Setting active:', navValue); // Debug log
      }
    });
  }
}

// Add scroll event listener with throttling to improve performance
window.addEventListener('scroll', throttle(updateActiveNavItem, 100));

// Initial call to set active nav item on page load
document.addEventListener('DOMContentLoaded', updateActiveNavItem);

// Click handlers for navigation
navItems.forEach(item => {
  item.addEventListener('click', (e) => {
    const navValue = item.getAttribute('nav-value');
    
    // Special handling for "top" button
    if (navValue === 'top') {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      return;
    }
    
    // Normal section navigation
    const targetAnchor = document.getElementById(navValue);
    if (targetAnchor) {
      e.preventDefault();
      targetAnchor.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// Log initial setup info
console.log('Nav anchors found:', navAnchors.length);
console.log('Nav items found:', navItems.length);
navAnchors.forEach(anchor => console.log('Anchor ID:', anchor.id));
navItems.forEach(item => console.log('Nav value:', item.getAttribute('nav-value')));
