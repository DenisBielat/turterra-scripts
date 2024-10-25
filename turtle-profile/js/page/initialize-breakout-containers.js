(function(window) {
    function initBreakout() {
        const breakoutSection = document.querySelector('.grid-breakout');
        if (!breakoutSection) {
            console.log('No breakout section found');
            return;
        }
        
        const parent = breakoutSection.parentElement;
        if (!parent) {
            console.log('No parent element found');
            return;
        }
        
        function updateBreakout() {
            const parentOffset = parent.getBoundingClientRect().left;
            const windowWidth = window.innerWidth;
            
            breakoutSection.style.width = windowWidth + 'px';
            breakoutSection.style.marginLeft = (-1 * parentOffset) + 'px';
            breakoutSection.style.marginRight = (-1 * (windowWidth - parent.offsetWidth - parentOffset)) + 'px';
        }
        
        // Initial update
        updateBreakout();
        
        // Add resize listener
        window.addEventListener('resize', updateBreakout);
        
        // Return the cleanup function in case it's needed
        return function cleanup() {
            window.removeEventListener('resize', updateBreakout);
        };
    }

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initBreakout);
    } else {
        initBreakout();
    }

    // Expose initBreakout to the global scope if needed
    window.initBreakout = initBreakout;
})(window);
