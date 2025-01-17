async function setup() {
  const showSelector = document.getElementById("show-selector");
  const searchBox = document.getElementById("search-box");
  const episodeSelector = document.getElementById("episode-selector");
  const rootElem = document.getElementById("root");

  let allShows = [];
  let allEpisodes = [];

  rootElem.textContent = "Loading shows, please wait...";

  try {
    // Fetch shows and populate the show selector
    allShows = await fetchShows();
    populateShowDropdown(allShows);
    rootElem.textContent = "";

    // Event listener for show selection
    showSelector.addEventListener("change", async () => {
      const selectedShowId = showSelector.value;

      if (selectedShowId) {
        allEpisodes = await fetchEpisodes(selectedShowId);
        makePageForEpisodes(allEpisodes);
        populateEpisodeDropdown(allEpisodes);
      } else {
        rootElem.innerHTML = "<p>Please select a TV show.</p>";
      }
    });

    // Event listener for search box input
    searchBox.addEventListener("input", () => handleSearch(allEpisodes));

    // Event listener for episode selection
    episodeSelector.addEventListener("change", () => handleEpisodeSelect(allEpisodes));

    // Add click event to navigate to episode page
    rootElem.addEventListener("click", (event) => {
      const clickedCard = event.target.closest(".episode-card");
      if (clickedCard) {
        const episodeUrl = clickedCard.dataset.url;
        if (episodeUrl) {
          window.open(episodeUrl, "_blank");
        }
      }
    });
  } catch (error) {
    rootElem.textContent = "Failed to load shows. Please try again later.";
    console.error(error);
  }
}

async function fetchShows() {
  const response = await fetch("https://api.tvmaze.com/shows");
  if (!response.ok) throw new Error(`Failed to fetch shows: ${response.status}`);
  return (await response.json()).sort((a, b) => a.name.localeCompare(b.name));
}

async function fetchEpisodes(showId) {
  const response = await fetch(`https://api.tvmaze.com/shows/${showId}/episodes`);
  if (!response.ok) throw new Error(`Failed to fetch episodes: ${response.status}`);
  return await response.json();
}

function populateShowDropdown(shows) {
  const dropdown = document.getElementById("show-selector");
  dropdown.innerHTML = '<option value="">Select a TV show...</option>';
  shows.forEach((show) => {
    const option = document.createElement("option");
    option.value = show.id;
    option.textContent = show.name;
    dropdown.appendChild(option);
  });
}

function populateEpisodeDropdown(episodes) {
  const dropdown = document.getElementById("episode-selector");
  dropdown.innerHTML = '<option value="">Select an episode...</option>';
  episodes.forEach((episode) => {
    const option = document.createElement("option");
    option.value = episode.id;
    option.textContent = `${episodeCode(episode.season, episode.number)} - ${episode.name}`;
    dropdown.appendChild(option);
  });
}

function makePageForEpisodes(episodes) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = "";

  episodes.forEach((episode) => {
    const episodeCard = document.createElement("div");
    episodeCard.className = "episode-card";
    episodeCard.dataset.url = episode.url;

    episodeCard.innerHTML = `
      <h3>${episode.name} - ${episodeCode(episode.season, episode.number)}</h3>
      <img src="${episode.image ? episode.image.medium : ""}" alt="${episode.name}" />
      <p>${episode.summary || "No summary available."}</p>
    `;
    rootElem.appendChild(episodeCard);
  });

  updateResultCount(episodes.length);
}

function handleSearch(episodes) {
  const query = document.getElementById("search-box").value.toLowerCase();
  const filteredEpisodes = episodes.filter(
    (episode) =>
      episode.name.toLowerCase().includes(query) ||
      (episode.summary && episode.summary.toLowerCase().includes(query))
  );
  makePageForEpisodes(filteredEpisodes);
  populateEpisodeDropdown(filteredEpisodes);
}

function handleEpisodeSelect(episodes) {
  const selectedEpisodeId = document.getElementById("episode-selector").value;
  if (!selectedEpisodeId) {
    makePageForEpisodes(episodes);
  } else {
    const selectedEpisode = episodes.filter((episode) => episode.id == selectedEpisodeId);
    makePageForEpisodes(selectedEpisode);
  }
}

function episodeCode(season, number) {
  return `S${String(season).padStart(2, "0")}E${String(number).padStart(2, "0")}`;
}

function updateResultCount(count) {
  const resultCountElem = document.getElementById("result-count");
  resultCountElem.textContent = `Displaying ${count} episode(s)`;
}

window.onload = setup;

