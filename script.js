// Global Variables
let allShows = [];
let allEpisodes = [];
let currentShowId = null;
const cachedEpisodes = {};

// Setup the application
async function setup() {
  const showSelector = document.getElementById("show-selector");
  const searchBox = document.getElementById("search-box");
  const episodeSelector = document.getElementById("episode-selector");
  const backToShowsLink = document.getElementById("back-to-shows");
  const rootElem = document.getElementById("root");

  try {
    // Fetch and display all shows
    allShows = await fetchShows();
    if (allShows.length > 0) {
      displayShows(allShows);
      populateShowDropdown(allShows);
      updateResultCount(allShows.length);
    }

    // Event Listeners
    showSelector.addEventListener("change", async () => {
      const selectedShowId = showSelector.value;
      if (selectedShowId) {
        currentShowId = selectedShowId;
        if (!cachedEpisodes[currentShowId]) {
          cachedEpisodes[currentShowId] = await fetchEpisodes(selectedShowId);
        }
        allEpisodes = cachedEpisodes[currentShowId];
        makePageForEpisodes(allEpisodes);
        populateEpisodeDropdown(allEpisodes);
        episodeSelector.style.display = "block";
        backToShowsLink.style.display = "block";
        rootElem.classList.add("episodes-view");
      } else {
        backToShows();
      }
    });

    searchBox.addEventListener("input", () => {
      handleSearch(allShows, allEpisodes, currentShowId);
    });

    episodeSelector.addEventListener("change", () => {
      handleEpisodeSelect(allEpisodes);
    });

    backToShowsLink.addEventListener("click", (e) => {
      e.preventDefault();
      backToShows();
    });

    backToShowsLink.style.display = "none";
    episodeSelector.style.display = "none";
  } catch (error) {
    rootElem.innerHTML = `<p class="error">Failed to load shows. Please try again later.</p>`;
    console.error(error);
  }
}

// Fetch shows from API
async function fetchShows() {
  const response = await fetch("https://api.tvmaze.com/shows");
  if (!response.ok)
    throw new Error(`Failed to fetch shows: ${response.status}`);
  return (await response.json()).sort((a, b) => a.name.localeCompare(b.name));
}

// Fetch episodes from API
async function fetchEpisodes(showId) {
  const response = await fetch(
    `https://api.tvmaze.com/shows/${showId}/episodes`
  );
  if (!response.ok)
    throw new Error(`Failed to fetch episodes: ${response.status}`);
  return await response.json();
}

// Display all shows
function displayShows(shows) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = "";
  shows.forEach((show) => {
    const showCard = document.createElement("div");
    showCard.className = "show-card";
    showCard.innerHTML = `
    <h3>${show.name}</h3>
    <img src="${show.image?.medium || "placeholder.jpg"}" alt="${
      show.name
    }" width="300" height="400" loading="lazy">
    <p><strong>Genres:</strong> ${show.genres.join(", ") || "N/A"}</p>
    <p><strong>Status:</strong> ${show.status}</p>
    <p><strong>Rating:</strong> ${show.rating?.average || "N/A"}</p>
    <p><strong>Runtime:</strong> ${show.runtime || "N/A"} mins</p>
    <p>${show.summary || "No summary available."}</p>
  `;
    showCard.addEventListener("click", () => handleShowClick(show.id));
    rootElem.appendChild(showCard);
  });
}

// Handle show click
async function handleShowClick(showId) {
  const episodeSelector = document.getElementById("episode-selector");
  const backToShowsLink = document.getElementById("back-to-shows");

  if (!cachedEpisodes[showId]) {
    cachedEpisodes[showId] = await fetchEpisodes(showId);
  }
  allEpisodes = cachedEpisodes[showId];
  currentShowId = showId;

  makePageForEpisodes(allEpisodes);
  populateEpisodeDropdown(allEpisodes);
  episodeSelector.style.display = "block";
  backToShowsLink.style.display = "block";
}

// Display episodes
function makePageForEpisodes(episodes) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = "";
  episodes.forEach((episode) => {
    const episodeCard = document.createElement("div");
    episodeCard.className = "episode-card";
    episodeCard.innerHTML = `
      <h4>${formatEpisodeTitle(episode)}</h4>
      <img src="${
        episode.image?.medium || "https://via.placeholder.com/210x295"
      }" alt="${episode.name}">
      <p>${episode.summary || "No summary available."}</p>
    `;
    rootElem.appendChild(episodeCard);
  });
  updateResultCount(episodes.length);
}

// Format episode title
function formatEpisodeTitle(episode) {
  return `S${String(episode.season).padStart(2, "0")}E${String(
    episode.number
  ).padStart(2, "0")} - ${episode.name}`;
}

// Back to shows
function backToShows() {
  const episodeSelector = document.getElementById("episode-selector");
  const backToShowsLink = document.getElementById("back-to-shows");
  const showSelector = document.getElementById("show-selector");

  displayShows(allShows);
  showSelector.value = "";
  episodeSelector.style.display = "none";
  backToShowsLink.style.display = "none";
  currentShowId = null;
}

// Populate show dropdown
function populateShowDropdown(shows) {
  const showSelector = document.getElementById("show-selector");
  showSelector.innerHTML = '<option value="">Select a Show...</option>';
  shows.forEach((show) => {
    const option = document.createElement("option");
    option.value = show.id;
    option.textContent = show.name;
    showSelector.appendChild(option);
  });
}

// Populate episode dropdown
function populateEpisodeDropdown(episodes) {
  const episodeSelector = document.getElementById("episode-selector");
  episodeSelector.innerHTML = '<option value="">Select an Episode...</option>';
  episodes.forEach((episode) => {
    const option = document.createElement("option");
    option.value = episode.id;
    option.textContent = formatEpisodeTitle(episode);
    episodeSelector.appendChild(option);
  });
}

// Handle search functionality
function handleSearch(allShows, allEpisodes, currentShowId) {
  const searchBox = document.getElementById("search-box");
  const query = searchBox.value.toLowerCase();

  if (currentShowId) {
    const filteredEpisodes = allEpisodes.filter(
      (episode) =>
        episode.name.toLowerCase().includes(query) ||
        episode.summary?.toLowerCase().includes(query)
    );
    makePageForEpisodes(filteredEpisodes);
    populateEpisodeDropdown(filteredEpisodes);
  } else {
    const filteredShows = allShows.filter(
      (show) =>
        show.name.toLowerCase().includes(query) ||
        show.summary?.toLowerCase().includes(query) ||
        show.genres.some((genre) => genre.toLowerCase().includes(query))
    );
    displayShows(filteredShows);
  }
}

// Handle episode select
function handleEpisodeSelect(episodes) {
  const episodeSelector = document.getElementById("episode-selector");
  const selectedEpisodeId = episodeSelector.value;

  if (selectedEpisodeId) {
    const episode = episodes.find(
      (ep) => ep.id === parseInt(selectedEpisodeId)
    );
    if (episode) {
      window.open(episode.url, "_blank");
    }
  }
}

// Update result count
function updateResultCount(count) {
  const resultCountElem = document.getElementById("result-count");
  resultCountElem.textContent = count > 0 ? `Displaying ${count} item(s)` : "";
}

// Initialize the application
window.onload = setup;
