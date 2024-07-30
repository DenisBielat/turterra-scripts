(function(window) {
    window.addEventListener('load', async function() {
        const cl = cloudinary.Cloudinary.new({ cloud_name: 'dyhvmivey' });
        let allImages = [];
        let currentCategory = 'cover-photo';
        let currentIndex = 0;
        let isTransitioning = false;
        let physicalFeatureDescriptions = null;
        let attributesByCategory = {};
        
        const TRANSITION_DURATION = 300; // in milliseconds
        const categories = ['cover-photo', 'eyes-and-face', 'neck', 'skin-and-limbs', 'shell-top', 'shell-bottom', 'coloration', 'male-specific', 'female-specific', 'hatchling'];

    async function fetchImagesForSpecies(species) {
        try {
            const response = await fetch(`http://localhost:3000/cloudinary/${species}`);
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.error('Error fetching images:', error);
            return [];
        }
    }

    function getImagesForCategory(category) {
        return allImages.filter(image => 
            image.metadata?.turtle_profile_categories?.includes(category.replace(/-/g, '_'))
        );
    }
    
    async function displayImage(image, skipAnimation = false, updateCounter = true) {
        return new Promise(async (resolve) => {
            const imageContainer = document.querySelector('.phys-features_image-container');
            if (!imageContainer) {
                console.error('Image container not found');
                resolve();
                return;
            }
            
            const currentImg = imageContainer.querySelector('.phys-features_image.slide-in');
            const newImg = document.createElement('img');
            newImg.className = 'phys-features_image';
            newImg.src = image.secure_url;
            newImg.alt = 'Turtle feature image';
            
            if (skipAnimation) {
                if (currentImg) currentImg.remove();
                newImg.classList.add('slide-in');
                imageContainer.appendChild(newImg);
                resolve();
            } else {
                imageContainer.appendChild(newImg);
                void newImg.offsetWidth; // Trigger reflow
                
                if (currentImg) {
                    currentImg.classList.remove('slide-in');
                    currentImg.classList.add('fade-out');
                    setTimeout(() => currentImg.remove(), TRANSITION_DURATION);
                }
                
                newImg.classList.add('slide-in');
                setTimeout(() => {
                    updateMetadataDisplay(image);
                    if (updateCounter) {
                        updateSlideCounter();
                    }
                    resolve();
                }, TRANSITION_DURATION);
            }
        });
    }

    function updateMetadataDisplay(image) {
        const imageTypeElement = document.querySelector('.image-type');
        const sexElement = document.querySelector('.image-sex');
        
        if (imageTypeElement) imageTypeElement.textContent = image.metadata.image_type;
        if (sexElement) sexElement.textContent = image.metadata.sex;
    }

    function updateSlideCounter() {
        const counterElement = document.querySelector('.phys-features_slide-counter');
        if (counterElement) {
            const categoryImages = getImagesForCategory(currentCategory);
            counterElement.textContent = `${currentIndex + 1}/${categoryImages.length}`;
        }
    }

    async function fetchTurtleAttributes() {
        try {
            if (!window.currentTurtleId) {
                throw new Error("Current turtle ID not found");
            }
    
            const response = await fetch(`http://localhost:3000/turtle-physical-feature-attributes/${encodeURIComponent(window.currentTurtleId)}`);
            if (!response.ok) throw new Error('Network response was not ok');
            const attributes = await response.json();
    
            attributesByCategory = attributes.reduce((acc, attr) => {
                const category = attr.fieldData['category'];
                if (!acc[category]) acc[category] = [];
                acc[category].push({
                    type: attr.fieldData['attribute-type-text'],
                    value: attr.fieldData['specific-value']
                });
                return acc;
            }, {});
    
            // Call displayAttributeTags here to update the UI
            displayAttributeTags(currentCategory);
        } catch (error) {
            console.error('Error fetching turtle attributes:', error);
        }
    }

    function displayAttributeTags(category) {
        const tagContainer = document.querySelector('.attribute-tag_list-wrapper');
        if (!tagContainer) {
            console.error("Tag container not found");
            return;
        }
    
        const templateTag = document.querySelector('.attribute-tag.template');
        if (!templateTag) {
            console.error('Template tag not found');
            return;
        }
    
        // Clear existing tags
        tagContainer.innerHTML = '';
    
        // Convert category to the ID format used in the attributesByCategory object
        const categoryId = getCategoryId(category);
        const attributes = attributesByCategory[categoryId] || [];
    
        attributes.forEach(attr => {
            const tagElement = templateTag.cloneNode(true);
            tagElement.classList.remove('template');
            
            const textElement = tagElement.querySelector('.attribute-tag_text');
            if (textElement) {
                textElement.textContent = `${attr.type} - ${attr.value}`;
            }
            
            tagContainer.appendChild(tagElement);
        });
    }
    
    // Helper function to convert category names to IDs
    function getCategoryId(category) {
        const categoryMap = {
            'eyes-and-face': 'dad28cb75e1e71f0501d86ac79900279',
            'neck': 'bc86bd3f3d58df28ebeda813a59a0131',
            'skin-and-limbs': '053d305c1e45fcf4b94584d4301d0604',
            'shell-top': '8f0e64133991e782a39f80f3d48b348c',
            'shell-bottom': '87ae4ee56e3054d316b664778ffee79f',
            'coloration': '29410db5275c0eb1727efe8e7c30c24b',
            'male-specific': 'ccfd0aaec7af1ba7186cf95c29156084',
            'female-specific': '084c6b6b6a3c6c2d0cb6f7b2ca2db624',
            'hatchling': 'bf15c81d8df0d97094a5d57cb351f87b'
        };
        return categoryMap[category] || category;
    }

    function updateNavigationButtons() {
        const prevButton = document.querySelector('.phys-features_arrow-left');
        const nextButton = document.querySelector('.phys-features_arrow-right');
        const categoryImages = getImagesForCategory(currentCategory);
        
        if (prevButton) {
            prevButton.classList.toggle('disabled', currentIndex === 0 && currentCategory === categories[0]);
        }
        if (nextButton) {
            const isLastCategory = currentCategory === categories[categories.length - 1];
            const isLastImage = currentIndex === categoryImages.length - 1;
            const nextCategoryHasImages = !isLastCategory && getImagesForCategory(categories[categories.indexOf(currentCategory) + 1]).length > 0;
            
            nextButton.classList.toggle('disabled', isLastImage && (isLastCategory || !nextCategoryHasImages));
        }
    }

    function updateCategoryButtons() {
        document.querySelectorAll('.attribute-button').forEach(button => {
            const attribute = button.getAttribute('data-attribute');
            const hasImages = getImagesForCategory(attribute).length > 0;
            button.classList.toggle('disabled', !hasImages);
            
            ['attribute-button_icon', 'attribute-button_text'].forEach(className => {
                const element = button.querySelector(`.${className}`);
                if (element) element.classList.toggle('disabled', !hasImages);
            });
        });
    }

    async function changeCategory(newCategory, direction = 'next') {
        if (isTransitioning) return;
        isTransitioning = true;
    
        const categoryImages = getImagesForCategory(newCategory);
        if (categoryImages.length > 0) {
            updateSelectedCategoryButton(newCategory);
            updateCategoryButtons();
            
            // Start text transition immediately
            const textTransitionPromise = updateHeadingAndDescription(newCategory);
            
            const transitionPromise = showCategoryCard(newCategory);
            
            currentCategory = newCategory;
            currentIndex = direction === 'next' ? 0 : categoryImages.length - 1;
            const newImage = categoryImages[currentIndex];
            
            await new Promise(resolve => setTimeout(resolve, 300));
            
            const imageTransitionPromise = displayImage(newImage, true);
            
            // Wait for all transitions to complete
            await Promise.all([textTransitionPromise, transitionPromise, imageTransitionPromise]);
            
            updateSlideCounter();
            displayAttributeTags(newCategory);  // Add this line
            updateNavigationButtons();
        } else {
            // Update navigation buttons even if there are no images
            updateNavigationButtons();
        }
        isTransitioning = false;
    }

    async function nextImage() {
        if (isTransitioning) return;
    
        const categoryImages = getImagesForCategory(currentCategory);
        if (currentIndex < categoryImages.length - 1) {
            currentIndex++;
            await displayImage(categoryImages[currentIndex]);
            updateSlideCounter();
            updateNavigationButtons();
        } else {
            const nextCategoryIndex = categories.indexOf(currentCategory) + 1;
            if (nextCategoryIndex < categories.length) {
                await changeCategory(categories[nextCategoryIndex], 'next');
            }
        }
    }
    
    async function previousImage() {
        if (isTransitioning) return;
    
        if (currentIndex > 0) {
            currentIndex--;
            await displayImage(getImagesForCategory(currentCategory)[currentIndex]);
            updateSlideCounter();
            updateNavigationButtons();
        } else {
            const prevCategoryIndex = categories.indexOf(currentCategory) - 1;
            if (prevCategoryIndex >= 0) {
                await changeCategory(categories[prevCategoryIndex], 'prev');
            }
        }
    }
    
    async function showCategoryCard(category) {
        return new Promise(async (resolve) => {
            const card = document.querySelector('.phys-features_transition-card');
            const iconContainer = card.querySelector('.transition-card_icon');
            const headingContainer = card.querySelector('.transition-card_heading');
        
            const categoryButton = document.querySelector(`.attribute-button[data-attribute="${category}"]`);
            const iconUrl = categoryButton?.dataset.icon;
        
            if (iconUrl) {
                const svgContent = await fetchSvg(iconUrl);
                iconContainer.innerHTML = svgContent;
            } else {
                iconContainer.innerHTML = '';
            }
        
            headingContainer.textContent = category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        
            card.style.display = 'flex';
            card.style.opacity = '0';
            void card.offsetWidth; // Trigger reflow
            card.style.transition = 'opacity 0.3s ease-in-out';
            card.style.opacity = '1';
        
            setTimeout(() => {
                card.style.opacity = '0';
                setTimeout(() => {
                    card.style.display = 'none';
                    resolve();
                }, 300);
            }, 800); // 300ms fade-in + 500ms visible + 300ms fade-out
        });
    }
    
    function updateSelectedCategoryButton(category) {
        document.querySelectorAll('.attribute-button').forEach(button => {
            const attribute = button.getAttribute('data-attribute');
            button.classList.toggle('selected', attribute === category);
        });
    }
    
    async function fetchSvg(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.text();
        } catch (error) {
            console.error('Error fetching SVG:', error);
            return '';
        }
    }
    
    async function fetchPhysicalFeatureDescriptions(species) {
        const formattedSpecies = species.toLowerCase().replace(/\s+/g, '-');
        try {
            const response = await fetch(`http://localhost:3000/physical-feature-descriptions/${formattedSpecies}`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Network response was not ok: ${errorData.details}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching physical feature descriptions:', error);
            return null;
        }
    }
    
    async function updateHeadingAndDescription(category) {
        const headingElement = document.querySelector('.phys-features_heading');
        const descriptionElement = document.querySelector('.phys-features_description');
        const tagContainer = document.querySelector('.attribute-tag_list-wrapper');
    
        // Fade out
        headingElement.classList.add('fade-out');
        descriptionElement.classList.add('fade-out');
        tagContainer.classList.add('fade-out');
    
        // Wait for fade out and transition card to complete
        await new Promise(resolve => setTimeout(resolve, 300)); // Reduced to match your 0.3s transition
    
        // Update content
        if (headingElement) {
            headingElement.textContent = category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        }
    
        if (descriptionElement && physicalFeatureDescriptions) {
            const descriptionKey = category.replace(/-/g, '_').toLowerCase();
            const description = physicalFeatureDescriptions[descriptionKey] || 'Description not available.';
            descriptionElement.textContent = description;
        }
    
        // Update tags
        displayAttributeTags(category);
    
        // Trigger reflow
        void headingElement.offsetWidth;
        void descriptionElement.offsetWidth;
        void tagContainer.offsetWidth;
    
        // Fade in
        headingElement.classList.remove('fade-out');
        descriptionElement.classList.remove('fade-out');
        tagContainer.classList.remove('fade-out');
    }
    
    async function init() {
            await new Promise(resolve => {
                const checkInterval = setInterval(() => {
                    if (window.currentTurtleCommonName) {
                        clearInterval(checkInterval);
                        resolve();
                    }
                }, 100);
            });

            const species = window.currentTurtleCommonName.toLowerCase().replace(/\s+/g, '-');
            allImages = await fetchImagesForSpecies(species);
            physicalFeatureDescriptions = await fetchPhysicalFeatureDescriptions(species);
            await fetchTurtleAttributes(species); 
    
        const coverPhotos = getImagesForCategory('cover-photo');
        if (coverPhotos.length > 0) {
            await displayImage(coverPhotos[0], false, false);
            currentCategory = 'cover-photo';
            currentIndex = 0;
            updateSlideCounter();
            updateHeadingAndDescription(currentCategory);
            document.querySelector('.phys-features_heading').classList.remove('fade-out');
            document.querySelector('.phys-features_description').classList.remove('fade-out');
            
            displayAttributeTags(currentCategory);
        }
        
        updateSelectedCategoryButton(currentCategory);
        updateCategoryButtons();
        updateNavigationButtons();
    
        document.querySelectorAll('.attribute-button').forEach(button => {
            button.addEventListener('click', function() {
                if (!this.classList.contains('disabled')) {
                    changeCategory(this.getAttribute('data-attribute'));
                }
            });
        });
    
        ['phys-features_arrow-left', 'phys-features_arrow-right'].forEach(className => {
            const button = document.querySelector(`.${className}`);
            if (button) {
                button.addEventListener('click', function() {
                    if (!this.classList.contains('disabled')) {
                        className.includes('left') ? previousImage() : nextImage();
                    }
                });
            }
        });
    }

    init();
    });
})(window);
