(function(window) {
// Global variables
const mapboxToken = 'pk.eyJ1IjoiZGVuaXNiaWVsYXQiLCJhIjoiY2x4ZHM4eHBsMDltcjJqb2E4ZG9mb3FvZCJ9.XELbzaM4LAK6hdpXge9SxQ';
let map;
const highlightedAreas = {};
let countryList = [];
let selectedCountry = null;
let currentSpeciesScientificName = null;

const SELECTED_COUNTRY_COLOR = '#30302e';;
const SELECTED_COUNTRY_OPACITY = 0.3;

let popup = new mapboxgl.Popup({
  closeButton: false,
  closeOnClick: false
});

// Initialize map
function initializeMap() {
        mapboxgl.accessToken = mapboxToken;
        map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/denisbielat/clyc8jdx800zl01nzasir014p?fresh=true',
            center: [0, 20],
            zoom: 2
        });

        map.on('load', () => {
            console.log('Map loaded');
            fetchSpeciesDistributions();
        });
    }

// Expose functions to the global scope
window.initializeMap = initializeMap;
window.resetView = resetView;
window.updateGBIFOccurrences = updateGBIFOccurrences;

function getSpeciesFromURL() {
  const path = window.location.pathname;
  const segments = path.split('/');
  return segments[segments.length - 1];
}

// Fetch species distributions from Webflow CMS
function fetchSpeciesDistributions() {
  const speciesSlug = getSpeciesFromURL();
  const turtleSpeciesApiUrl = `http://localhost:3000/webflow/65a871ba95802374d1170989`;
  const distributionsApiUrl = `http://localhost:3000/webflow/665f58dea5d07e31b92c2ba2`;

  Promise.all([
    fetch(turtleSpeciesApiUrl).then(response => response.json()),
    fetch(distributionsApiUrl).then(response => response.json())
  ])
    .then(([turtleSpeciesData, distributionsData]) => {
      if (!turtleSpeciesData.items || !Array.isArray(turtleSpeciesData.items)) {
        throw new Error('Invalid turtle species data structure');
      }

      const currentSpecies = turtleSpeciesData.items.find(item => 
        item.fieldData && item.fieldData.slug === speciesSlug
      );

      if (currentSpecies) {
        const distribution = distributionsData.items.find(item => 
          item.fieldData && item.fieldData.species === currentSpecies.id
        );

        if (distribution) {
          processSpeciesData(currentSpecies, distribution);
        } else {
          processSpeciesData(currentSpecies, null);
        }

        if (currentSpecies.fieldData['range-data-url']) {
          fetchAndAddRangeData(currentSpecies.fieldData['range-data-url']);
        }

        setCurrentSpecies(currentSpecies.fieldData.species);
      } else {
        console.error('Species not found:', speciesSlug);
      }
    })
    .catch(error => console.error('Error fetching species data:', error));
}

function setCurrentSpecies(scientificName) {
  currentSpeciesScientificName = scientificName;
  console.log(`Set current species: ${scientificName}`);
  updateGBIFOccurrences();
  updateMap();
}

// Process individual species data
function processSpeciesData(speciesItem, distributionItem) {
  const speciesSlug = speciesItem.fieldData.slug;
  
  if (distributionItem && distributionItem.fieldData['species-distribution-json']) {
    try {
      const distributionData = JSON.parse(distributionItem.fieldData['species-distribution-json']);
      if (distributionData.countries && Array.isArray(distributionData.countries)) {
        distributionData.countries.forEach(country => processCountryData(country, speciesSlug));
      } else {
        console.warn('Distribution data does not contain a countries array:', distributionData);
      }
    } catch (error) {
      console.error('Error parsing distribution data for species:', speciesSlug, error);
    }
  } else {
    console.warn('Missing distribution data for species:', speciesItem.fieldData.name);
  }

  // Update country list and map even if distribution data is missing
  updateCountryList();
  updateMap();
}

// Process country data for a species
function processCountryData(country, speciesSlug) {
  const countryName = country.name;
  const countrySlug = countryName.toLowerCase().replace(/ /g, '_');
  
  if (!highlightedAreas[countrySlug]) {
    highlightedAreas[countrySlug] = {
      name: countryName,
      imageUrl: country.imageUrl,
      description: country.description,
      population: country.population,
      species: [],
      details: {}
    };
    if (!countryList.includes(countryName)) {
      countryList.push(countryName);
    }
  }

  if (!highlightedAreas[countrySlug].species.includes(speciesSlug)) {
    highlightedAreas[countrySlug].species.push(speciesSlug);
  }

  highlightedAreas[countrySlug].details[speciesSlug] = {
    presence: country.presence,
    origin: country.origin,
    seasonality: country.seasonality,
    states: country.states
  };
}

// Update country list
function updateCountryList() {
  const countryListContainer = document.querySelector('.country-list-container');
  const template = document.querySelector('.country-item-template');
  if (!countryListContainer || !template) return;

  // Clear existing list items
  countryListContainer.innerHTML = '';

  // Create new list items
  countryList.sort().forEach(countryName => {
    const countrySlug = countryName.toLowerCase().replace(/ /g, '_');
    const listItem = template.cloneNode(true);
    listItem.classList.remove('country-item-template');
    
    const nameElement = listItem.querySelector('.country-name');
    if (nameElement) nameElement.textContent = countryName;

    listItem.setAttribute('data-country', countrySlug);
    listItem.addEventListener('click', () => selectCountry(countrySlug));

    countryListContainer.appendChild(listItem);
  });
}

// Update map with processed data
function updateMap() {
  const promises = Object.keys(highlightedAreas).map(countrySlug => {
    return fetchCountryData(countrySlug)
      .then(geojson => addCountryLayer(countrySlug, geojson))
      .catch(error => console.error('Error fetching country data:', countrySlug, error));
  });

  Promise.all(promises).then(() => {
    ensureLayerOrder();
  });
}

// Select country
async function selectCountry(countrySlug) {
  const detailsOverlay = document.querySelector('.info-overlay_component-wrapper[map-overlay-container="details"]');
  const isDetailsOverlayVisible = detailsOverlay && !detailsOverlay.classList.contains('hidden');

  if (isDetailsOverlayVisible && countrySlug === selectedCountry) {
    return;
  }

  // Reset all countries to their original state
  Object.keys(highlightedAreas).forEach(slug => {
    if (slug !== countrySlug) {
      map.setPaintProperty(`country-${slug}`, 'fill-color', '#00C35E');
      map.setPaintProperty(`country-${slug}`, 'fill-opacity', 0.5);
    }
    removeStateHighlights(slug);
  });

  if (selectedCountry) {
    const prevSelected = document.querySelector(`.country-item[data-country="${selectedCountry}"]`);
    if (prevSelected) prevSelected.classList.remove('selected');
  }

  const newSelected = document.querySelector(`.country-item[data-country="${countrySlug}"]`);
  if (newSelected) newSelected.classList.add('selected');

  selectedCountry = countrySlug;

  const currentCountryNameElement = document.querySelector('.current-country-name');
  if (currentCountryNameElement) {
    currentCountryNameElement.textContent = highlightedAreas[countrySlug].name;
  }

  highlightCountry(countrySlug);
  zoomToCountry(countrySlug);
  populateCountryInfo(countrySlug);
  await highlightStates(countrySlug);
  ensureLayerOrder();

  if (isDetailsOverlayVisible) {
    updateDetailsOverlay();
  } else {
    showDetailsOverlay();
  }
}

// Function to handle state selection
function selectState(stateName, countrySlug) {
  console.log(`Selected state: ${stateName} in country: ${countrySlug}`);
  // Here you can add logic to update the UI or perform actions when a state is selected
  // For example, you might want to highlight the selected state on the map
}

// Reset view
async function resetView() {
  // Reset all countries to their original state
  Object.keys(highlightedAreas).forEach(slug => {
    map.setPaintProperty(`country-${slug}`, 'fill-color', '#00C35E');
    map.setPaintProperty(`country-${slug}`, 'fill-opacity', 0.5);
    removeStateHighlights(slug);
  });

  if (selectedCountry) {
    const prevSelected = document.querySelector(`.country-item[data-country="${selectedCountry}"]`);
    if (prevSelected) prevSelected.classList.remove('selected');
    selectedCountry = null;
  }

  const currentCountryNameElement = document.querySelector('.current-country-name');
  if (currentCountryNameElement) {
    currentCountryNameElement.textContent = 'Select a country';
  }

  hideDetailsOverlay(() => {
    showNavOverlay();
  });

  // Reset map view
  map.flyTo({
    center: [0, 20],
    zoom: 2
  });

  ensureLayerOrder();
}

// Populate country info
function populateCountryInfo(countrySlug) {
  const countryData = highlightedAreas[countrySlug];
  if (!countryData) return;

  // Update country name
  const countryNameElement = document.querySelector('.current-country-name');
  if (countryNameElement) {
    countryNameElement.textContent = countryData.name;
  }

  // Update description
  const descriptionElement = document.querySelector('.distr-overlay-description');
  if (descriptionElement) {
    descriptionElement.textContent = countryData.description || 'No description available.';
  }

  // Update image with Cloudinary optimization
  const imageElement = document.querySelector('.distr-overlay-image');
  if (imageElement && countryData.imageUrl) {
    let imageUrl = countryData.imageUrl;

    // If it's a Cloudinary URL, optimize it
    if (imageUrl.includes('res.cloudinary.com')) {
      // Only add width transformation if it doesn't already exist
      if (!imageUrl.includes('w_')) {
        imageUrl = imageUrl.replace('/upload/', '/upload/w_600,c_limit/');
      }
    }
    
    imageElement.src = imageUrl;
    imageElement.alt = `${countryData.name} distribution map`;
    imageElement.style.display = 'block';

  } else if (imageElement) {
    imageElement.style.display = 'none';
  }
  
   // Update presence, origin, and seasonality
  const presenceElement = document.querySelector('.data-presence');
  const presenceIndicator = document.querySelector('.presence-indicator'); // Add this line
  const originElement = document.querySelector('.data-origin');
  const seasonalityElement = document.querySelector('.data-seasonality');

  if (presenceElement && originElement && seasonalityElement) {
    // Assuming we're using the first species in the list for these details
    const firstSpeciesSlug = countryData.species[0];
    const speciesData = countryData.details[firstSpeciesSlug];

    presenceElement.textContent = speciesData.presence || 'Unknown';
    originElement.textContent = speciesData.origin || 'Unknown';
    seasonalityElement.textContent = speciesData.seasonality || 'Unknown';

    // Update presence indicator color
    if (presenceIndicator) {
      const presenceColor = getPresenceColor(speciesData.presence);
      presenceIndicator.style.backgroundColor = presenceColor;
    }
  }
  
  // Populate state list
  const stateListContainer = document.querySelector('.state-list-container');
  const stateItemTemplate = document.querySelector('.state-item');
  
  if (stateListContainer && stateItemTemplate) {
    // Clear existing state items
    stateListContainer.innerHTML = '';

    // Get the first species (assuming there's always at least one)
    const firstSpeciesSlug = countryData.species[0];
    const speciesData = countryData.details[firstSpeciesSlug];

    speciesData.states.forEach(state => {
      const stateItem = stateItemTemplate.cloneNode(true);
      stateItem.classList.remove('state-item-template'); // Remove template class if it exists
      
      // Update state name
      const stateNameElement = stateItem.querySelector('.state-name');
      if (stateNameElement) {
        stateNameElement.textContent = state.name;
      }

      // Add click event listener
      stateItem.addEventListener('click', () => selectState(state.name, countrySlug));

      stateListContainer.appendChild(stateItem);
    });
  }

  // Populate species-specific information
  const detailsContainer = document.querySelector('.country-details-container');
  if (detailsContainer) {
    let detailsHTML = '';
    countryData.species.forEach(speciesSlug => {
      const speciesData = countryData.details[speciesSlug];
      detailsHTML += `
        <h3>${speciesSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h3>
        <p>Presence: ${speciesData.presence}</p>
        <p>Origin: ${speciesData.origin}</p>
        <p>Seasonality: ${speciesData.seasonality}</p>
        <p>Population: ${countryData.population || 'Unknown'}</p>
        <h4>States:</h4>
        <ul>
          ${speciesData.states.map(state => `
            <li>${state.name}
              ${state.population ? ` - Population: ${state.population}` : ''}
            </li>
          `).join('')}
        </ul>
      `;
    });
    detailsContainer.innerHTML = detailsHTML;
  }
}

// Helper function to get the color for presence
function getPresenceColor(presence) {
  switch (presence.toLowerCase()) {
    case 'extant':
      return 'var(--brand-green--green-500)';
    case 'possibly extant':
      return 'var(--brand-green--green-200)';
    case 'possibly extinct':
      return 'var(--secondary-orange--orange-500)';
    case 'extinct':
      return 'var(--secondary-red--red-600)';
    case 'uncertain':
    default:
      return 'var(--neutral-grays--gray-400)';
  }
}

// Highlight country
function highlightCountry(countrySlug) {
  // Reset previously highlighted country
  if (selectedCountry && selectedCountry !== countrySlug) {
    map.setPaintProperty(`country-${selectedCountry}`, 'fill-color', '#00C35E');
    map.setPaintProperty(`country-${selectedCountry}`, 'fill-opacity', 0.5);
  }

  // Highlight the selected country
  map.setPaintProperty(`country-${countrySlug}`, 'fill-color', SELECTED_COUNTRY_COLOR);
  map.setPaintProperty(`country-${countrySlug}`, 'fill-opacity', SELECTED_COUNTRY_OPACITY);

  console.log(`Highlighting ${countrySlug}`);
}

// Zoom to country
function zoomToCountry(countrySlug) {
  const source = map.getSource(`country-${countrySlug}`);
  if (source) {
    const features = source._data.features;
    if (features && features.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      features[0].geometry.coordinates.forEach(ring => {
        ring.forEach(coord => bounds.extend(coord));
      });
      map.fitBounds(bounds, { padding: 20, maxZoom: 5 });
    }
  }
}

// Fetch country GeoJSON data
function fetchCountryData(countrySlug) {
  const url = `https://raw.githubusercontent.com/DenisBielat/natural-earth-admin-0-countries/main/geojson/${countrySlug}.geojson`;
  return fetch(url)
    .then(response => response.json())
    .then(data => {
      data.features.forEach((feature, index) => {
        if (!feature.id) feature.id = index;
      });
      return data;
    })
    .catch(error => {
      console.error('Error fetching data for country:', countrySlug, error);
      throw error;
    });
}

function addStateLayer(countrySlug, stateName, geojsonUrl) {
  const stateId = `state-${countrySlug}-${stateName.toLowerCase().replace(/ /g, '_')}`;

  if (!map.getSource(stateId)) {
    map.addSource(stateId, {
      type: 'geojson',
      data: geojsonUrl
    });
  }

  if (!map.getLayer(stateId)) {
    map.addLayer({
      id: stateId,
      type: 'fill',
      source: stateId,
      paint: {
        'fill-color': 'red',
        'fill-opacity': 0.5,
        'fill-outline-color': '#000000'
      }
    }, `country-${countrySlug}`); // This ensures the state layer is above the country layer

    // Add hover effects and popup for the state layer
    map.on('mousemove', stateId, (e) => {
      map.getCanvas().style.cursor = 'pointer';
      const countryName = highlightedAreas[countrySlug].name;
      const features = map.queryRenderedFeatures(e.point, { layers: [stateId] });
      if (!features.length) return;

      const hoveredStateName = features[0].properties.NAME || stateName;
      const popupContent = `${hoveredStateName}, ${countryName}`;

      map.setPaintProperty(stateId, 'fill-opacity', 0.8);

      popup.setLngLat(e.lngLat)
        .setHTML(popupContent)
        .addTo(map);
    });

    map.on('mouseleave', stateId, () => {
      map.getCanvas().style.cursor = '';
      map.setPaintProperty(stateId, 'fill-opacity', 0.5);
      popup.remove();
    });
  }

  ensureLayerOrder();
}

// Add country layer to map
function addCountryLayer(countrySlug, geojson) {
  const layerId = `country-${countrySlug}`;

  if (map.getSource(layerId)) {
    map.getSource(layerId).setData(geojson);
  } else {
    map.addSource(layerId, { type: 'geojson', data: geojson });
    
    map.addLayer({
      id: layerId,
      type: 'fill',
      source: layerId,
      paint: {
        'fill-color': '#00C35E',
        'fill-opacity': 0.5,
        'fill-outline-color': '#000000',
        'fill-opacity-transition': { duration: 300 }
      }
    });

    map.on('mousemove', layerId, (e) => {
      if (e.features.length > 0) {
        map.getCanvas().style.cursor = 'pointer';
        // Only increase opacity if the country is not selected
        if (selectedCountry !== countrySlug) {
          map.setPaintProperty(layerId, 'fill-opacity', 0.8);
        }

        popup.setLngLat(e.lngLat)
          .setHTML(e.features[0].properties.NAME)
          .addTo(map);
      }
    });

    map.on('mouseleave', layerId, () => {
      map.getCanvas().style.cursor = '';
      // Only reset opacity if the country is not selected
      if (selectedCountry !== countrySlug) {
        map.setPaintProperty(layerId, 'fill-opacity', 0.5);
      }
      popup.remove();
    });

    map.on('click', layerId, (e) => {
      if (e.features.length > 0) {
        const clickedCountryName = e.features[0].properties.NAME.toLowerCase().replace(/ /g, '_');
        selectCountry(clickedCountryName);
      }
    });
  }
}

// Show details overlay
function showDetailsOverlay() {
  const navOverlay = document.querySelector('.info-overlay_component-wrapper[map-overlay-container="nav"]');
  const detailsOverlay = document.querySelector('.info-overlay_component-wrapper[map-overlay-container="details"]');
  
  if (navOverlay && detailsOverlay) {
    navOverlay.classList.add('slide-out');

    navOverlay.addEventListener('transitionend', function onTransitionEnd() {
      navOverlay.classList.add('hidden');
      detailsOverlay.classList.remove('hidden');
      
      void detailsOverlay.offsetWidth;
      
      detailsOverlay.classList.add('active');

      navOverlay.removeEventListener('transitionend', onTransitionEnd);
    }, { once: true });
  }
}

// Update details overlay
function updateDetailsOverlay() {
  const detailsOverlay = document.querySelector('.info-overlay_component-wrapper[map-overlay-container="details"]');
  
  if (detailsOverlay) {
    // Remove the slide-out class and add the active class immediately
    detailsOverlay.classList.remove('slide-out');
    detailsOverlay.classList.add('active');
  }
}

// Hide details overlay
function hideDetailsOverlay(callback) {
  const navOverlay = document.querySelector('.info-overlay_component-wrapper[map-overlay-container="nav"]');
  const detailsOverlay = document.querySelector('.info-overlay_component-wrapper[map-overlay-container="details"]');
  
  if (navOverlay && detailsOverlay) {
    detailsOverlay.classList.remove('active');
    detailsOverlay.classList.add('slide-out');

    detailsOverlay.addEventListener('transitionend', function onTransitionEnd() {
      detailsOverlay.classList.add('hidden');
      navOverlay.classList.remove('hidden');
      
      void navOverlay.offsetWidth;
      
      if (typeof callback === 'function') {
        callback();
      }

      detailsOverlay.removeEventListener('transitionend', onTransitionEnd);
    }, { once: true });
  }
}

// Show nav overlay
function showNavOverlay() {
  const navOverlay = document.querySelector('.info-overlay_component-wrapper[map-overlay-container="nav"]');
  
  if (navOverlay) {
    navOverlay.classList.remove('slide-out');
  }
}

async function fetchStateMapping() {
  const url = 'https://raw.githubusercontent.com/DenisBielat/natural-earth-admin-1-states/main/states_provinces_mapping.json';
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching state mapping:', error);
    throw error;
  }
}

async function highlightStates(countrySlug) {
  const countryData = highlightedAreas[countrySlug];
  if (!countryData || !countryData.details) return;

  const stateMapping = await fetchStateMapping();
  const countryStates = stateMapping[countrySlug];

  if (!countryStates) return;

  const speciesSlug = countryData.species[0];
  const states = countryData.details[speciesSlug].states;

  states.forEach(state => {
    const stateData = countryStates.find(s => s.name === state.name);
    if (stateData) {
      addStateLayer(countrySlug, state.name, stateData.geojson_url);
    }
  });

  ensureLayerOrder();
}

async function removeStateHighlights(countrySlug) {
  const countryData = highlightedAreas[countrySlug];
  if (!countryData || !countryData.details) return;

  const speciesSlug = countryData.species[0]; // Assuming we're using the first species
  const states = countryData.details[speciesSlug].states;

  states.forEach(state => {
    const stateId = `state-${countrySlug}-${state.name.toLowerCase().replace(/ /g, '_')}`;
    if (map.getLayer(stateId)) {
      map.removeLayer(stateId);
    }
    if (map.getSource(stateId)) {
      map.removeSource(stateId);
    }
  });
}

function ensureLayerOrder() {
  const layers = map.getStyle().layers;
  const countryLayers = layers.filter(layer => layer.id.startsWith('country-'));
  const stateLayers = layers.filter(layer => layer.id.startsWith('state-'));

  // Move all country layers to the bottom
  countryLayers.forEach(layer => {
    map.moveLayer(layer.id);
  });

  // Move the range data layers above countries but below states
  if (map.getLayer('range-data')) {
    map.moveLayer('range-data');
  }
  if (map.getLayer('range-outline')) {
    map.moveLayer('range-outline');
  }

  // Move all state layers above the range data
  stateLayers.forEach(layer => {
    map.moveLayer(layer.id);
  });

  // Move the occurrences layer to the top if it exists
  if (map.getLayer('occurrences')) {
    map.moveLayer('occurrences');
  }
}

function fetchOccurrenceData(species) {
  const url = `https://api.gbif.org/v1/occurrence/search?scientificName=${encodeURIComponent(species)}&limit=1000`;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      const occurrences = data.results
        .filter(record => record.decimalLongitude !== null && record.decimalLatitude !== null)
        .filter(record => record.decimalLongitude >= -180 && record.decimalLongitude <= 180)
        .filter(record => record.decimalLatitude >= -90 && record.decimalLatitude <= 90)
        .map(record => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [record.decimalLongitude, record.decimalLatitude]
          },
          properties: {
            species: record.species
          }
        }));

      const geojson = {
        type: 'FeatureCollection',
        features: occurrences
      };

      addOccurrencesToMap(geojson);
    })
    .catch(error => console.error('Error fetching occurrence data:', error));
}

function addOccurrencesToMap(geojson) {
  if (map.getSource('occurrences')) {
    map.getSource('occurrences').setData(geojson);
  } else {
    map.addSource('occurrences', {
      type: 'geojson',
      data: geojson
    });

    map.addLayer({
      id: 'occurrences',
      type: 'circle',
      source: 'occurrences',
      paint: {
        'circle-radius': 5,
        'circle-color': '#FF0000',
        'circle-opacity': 0.8
      }
    });
  }

  ensureLayerOrder();
}

function updateGBIFOccurrences() {
        if (currentSpeciesScientificName) {
            fetchOccurrenceData(currentSpeciesScientificName);
        }
    }

function fetchAndAddRangeData(rangeDataUrl) {
  fetch(rangeDataUrl)
    .then(response => response.json())
    .then(data => {
      if (map.getSource('range-data')) {
        map.getSource('range-data').setData(data);
      } else {
        map.addSource('range-data', {
          type: 'geojson',
          data: data
        });

        map.addLayer({
          id: 'range-data',
          type: 'fill',
          source: 'range-data',
          paint: {
            'fill-color': '#FFA500',
            'fill-opacity': 0.3
          }
        });

        map.addLayer({
          id: 'range-outline',
          type: 'line',
          source: 'range-data',
          paint: {
            'line-color': '#FF4500',
            'line-width': 2
          }
        });
      }
      ensureLayerOrder();
    })
    .catch(error => console.error('Error fetching or processing range data:', error));
}

function normalizeString(str) {
  if (typeof str !== 'string') {
    console.warn('Attempted to normalize a non-string value:', str);
    return '';
  }
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

// Add event listener for the close button
document.addEventListener('DOMContentLoaded', () => {
        const closeButton = document.querySelector('.button-close_wrapper[close-target="map-overlay-details"]');
        if (closeButton) {
            closeButton.addEventListener('click', window.resetView);
        }
    });
})(window);

window.addEventListener('load', function() {
    if (typeof window.initializeMap === 'function') {
        window.initializeMap();
    } else {
        console.error('initializeMap function not found');
    }
});
