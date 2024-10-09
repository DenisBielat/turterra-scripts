// Select the search input and results container
const searchInput = document.querySelector('#field_search-turtle-profiles');
const resultsContainer = document.querySelector('.js-turtleprofile-autocomplete-results');
const closeIcon = document.querySelector('.search-bar_close-icon');

let allSpecies = [];

// Fetch all turtle species from the local server
fetch('https://turterra.vercel.app/webflow/65a871ba95802374d1170989')  // Your Turtle Species collection ID
  .then(response => response.json())
  .then(data => {
    allSpecies = data.items.map(item => ({
      id: item.id,
      name: item.fieldData.name || '',
      slug: item.fieldData.slug || '',
      species: item.fieldData.species || '',
      subspecies: item.fieldData.subspecies || '',
      otherNames: item.fieldData['other-common-names'] || '',
      profileImage: item.fieldData['profile-image']?.url || 'https://cdn.prod.website-files.com/plugins/Basic/assets/placeholder.60f9b1840c.svg'
    }));
    console.log('Fetched species:', allSpecies);
  })
  .catch(error => console.error('Error fetching turtle species:', error));

// Debounce function
function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

// Function to create a result item
function createResultItem(species) {
  const resultItem = document.createElement('div');
  resultItem.classList.add('search-result-item');
  resultItem.innerHTML = `
    <div class="search-result-item_content-left">
        <img src="${species.profileImage}" loading="lazy" alt="${species.name}" class="search-result-item_avatar">
    </div>
    <div class="search-result-item_content-right">
      <div class="search-result-item_common-name">${species.name}</div>
      <div class="search-result-item_species-name">${species.species}${species.subspecies ? ' ' + species.subspecies : ''}</div>
    </div>
  `;

  resultItem.addEventListener('click', function() {
    searchInput.value = species.name;
    hideResults();
    updateCloseIconVisibility();
    // Navigate to the species profile page
    window.location.href = `/turtle-profiles/${species.slug}`;
  });

  return resultItem;
}

// Function to show results container
function showResults() {
  resultsContainer.style.display = 'flex';
}

// Function to hide results container
function hideResults() {
  resultsContainer.style.display = 'none';
}

// Function to display a message in the results container
function displayMessage(message) {
  resultsContainer.innerHTML = `<div class="search-message">${message}</div>`;
  showResults();
}

// Function to update close icon visibility
function updateCloseIconVisibility() {
  closeIcon.style.display = searchInput.value.trim().length > 0 ? 'block' : 'none';
}

// Function to perform search
const performSearch = debounce(function() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  
  if (searchTerm.length === 0) {
    hideResults();
    return;
  }

  if (searchTerm.length < 3) {
    displayMessage("Please use at least three characters.");
    return;
  }

  const matchingSpecies = allSpecies.filter(species => 
    species.name.toLowerCase().includes(searchTerm) ||
    species.species.toLowerCase().includes(searchTerm) ||
    (species.subspecies && species.subspecies.toLowerCase().includes(searchTerm)) ||
    (species.otherNames && species.otherNames.toLowerCase().includes(searchTerm))
  );

  if (matchingSpecies.length === 0) {
    displayMessage("No results match your search. Please try again.");
    return;
  }

  // Clear previous results
  resultsContainer.innerHTML = '';
  
  // Display matching results
  matchingSpecies.forEach(species => {
    const resultItem = createResultItem(species);
    resultsContainer.appendChild(resultItem);
  });

  showResults();
}, 300); // 300ms delay

// Add event listener to the search input
searchInput.addEventListener('input', function() {
  updateCloseIconVisibility();
  performSearch();
});

// Close results when clicking outside
document.addEventListener('click', function(event) {
  if (!searchInput.contains(event.target) && !resultsContainer.contains(event.target)) {
    hideResults();
  }
});

// Clear search input when clicking the close icon
closeIcon.addEventListener('click', function() {
  searchInput.value = '';
  hideResults();
  updateCloseIconVisibility();
});

// Prevent form submission
document.querySelector('#wf-form-Search-Turtle-Profiles').addEventListener('submit', function(event) {
  event.preventDefault();
});

// Initially hide the results container and close icon
hideResults();
updateCloseIconVisibility();
