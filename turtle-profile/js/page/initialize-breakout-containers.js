function initBreakout() {
  const breakoutSection = document.querySelector('.grid-breakout');
  const parent = breakoutSection.parentElement;
  
  function updateBreakout() {
    const parentOffset = parent.getBoundingClientRect().left;
    const windowWidth = window.innerWidth;
    
    breakoutSection.style.width = windowWidth + 'px';
    breakoutSection.style.marginLeft = (-1 * parentOffset) + 'px';
    breakoutSection.style.marginRight = (-1 * (windowWidth - parent.offsetWidth - parentOffset)) + 'px';
  }
  
  updateBreakout();
  window.addEventListener('resize', updateBreakout);
}

// Call this when the page loads
document.addEventListener('DOMContentLoaded', initBreakout);
