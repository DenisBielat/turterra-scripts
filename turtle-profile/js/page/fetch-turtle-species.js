(function(window) {
    async function fetchTurtleNames() {
        const collectionId = '65a871ba95802374d1170989';

        try {
            const response = await fetch(`https://turterra.vercel.app/webflow/${collectionId}`);
            const data = await response.json();

            const currentSlug = getSlugFromURL();
            const currentTurtle = data.items.find(item => item.fieldData.slug === currentSlug);

            if (currentTurtle) {
                window.currentTurtleCommonName = currentTurtle.fieldData.name;
                window.currentTurtleScientificName = currentTurtle.fieldData.species;
                window.currentTurtleId = currentTurtle.id;
                console.log('Turtle data loaded successfully');
                // Dispatch custom event to notify that turtle data is loaded
                const event = new Event('turtleDataLoaded');
                document.dispatchEvent(event);
            } else {
                console.error('Turtle not found for slug:', currentSlug);
            }
        } catch (error) {
            console.error('Error fetching turtle data:', error);
        }
    }

    function getSlugFromURL() {
        const path = window.location.pathname;
        const segments = path.split('/');
        return segments[segments.length - 1];
    }

    // Initialize when the window loads
    window.addEventListener('load', fetchTurtleNames);
})(window);
