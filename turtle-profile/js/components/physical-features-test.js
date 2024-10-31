(function(window) {
  // Add this new function to test physical features images
  function testPhysicalFeaturesImages() {
    if (!window.currentTurtleCommonName) {
        console.error('Current turtle common name not found for physical features test.');
        return;
    }

    const commonName = window.currentTurtleCommonName;
    const encodedCommonName = encodeURIComponent(commonName);
    
    console.log('Fetching physical features images for:', commonName);

    fetch(`https://turterra.vercel.app/cloudinary/${encodedCommonName}/physical-features`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(images => {
            console.log('Number of images found:', images.length);
            images.forEach((image, index) => {
                console.log(`Image ${index + 1}:`);
                console.log('  Public ID:', image.public_id);
                console.log('  Tags:', image.tags);
                console.log('  Metadata:', image.metadata);
            });
        })
        .catch(error => {
            console.error('Error fetching physical features images:', error);
        });
}
  // Expose the test function to the global scope
  window.testPhysicalFeaturesImages = testPhysicalFeaturesImages;
})(window);
