console.log("Start of taxonomy script");

(function(window) {
    console.log("Inside IIFE");

    function logError(error) {
        console.error('Error in taxonomy script:', error);
    }

    try {
        async function populateTaxonomy() {
            console.log("populateTaxonomy called");
            if (!window.currentTurtleScientificName) {
                console.error('currentTurtleScientificName is not available');
                return;
            }

            const currentGenus = window.currentTurtleScientificName.split(' ')[0].toLowerCase();
            console.log("Current genus:", currentGenus);
            
            // ... rest of the populateTaxonomy function ...
        }

        function updateTaxonomyElement(taxonLevel, commonName, scientificName) {
            console.log(`Updating ${taxonLevel}: ${commonName} (${scientificName})`);
            // ... rest of the updateTaxonomyElement function ...
        }

        function initTaxonomy() {
            console.log("initTaxonomy called");
            const checkAndPopulate = async () => {
                if (window.currentTurtleScientificName) {
                    console.log("currentTurtleScientificName available:", window.currentTurtleScientificName);
                    await populateTaxonomy();
                } else {
                    console.log("currentTurtleScientificName not available, retrying...");
                    setTimeout(checkAndPopulate, 100);
                }
            };

            checkAndPopulate();
        }

        // Expose the initialization function to the global scope
        window.initTaxonomy = initTaxonomy;

        console.log("Before DOMContentLoaded event listener");

        // Initialize when the DOM content is loaded
        document.addEventListener('DOMContentLoaded', async () => {
            console.log("DOMContentLoaded event fired");
            try {
                if (typeof window.fetchTurtleNames === 'function') {
                    console.log("Calling fetchTurtleNames");
                    await window.fetchTurtleNames();
                    console.log("fetchTurtleNames completed");
                } else {
                    console.error('fetchTurtleNames function is not available');
                }
                initTaxonomy();
            } catch (error) {
                logError(error);
            }
        });

        console.log("After DOMContentLoaded event listener");

    } catch (error) {
        logError(error);
    }

    console.log("End of IIFE");
})(window);

console.log("End of taxonomy script");
