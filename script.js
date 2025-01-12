//You can edit ALL of the code here
function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);

  setupSearch(allEpisodes);
  setupEpisodeSelector(allEpisodes);
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

    const episodeCode = `S${String(episode.season).padStart(2, "0")}E${String(

      episode.number

    ).padStart(2, "0")}`;

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
}


// Live search functionality
function setupSearch(episodes) {
  const rootElem = document.getElementById("root");

  // Create a search box
  const searchBox = document.createElement("input");
  searchBox.id = "search-box";
  searchBox.placeholder = "Search episodes...";
  searchBox.type = "text";

  // Create a result count display
  const resultCount = document.createElement("p");
  resultCount.id = "result-count";

  // Insert the search box and result count before the episode list
  rootElem.prepend(resultCount);
  rootElem.prepend(searchBox);

  searchBox.addEventListener("input", () => {
    const searchTerm = searchBox.value.toLowerCase();
    const filteredEpisodes = episodes.filter(
      (episode) =>
        episode.name.toLowerCase().includes(searchTerm) ||
        episode.summary.toLowerCase().includes(searchTerm)
    );

    // Update the episode list and result count
    makePageForEpisodes(filteredEpisodes);
    resultCount.textContent = `Displaying ${filteredEpisodes.length} of ${episodes.length} episode(s).`;
  });
}

// Episode selector dropdown
function setupEpisodeSelector(episodes) {
  const rootElem = document.getElementById("root");

  // Create a dropdown
  const episodeSelector = document.createElement("select");
  episodeSelector.id = "episode-selector";

  // Add an "all episodes" option
  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = "Show All Episodes";
  episodeSelector.appendChild(allOption);

  // Populate dropdown with episode options
  episodes.forEach((episode) => {
    const option = document.createElement("option");
    option.value = episode.id;
    option.textContent = `S${String(episode.season).padStart(2, "0")}E${String(
      episode.number
    ).padStart(2, "0")} - ${episode.name}`;
    episodeSelector.appendChild(option);
  });

  // Insert the selector above the episodes container
  rootElem.prepend(episodeSelector);

  // Add event listener for dropdown selection
  episodeSelector.addEventListener("change", () => {
    if (episodeSelector.value === "all") {
      makePageForEpisodes(episodes); // Show all episodes
    } else {
      const selectedEpisode = episodes.find(
        (ep) => ep.id.toString() === episodeSelector.value
      );
      makePageForEpisodes([selectedEpisode]); // Show only the selected episode
    }
  });
}

// Initialize the setup
window.onload = setup;
