//You can edit ALL of the code here
function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
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
    episodeCard.target = "_blank" // Open in a new tab
    episodeCard.classList.add("episode-card");
    // Add episode details
    const episodeCode = `S${String(
      episode.season).padStart(2, "0")}E${String(
      episode.number).padStart(2, "0")}`;
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


setup();


window.onload = setup;
