async function setup() {
  const showSelector = document.getElementById("show-selector");
  const searchBox = document.getElementById("search-box");
  const episodeSelector = document.getElementById("episode-selector");
  const backToShowsLink = document.getElementById("back-to-shows");
  const rootElem = document.getElementById("root");

  let allShows = [];
  let allEpisodes = [];
  let currentShowId = null;

  try {
    // Fetch and display all shows on page load
    allShows = await fetchShows();
    if (allShows.length > 0) {
      displayShows(allShows); // Display all shows
      populateShowDropdown(allShows); // Populate the show dropdown
      updateResultCount(allShows.length); // Update the result count for shows
    } else {
      showNotFound("shows");
    }

    // Event listener for the show selector
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
          backToShowsLink.style.display = ""; // Show the "Back to Shows" link
          episodeSelector.style.display = ""; // Show the episode selector
        } else {
          showNotFound("episodes");
        }
      } else {
        currentShowId = null;
        backToShowsLink.style.display = "none"; // Hide the "Back to Shows" link
        episodeSelector.style.display = "none"; // Hide the episode selector
        displayShows(allShows); // Show all shows again
      }
    });

    // Event listener for the search box
    searchBox.addEventListener("input", () =>
      handleSearch(allShows, allEpisodes, currentShowId)
    );

    // Event listener for the episode selector
    episodeSelector.addEventListener("change", () =>
      handleEpisodeSelect(allEpisodes)
    );

    // Event listener for the "Back to Shows" link
    backToShowsLink.addEventListener("click", () => {
      displayShows(allShows); // Display all shows
      backToShowsLink.style.display = "none"; // Hide the link
      showSelector.value = ""; // Reset the show selector
      episodeSelector.style.display = "none"; // Hide the episode selector
    });

    // Initially hide the episode selector and "Back to Shows" link
    episodeSelector.style.display = "none";
    backToShowsLink.style.display = "none";
  } catch (error) {
    rootElem.textContent = "Failed to load shows. Please try again later.";
    console.error(error);
  }
}

async function fetchShows() {
  const response = await fetch("https://api.tvmaze.com/shows");
  if (!response.ok) {
    throw new Error(`Failed to fetch shows: ${response.status}`);
  }
  const shows = await response.json();
  return shows.sort((a, b) => a.name.localeCompare(b.name));
}

async function fetchEpisodes(showId) {
  const response = await fetch(
    `https://api.tvmaze.com/shows/${showId}/episodes`
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch episodes: ${response.status}`);
  }
  return await response.json();
}

// Display the list of shows
function displayShows(shows) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = ""; // Clear existing content

  shows.forEach((show) => {
    const showCard = document.createElement("div");
    showCard.className = "show-card";
    showCard.dataset.showId = show.id;

    const imageUrl = show.image
      ? show.image.medium
      : "https://via.placeholder.com/210x295?text=No+Image";

    showCard.innerHTML = `
      <h3>${show.name}</h3>
      <img src="${imageUrl}" alt="${show.name}" />
      <p><strong>Genres:</strong> ${show.genres.join(", ") || "N/A"}</p>
      <p><strong>Status:</strong> ${show.status}</p>
      <p><strong>Rating:</strong> ${show.rating?.average || "N/A"}</p>
      <p><strong>Runtime:</strong> ${show.runtime || "N/A"} mins</p>
      <p>${show.summary || "No summary available."}</p>
    `;
        rootElem.appendChild(showCard);

    showCard.addEventListener("click", () => handleShowClick(show.id));
  });

  updateResultCount(shows.length);

}

// Handle clicking on a show to display its episodes
async function handleShowClick(showId) {
  const backToShowsLink = document.getElementById("back-to-shows");
  const episodeSelector = document.getElementById("episode-selector");

  episodeSelector.style.display = "none"; // Hide until episodes are loaded
  const episodes = await fetchEpisodes(showId);
  if (episodes.length > 0) {
    episodeSelector.style.display = ""; // Show episode dropdown
    makePageForEpisodes(episodes);
    populateEpisodeDropdown(episodes);
    backToShowsLink.style.display = ""; // Show the "Back to Shows" link
  } else {
    showNotFound("episodes");
  }

  const showSelector = document.getElementById("show-selector");
  showSelector.value = showId; // Set the dropdown to the clicked show
}

// Render episodes on the page
function makePageForEpisodes(episodes) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = ""; // Clear previous content

  episodes.forEach((episode) => {
    const episodeCard = document.createElement("div");
    episodeCard.className = "episode-card";

    episodeCard.innerHTML = `
      <h4>${formatEpisodeTitle(episode)}</h4>
      <a href="${episode.url}" target="_blank">
        <img src="${
          episode.image
            ? episode.image.medium
            : "https://via.placeholder.com/210x295"
        }" alt="${episode.name}" />
      </a>
      <p>${episode.summary || "No summary available."}</p>
    `;
    rootElem.appendChild(episodeCard);
  });

  updateResultCount(episodes.length);

}

// Format the episode title
function formatEpisodeTitle(episode) {
  const season = episode.season.toString().padStart(2, "0");
  const number = episode.number.toString().padStart(2, "0");
  return `S${season}E${number} - ${episode.name}`;
}

// Populate the show selector dropdown
function populateShowDropdown(shows) {
  const showSelector = document.getElementById("show-selector");
  showSelector.innerHTML = '<option value="">Select a TV show...</option>';

  shows.forEach((show) => {
    const option = document.createElement("option");
    option.value = show.id;
    option.textContent = show.name;
    showSelector.appendChild(option);
  });
}

// Populate the episode selector dropdown
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
// Search functionality for shows and episodes
function handleSearch(allShows, allEpisodes, currentShowId) {
  const searchBox = document.getElementById("search-box");
  const query = searchBox.value.toLowerCase();

  if (currentShowId) {
    const filteredEpisodes = allEpisodes.filter(
      (episode) =>
        episode.name.toLowerCase().includes(query) ||
        (episode.summary && episode.summary.toLowerCase().includes(query))
    );
    makePageForEpisodes(filteredEpisodes);
    populateEpisodeDropdown(filteredEpisodes);
  } else {
    const filteredShows = allShows.filter(
      (show) =>
        show.name.toLowerCase().includes(query) ||
        (show.summary && show.summary.toLowerCase().includes(query)) ||
        show.genres.some((genre) => genre.toLowerCase().includes(query))
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
// Update the result count
function updateResultCount(count) {
  const resultCountElem = document.getElementById("result-count");
  resultCountElem.textContent = count > 0 ? `Displaying ${count} item(s)` : "";
}

// Show a "not found" message
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
