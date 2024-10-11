(function(window) {
  function initTurtleProfileSlider() {
    if (!window.currentTurtleCommonName) {
      console.error('Current turtle common name not found. Waiting for data to load...');
      document.addEventListener('turtleDataLoaded', initTurtleProfileSlider);
      return;
    }

    const commonName = window.currentTurtleCommonName;
    const encodedCommonName = encodeURIComponent(commonName);

    fetch(`https://turterra.vercel.app/cloudinary/${encodedCommonName}`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(images => {
        console.log(`Fetched ${images.length} images for the slider.`);
        const sliderWrapper = document.querySelector('.turtle-profile-slider-wrapper');

        if (!sliderWrapper) {
          console.error('Slider wrapper not found.');
          return;
        }

        // Clear existing slides
        sliderWrapper.innerHTML = '';

        images.forEach((image, index) => {
          const slide = document.createElement('div');
          slide.className = 'turtle-profile-slide';
          if (image.metadata.primary_photo) {
            slide.classList.add('primary-photo');
          }
          slide.setAttribute('role', 'group');
          slide.setAttribute('aria-label', `${index + 1} / ${images.length}`);
          slide.setAttribute('data-swiper-slide-index', index);

          const lifeStage = image.metadata.life_stage ? `${image.metadata.life_stage}.` : '';
          const assetType = image.metadata.asset_type ? `${image.metadata.asset_type}:` : '';
          const creditsBasic = image.metadata.credits_basic || '';

          slide.innerHTML = `
            <div class="media-data">
              <img src="${image.secure_url}" alt="${commonName}" title="${lifeStage}" loading="lazy">
            </div>
            <div class="media-attribution">
              <span class="image-caption">${lifeStage}</span>
              <span class="credit-intro">${assetType}</span>
              <span class="credit-value">${creditsBasic}</span>
            </div>
          `;

          sliderWrapper.appendChild(slide);
        });

        initializeSwiper();
        initializeExtendedWrapper();
      })
      .catch(error => {
        console.error('Error fetching images:', error);
      });
  }
  
  function initializeSwiper(initialSlide = 0) {
    const sliderContainers = document.querySelectorAll('.turtle-profile-slider-container');
    sliderContainers.forEach(sliderContainer => {
      if (sliderContainer.swiper) {
        sliderContainer.swiper.destroy(true, true);
      }

      new Swiper(sliderContainer, {
        slidesPerView: 'auto',
        centeredSlides: true,
        loop: true,
        loopedSlides: 3,
        watchSlidesProgress: true,
        initialSlide: initialSlide,
        wrapperClass: 'turtle-profile-slider-wrapper',
        slideClass: 'turtle-profile-slide',
        navigation: {
          nextEl: '.turtle-profile-slider_arrow-right',
          prevEl: '.turtle-profile-slider_arrow-left',
        },
        on: {
          init: function(swiper) {
            updateSlideClasses(swiper);
            setupHoverBehavior(sliderContainer);
            updateMediaAttributionVisibility(swiper);
          },
          slideChange: function(swiper) {
            updateSlideClasses(swiper);
            updateMediaAttributionVisibility(swiper);
          }
        }
      });
    });
  }
  
  function updateSlideClasses(swiper) {
    if (!swiper || !swiper.slides) {
      console.error('Invalid swiper object');
      return;
    }

    const slides = swiper.slides;
    const totalSlides = slides.length;

    slides.forEach((slide, index) => {
      if (!(slide instanceof Element)) {
        console.error('Invalid slide element at index', index);
        return;
      }

      slide.classList.remove('turtle-profile-slide-prev', 'turtle-profile-slide-next', 'turtle-profile-slide-active');

      const normalizedIndex = (index - swiper.activeIndex + totalSlides) % totalSlides;

      if (normalizedIndex === 0) {
        slide.classList.add('turtle-profile-slide-active');
      } else if (normalizedIndex === totalSlides - 1 || normalizedIndex === -1) {
        slide.classList.add('turtle-profile-slide-prev');
      } else if (normalizedIndex === 1) {
        slide.classList.add('turtle-profile-slide-next');
      }
    });
  }

  function updateMediaAttributionVisibility(swiper) {
    if (!swiper || !swiper.slides) {
      console.error('Invalid swiper object');
      return;
    }

    const slides = swiper.slides;
    slides.forEach((slide, index) => {
      if (!(slide instanceof Element)) {
        console.error('Invalid slide element at index', index);
        return;
      }

      const mediaAttribution = slide.querySelector('.media-attribution');
      if (mediaAttribution) {
        if (slide.classList.contains('turtle-profile-slide-active')) {
          mediaAttribution.classList.add('visible');
        } else {
          mediaAttribution.classList.remove('visible');
        }
      }
    });
  }

  function setupHoverBehavior(sliderContainer) {
    const navButtons = sliderContainer.querySelectorAll('.slider-nav-button');
    
    sliderContainer.addEventListener('mouseenter', () => {
      navButtons.forEach(button => button.style.opacity = '1');
    });

    sliderContainer.addEventListener('mouseleave', () => {
      navButtons.forEach(button => button.style.opacity = '0');
    });
  }

  function initializeExtendedWrapper() {
    const extendedWrappers = document.querySelectorAll('.extended-wrapper');
    extendedWrappers.forEach(item => {
      extendFullWidth(item);
      window.addEventListener('resize', () => extendFullWidth(item));
    });
  }

  function extendFullWidth(item) {
    if (!(item instanceof Element)) {
      console.error('Invalid item passed to extendFullWidth');
      return;
    }

    const windowWidth = window.innerWidth;
    const parent = item.parentNode;

    if (!(parent instanceof Element)) {
      console.error('Invalid parent element');
      return;
    }

    const parentRect = parent.getBoundingClientRect();
    const parentOffsetLeft = parentRect.left + window.pageXOffset;
    const parentWidth = parent.offsetWidth;
    const marginLeft = -1 * parentOffsetLeft;
    const marginRight = -1 * (windowWidth - parentWidth - parentOffsetLeft);

    item.style.width = windowWidth + 'px';
    item.style.left = 'unset';
    item.style.marginLeft = marginLeft + 'px';
    item.style.marginRight = marginRight + 'px';
  }

  // Expose the initialization function to the global scope
  window.initTurtleProfileSlider = initTurtleProfileSlider;

  // Initialize when the window loads or when turtle data is loaded
  window.addEventListener('load', function() {
    if (window.currentTurtleScientificName) {
      initTurtleProfileSlider();
    } else {
      console.log('Waiting for turtle data to load...');
      document.addEventListener('turtleDataLoaded', initTurtleProfileSlider);
    }
  });

})(window);
