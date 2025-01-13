function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
  addSearchAndSelector(allEpisodes);
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");
  rootElem.innerHTML = ""; // Clear the root element

  const episodesContainer = document.createElement("div");
  episodesContainer.classList.add("episodes-container");

  episodeList.forEach((episode) => {
    const episodeCard = document.createElement("a");
    episodeCard.href = episode.url; // Link to the episode's URL
    episodeCard.target = "_blank";
    episodeCard.classList.add("episode-card");

    const episodeCode = `S${String(episode.season).padStart(2, "0")}E${String(
      episode.number
    ).padStart(2, "0")}`;
    episodeCard.innerHTML = `
      <h3>${episode.name} - ${episodeCode}</h3>
      <img src="${episode.image.medium}" alt="${episode.name}">
      <p>${episode.summary}</p>
    `;

    episodesContainer.appendChild(episodeCard);
  });

  rootElem.appendChild(episodesContainer);
}

function addSearchAndSelector(allEpisodes) {
  // Add search bar
  const searchInput = document.createElement("input");
  searchInput.type = "text";
  searchInput.placeholder = "Search for episodes...";
  searchInput.id = "search-input";
  document.body.prepend(searchInput);

  // Add episode selector dropdown
  const episodeSelector = document.createElement("select");
  episodeSelector.id = "episode-selector";
  document.body.prepend(episodeSelector);

  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = "All Episodes";
  episodeSelector.appendChild(allOption);

  updateEpisodeSelector(allEpisodes); // Populate the dropdown initially

  // Add event listeners
  searchInput.addEventListener("input", () =>
    handleSearch(allEpisodes, searchInput, episodeSelector)
  );

  episodeSelector.addEventListener("change", (event) =>
    handleSelectorChange(event, allEpisodes)
  );
}

function updateEpisodeSelector(episodeList) {
  const episodeSelector = document.getElementById("episode-selector");
  episodeSelector.innerHTML = ""; // Clear current options

  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = "All Episodes";
  episodeSelector.appendChild(allOption);

  episodeList.forEach((episode) => {
    const option = document.createElement("option");
    const episodeCode = `S${String(episode.season).padStart(2, "0")}E${String(
      episode.number
    ).padStart(2, "0")}`;
    option.value = episodeCode;
    option.textContent = `${episodeCode} - ${episode.name}`;
    episodeSelector.appendChild(option);
  });
}

function handleSearch(allEpisodes, searchInput, episodeSelector) {
  const searchTerm = searchInput.value.toLowerCase();

  // Filter episodes based on search term
  const filteredEpisodes = allEpisodes.filter(
    (episode) =>
      episode.name.toLowerCase().includes(searchTerm) ||
      episode.summary.toLowerCase().includes(searchTerm)
  );

  makePageForEpisodes(filteredEpisodes); // Update displayed episodes
  updateEpisodeSelector(filteredEpisodes); // Update selector options

  // Display match count
  const matchCountElem = document.getElementById("match-count");
  if (!matchCountElem) {
    const countDisplay = document.createElement("div");
    countDisplay.id = "match-count";
    document.body.prepend(countDisplay);
  }
  document.getElementById(
    "match-count"
  ).textContent = `Displaying ${filteredEpisodes.length} of ${allEpisodes.length} episodes`;
}

function handleSelectorChange(event, allEpisodes) {
  const selectedValue = event.target.value;

  if (selectedValue === "all") {
    makePageForEpisodes(allEpisodes); // Show all episodes
  } else {
    const selectedEpisode = allEpisodes.find((episode) => {
      const episodeCode = `S${String(episode.season).padStart(2, "0")}E${String(
        episode.number
      ).padStart(2, "0")}`;
      return episodeCode === selectedValue;
    });

    if (selectedEpisode) {
      makePageForEpisodes([selectedEpisode]); // Display only the selected episode
    }
  }
}

window.onload = setup;
