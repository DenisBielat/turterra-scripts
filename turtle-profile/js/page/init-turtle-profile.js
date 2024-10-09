async function initTurtleProfile() {
    try {
        if (typeof fetchTurtleNames !== 'function') {
            throw new Error('fetchTurtleNames function not found');
        }

        await fetchTurtleNames();

        // Check if currentTurtleScientificName is set
        if (!window.currentTurtleScientificName) {
            throw new Error('currentTurtleScientificName not set after fetchTurtleNames');
        }

        if (typeof populateTaxonomy !== 'function') {
            throw new Error('populateTaxonomy function not found');
        }

        await populateTaxonomy();

        // Add any other initialization functions here

        console.log('Turtle profile initialization completed successfully');
    } catch (error) {
        console.error('Error initializing turtle profile:', error);
    }
}

// Wait for both DOM content and resources to load before initializing
window.addEventListener('load', initTurtleProfile);
