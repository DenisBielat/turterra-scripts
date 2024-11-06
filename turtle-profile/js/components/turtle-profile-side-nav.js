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
    const anchorTop = anchor.offsetTop - 100; // Adjust offset based on your header height
    const anchorHeight = anchor.offsetHeight;
    const scrollPosition = window.scrollY;

    if (scrollPosition >= anchorTop && scrollPosition < anchorTop + anchorHeight) {
      currentSection = anchor.id; // Use the ID of the anchor element
    }
  });
  
  return currentSection;
}

// Function to update active nav item states
function updateActiveNavItem() {
  const currentSection = getCurrentSection();
  
  navItems.forEach(item => {
    // Remove active class from all items
    item.classList.remove('active');
    
    // Add active class to current section's nav item
    const navValue = item.getAttribute('nav-value');
    if (navValue === currentSection) {
      item.classList.add('active');
    }
  });
}

// Add scroll event listener with throttling to improve performance
window.addEventListener('scroll', throttle(updateActiveNavItem, 100));

// Initial call to set active nav item on page load
document.addEventListener('DOMContentLoaded', updateActiveNavItem);

// Optional: Add click handlers for smooth scrolling
navItems.forEach(item => {
  item.addEventListener('click', (e) => {
    const navValue = item.getAttribute('nav-value');
    const targetAnchor = document.getElementById(navValue);
    
    if (targetAnchor) {
      e.preventDefault();
      targetAnchor.scrollIntoView({ behavior: 'smooth' });
    }
  });
});
