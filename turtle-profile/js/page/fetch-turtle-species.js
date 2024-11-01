(function(window) {
    async function fetchTurtleNames() {
        const collectionId = '65a871ba95802374d1170989';
        const baseUrl = window.baseUrl || 'https://turterra.vercel.app';

        try {
            const response = await fetch(`${baseUrl}/webflow/${collectionId}`);
            const data = await response.json();

            const currentSlug = getSlugFromURL();
            const currentTurtle = data.items.find(item => item.fieldData.slug === currentSlug);

            if (currentTurtle) {
                window.currentTurtleCommonName = currentTurtle.fieldData.name;
                window.currentTurtleScientificName = currentTurtle.fieldData.species;
                window.currentTurtleId = currentTurtle.id;

                // Fetch the species ID from Supabase using the slug
                try {
                    const speciesResponse = await fetch(`${baseUrl}/supabase/species/${currentSlug}`);
                    if (!speciesResponse.ok) {
                        throw new Error('Failed to fetch species ID');
                    }
                    const speciesData = await speciesResponse.json();
                    window.currentSpeciesId = speciesData.id;
                    console.log('Species ID set:', window.currentSpeciesId);
                } catch (error) {
                    console.error('Error fetching species ID:', error);
                    window.currentSpeciesId = null;
                }

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

    // Expose fetchTurtleNames to the global scope
    window.fetchTurtleNames = fetchTurtleNames;
})(window);
