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
    console.log('Encoded name:', encodedCommonName);
    console.log('Full URL:', `https://turterra.vercel.app/cloudinary/${encodedCommonName}/physical-features`);

    fetch(`https://turterra.vercel.app/cloudinary/${encodedCommonName}/physical-features`)
        .then(response => {
            console.log('Response received:', response.status);
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
            console.error('Error details:', error.message);
        });
}

  // Add event listeners to run the test
  window.addEventListener('load', function() {
    console.log('Page loaded, checking for turtle data...');
    console.log('Current turtle name:', window.currentTurtleCommonName);
    
    if (window.currentTurtleCommonName) {
      console.log('Turtle data found, running test...');
      testPhysicalFeaturesImages();
    } else {
      console.log('Waiting for turtle data to load...');
      document.addEventListener('turtleDataLoaded', () => {
        console.log('Turtle data loaded, running test...');
        testPhysicalFeaturesImages();
      });
    }
  });

  // Expose the test function to the global scope
  window.testPhysicalFeaturesImages = testPhysicalFeaturesImages;

})(window);
