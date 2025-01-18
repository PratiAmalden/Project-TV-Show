async function setup() {
  const showSelector = document.getElementById("show-selector");
  const searchBox = document.getElementById("search-box");
  const episodeSelector = document.getElementById("episode-selector");
  const rootElem = document.getElementById("root");

  let allShows = [];
  let allEpisodes = [];
  let currentShowId = null;

  try {
    // Fetch and display all shows on page load
    allShows = await fetchShows();
    if (allShows.length > 0) {
      displayShows(allShows);
      populateShowDropdown(allShows);
    } else {
      showNotFound("shows");
    }

    // Event listener for show selection dropdown
    showSelector.addEventListener("change", async () => {
      const selectedShowId = showSelector.value;

      if (selectedShowId) {
        currentShowId = selectedShowId;
        episodeSelector.style.display = "none"; // Hide until episodes are loaded
        allEpisodes = await fetchEpisodes(selectedShowId);
        if (allEpisodes.length > 0) {
          episodeSelector.style.display = ""; // Show episode dropdown
          makePageForEpisodes(allEpisodes);
          populateEpisodeDropdown(allEpisodes);
        } else {
          showNotFound("episodes");
        }
      } else {
        currentShowId = null;
        episodeSelector.style.display = "none"; // Hide if no show selected
        displayShows(allShows);
      }
    });

    // Event listener for search box
    searchBox.addEventListener("input", () =>
      handleSearch(allShows, allEpisodes, currentShowId)
    );

    // Event listener for episode selection dropdown
    episodeSelector.addEventListener("change", () =>
      handleEpisodeSelect(allEpisodes)
    );

    // Hide the episode selector initially
    episodeSelector.style.display = "none";
  } catch (error) {
    rootElem.textContent = "Failed to load shows. Please try again later.";
    console.error(error);
  }
}

async function fetchShows() {
  const url = "https://api.tvmaze.com/shows";
  const response = await fetch(url);
  return response.json();
}

async function fetchEpisodes(showId) {
  const url = `https://api.tvmaze.com/shows/${showId}/episodes`;
  const response = await fetch(url);
  return response.json();
}

function displayShows(shows) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = ""; // Clear previous content

  if (shows.length === 0) {
    showNotFound("shows");
    return;
  }

  shows.forEach((show) => {
    const showCard = document.createElement("div");
    showCard.className = "show-card";
    showCard.dataset.showId = show.id;

    const imageUrl = show.image ? show.image.medium : "https://via.placeholder.com/210x295?text=No+Image";

    showCard.innerHTML = `
      <h3>${show.name}</h3>
      <img src="${imageUrl}" alt="${show.name}" />
      <p>${show.summary || "No summary available."}</p>
    `;
    rootElem.appendChild(showCard);

    // Add event listener for clicking the show card
    showCard.addEventListener("click", () => handleShowClick(show.id));
  });

  updateResultCount(shows.length);
}

async function handleShowClick(showId) {
  const episodeSelector = document.getElementById("episode-selector");

  episodeSelector.style.display = "none"; // Hide until episodes are loaded
  const episodes = await fetchEpisodes(showId);
  if (episodes.length > 0) {
    episodeSelector.style.display = ""; // Show episode dropdown
    makePageForEpisodes(episodes);
    populateEpisodeDropdown(episodes);
  } else {
    showNotFound("episodes");
  }

  const showSelector = document.getElementById("show-selector");
  showSelector.value = showId; // Set the dropdown to the clicked show
}

function makePageForEpisodes(episodes) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = ""; // Clear previous content

  if (!episodes || episodes.length === 0) {
    showNotFound("episodes");
    return;
  }

  episodes.forEach((episode) => {
    const episodeCard = document.createElement("div");
    episodeCard.className = "episode-card";

    episodeCard.innerHTML = `
      <h4>${formatEpisodeTitle(episode)}</h4>
      <a href="${episode.url}" target="_blank">
        <img src="${episode.image ? episode.image.medium : ""}" alt="${episode.name}" />
      </a>
      <p>${episode.summary || "No summary available."}</p>
    `;
    rootElem.appendChild(episodeCard);
  });

  updateResultCount(episodes.length);
}

function formatEpisodeTitle(episode) {
  const season = episode.season.toString().padStart(2, "0");
  const number = episode.number.toString().padStart(2, "0");
  return `S${season}E${number} - ${episode.name}`;
}

function populateShowDropdown(shows) {
  const showSelector = document.getElementById("show-selector");
  showSelector.innerHTML = '<option value="">Select a TV show...</option>';

  if (shows.length === 0) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "No shows found";
    showSelector.appendChild(option);
    return;
  }

  shows.forEach((show) => {
    const option = document.createElement("option");
    option.value = show.id;
    option.textContent = show.name;
    showSelector.appendChild(option);
  });
}

function populateEpisodeDropdown(episodes) {
  const episodeSelector = document.getElementById("episode-selector");
  episodeSelector.innerHTML = '<option value="">Select an episode...</option>';

  episodes.forEach((episode) => {
    const option = document.createElement("option");
    option.value = episode.id;
    option.textContent = formatEpisodeTitle(episode);
    episodeSelector.appendChild(option);
  });
}

function handleSearch(allShows, allEpisodes, currentShowId) {
  const searchBox = document.getElementById("search-box");
  const query = searchBox.value.toLowerCase();

  if (currentShowId) {
    const filteredEpisodes = allEpisodes.filter((episode) =>
      episode.name.toLowerCase().includes(query) ||
      (episode.summary && episode.summary.toLowerCase().includes(query))
    );
    makePageForEpisodes(filteredEpisodes);
    populateEpisodeDropdown(filteredEpisodes);
  } else {
    const filteredShows = allShows.filter((show) =>
      show.name.toLowerCase().includes(query) ||
      (show.summary && show.summary.toLowerCase().includes(query))
    );
    displayShows(filteredShows);
    populateShowDropdown(filteredShows); // Dynamically update the show dropdown
  }
}

function handleEpisodeSelect(episodes) {
  const episodeSelector = document.getElementById("episode-selector");
  const selectedEpisodeId = episodeSelector.value;

  if (selectedEpisodeId) {
    const selectedEpisode = episodes.find(
      (ep) => ep.id === parseInt(selectedEpisodeId)
    );

    if (selectedEpisode) {
      window.open(selectedEpisode.url, "_blank");
    }
  }
}

function updateResultCount(count) {
  const resultCountElem = document.getElementById("result-count");
  resultCountElem.textContent = count > 0 ? `Displaying ${count} item(s)` : "";
}

function showNotFound(type) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = `<p>No ${type} found.</p>`;
  updateResultCount(0);

  if (type === "shows") {
    const showSelector = document.getElementById("show-selector");
    populateShowDropdown([]); // Populate dropdown with "No shows found"
  } else if (type === "episodes") {
    document.getElementById("episode-selector").style.display = "none";
  }
}

window.onload = setup;
