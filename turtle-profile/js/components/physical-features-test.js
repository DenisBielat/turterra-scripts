(function(window) {
  // Add this new function to test physical features images
  function testPhysicalFeaturesImages() {
    if (!window.currentTurtleCommonName) {
      console.error('Current turtle common name not found for physical features test.');
      return;
    }

    const commonName = window.currentTurtleCommonName;
    const encodedCommonName = encodeURIComponent(commonName);
    
    console.log('Attempting to fetch physical features images for:', commonName);
    console.log('Encoded species name:', encodedCommonName);
    console.log('Full API URL:', `https://turterra.vercel.app/cloudinary/${encodedCommonName}/physical-features`);

    fetch(`https://turterra.vercel.app/cloudinary/${encodedCommonName}/physical-features`)
      .then(response => {
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(images => {
        console.log('Successfully fetched physical features images:', images);
        console.log('Number of images found:', images.length);
        console.log('First image data:', images[0]);
      })
      .catch(error => {
        console.error('Error fetching physical features images:', error);
        console.error('Error details:', error.message);
      });
  }

  // Add to your existing window load event listener
  window.addEventListener('load', function() {
    if (window.currentTurtleCommonName) {
      // Keep your existing slider initialization
      initTurtleProfileSlider();
      
      // Add the physical features test
      console.log('Testing physical features images...');
      testPhysicalFeaturesImages();
    } else {
      console.log('Waiting for turtle data to load...');
      document.addEventListener('turtleDataLoaded', () => {
        initTurtleProfileSlider();
        testPhysicalFeaturesImages();
      });
    }
  });

  // Expose the test function to the global scope
  window.testPhysicalFeaturesImages = testPhysicalFeaturesImages;

})(window);
