async function setup() {
  const rootElem = document.getElementById("root");
  rootElem.textContent = "Loading episodes, please wait..";

  try {
    const allEpisodes = await fetchEpisodes();
    makePageForEpisodes(allEpisodes);

    // Setup live search and episode selector
    setupSearchAndSelector(allEpisodes);
  } catch (error) {
    rootElem.textContent = "Failed to load episodes. Please try again later.";
  }
  
}

async function fetchEpisodes() {
  const response = await fetch("https://api.tvmaze.com/shows/82/episodes");

  if (!response) {
    throw new Error(`Failed to fetch episodes: ${response.status}`);
  }

  const data = await response.json();
  return data;
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");

  // Clear the root element before populating
  rootElem.innerHTML = "";

  // Create a flex container for the episodes
  const episodesContainer = document.createElement("div");
  episodesContainer.classList.add("episodes-container");

  episodeList.forEach((episode) => {
    // Create a clickable container (anchor tag)
    const episodeCard = document.createElement("a");
    episodeCard.href = episode.url; // Link to the episode's URL
    episodeCard.target = "_blank"; // Open in a new tab
    episodeCard.classList.add("episode-card");

    // Add episode details
    const episodeCode = `S${String(episode.season).padStart(2, "0")}E${String(episode.number).padStart(2, "0")}`;
    episodeCard.innerHTML = `
      <h3>${episode.name} - ${episodeCode}</h3>
      <img src="${episode.image.medium}" alt="${episode.name}">
      <p>${episode.summary}</p>
    `;

    // Append the card to the episodes container
    episodesContainer.appendChild(episodeCard);
  });

  // Append the container to the root element
  rootElem.appendChild(episodesContainer);

  // Update the result count
  updateResultCount(episodeList.length);
}

function setupSearchAndSelector(allEpisodes) {
  const searchBox = document.getElementById("search-box");
  const episodeSelector = document.getElementById("episode-selector");

  // Populate the dropdown with episode options
  populateDropdown(allEpisodes);

  // Add event listeners for search and dropdown
  searchBox.addEventListener("input", () => handleSearch(allEpisodes));
  episodeSelector.addEventListener("change", () => handleEpisodeSelect(allEpisodes));
}

function populateDropdown(episodeList) {
  const dropdown = document.getElementById("episode-selector");
  dropdown.innerHTML = '<option value="">Select an episode...</option>';

  episodeList.forEach((episode) => {
    const episodeCode = `S${String(episode.season).padStart(2, "0")}E${String(episode.number).padStart(2, "0")}`;
    const option = document.createElement("option");
    option.value = episodeCode;
    option.textContent = `${episodeCode} - ${episode.name}`;
    dropdown.appendChild(option);
  });
}

function handleSearch(episodeList) {
  const searchBox = document.getElementById("search-box");
  const query = searchBox.value.toLowerCase();

  const filteredEpisodes = episodeList.filter(
    (episode) =>
      episode.name.toLowerCase().includes(query) ||
      episode.summary.toLowerCase().includes(query)
  );

  makePageForEpisodes(filteredEpisodes);
  populateDropdown(filteredEpisodes); // Update dropdown based on search
}

function handleEpisodeSelect(episodeList) {
  const dropdown = document.getElementById("episode-selector");
  const selectedCode = dropdown.value;

  if (!selectedCode) {
    makePageForEpisodes(episodeList); // Show all episodes if none is selected
  } else {
    const selectedEpisode = episodeList.filter(
      (episode) =>
        `S${String(episode.season).padStart(2, "0")}E${String(episode.number).padStart(2, "0")}` === selectedCode
    );
    makePageForEpisodes(selectedEpisode);
  }
}

function updateResultCount(count) {
  const resultCountElem = document.getElementById("result-count");
  resultCountElem.textContent = `Displaying ${count} episode(s)`;
}

window.onload = setup;
