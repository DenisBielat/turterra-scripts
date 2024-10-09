async function populateTaxonomy() {
    if (!window.currentTurtleScientificName) {
        console.error('currentTurtleScientificName is not set');
        return;
    }

    const currentGenus = window.currentTurtleScientificName.split(' ')[0].toLowerCase();
    try {
        // Fetch genus information
        const genusResponse = await fetch(`https://turterra.vercel.app/webflow/66637132663284af3d60c285`);
        const genusData = await genusResponse.json();
        const currentGenusInfo = genusData.items.find(item => item.fieldData.slug === currentGenus);
        if (!currentGenusInfo) {
            console.error('Genus not found:', currentGenus);
            return;
        }
        const familyId = currentGenusInfo.fieldData.family;

        // Fetch family information
        const familyResponse = await fetch(`https://turterra.vercel.app/webflow/66636a5b1814b2e86443af71`);
        const familyData = await familyResponse.json();
        const currentFamilyInfo = familyData.items.find(item => item.id === familyId);
        if (!currentFamilyInfo) {
            console.error('Family not found:', familyId);
            return;
        }
        const suborderId = currentFamilyInfo.fieldData.suborder;

        // Fetch suborder information
        const suborderResponse = await fetch(`https://turterra.vercel.app/webflow/6663676f890637f16da7d6e3`);
        const suborderData = await suborderResponse.json();
        const currentSuborderInfo = suborderData.items.find(item => item.id === suborderId);
        if (!currentSuborderInfo) {
            console.error('Suborder not found:', suborderId);
            return;
        }

        // Fetch order information
        const orderResponse = await fetch(`https://turterra.vercel.app/webflow/666366bd63ec3102249a34b6`);
        const orderData = await orderResponse.json();
        const orderInfo = orderData.items[0]; // Assuming there's only one order
        if (!orderInfo) {
            console.error('Order not found');
            return;
        }

        // Update HTML elements
        updateTaxonomyElement('order', orderInfo.fieldData['common-name'], orderInfo.fieldData.name);
        updateTaxonomyElement('suborder', currentSuborderInfo.fieldData['common-name'], currentSuborderInfo.fieldData.name);
        updateTaxonomyElement('family', currentFamilyInfo.fieldData['common-name'], currentFamilyInfo.fieldData.name);
        updateTaxonomyElement('genus', currentGenusInfo.fieldData['common-name'], currentGenusInfo.fieldData.name);
        updateTaxonomyElement('species', window.currentTurtleCommonName, window.currentTurtleScientificName);
    } catch (error) {
        console.error('Error in populateTaxonomy:', error);
    }
}

function updateTaxonomyElement(taxonLevel, commonName, scientificName) {
    const element = document.querySelector(`.taxonomy-list-item[taxon-level="${taxonLevel}"]`);
    if (element) {
        const commonNameElement = element.querySelector('.taxon-list-item_common-name');
        const scientificNameElement = element.querySelector('.taxon-list-item_scientific-name');
        if (commonNameElement) commonNameElement.textContent = commonName;
        if (scientificNameElement) scientificNameElement.textContent = scientificName;
    }
}
