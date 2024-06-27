// Define the md5 function
function md5(value) {
    return CryptoJS.MD5(value).toString();
}

const publicKey = 'db91c98dafe7226d610a60b70cb9a701';
const privateKey = 'ca66b7a8d28f1eaebf31d83a203d5d031cf14c89';
const ts = new Date().getTime();
const hash = md5(ts + privateKey + publicKey).toString();

const searchBar = document.getElementById('searchBar');
const superheroContainer = document.getElementById('superheroContainer');
const favoriteIcon = document.getElementById('favoriteIcon');
const favoriteIndicator = document.getElementById('favoriteIndicator');
const favoriteModal = document.getElementById('favoriteModal');
const favoriteList = document.getElementById('favoriteList');
const closeModalButton = document.getElementsByClassName('close')[0];

let superheroes = []; // Declare superheroes array globally

document.addEventListener('DOMContentLoaded', () => {
    fetchInitialSuperheroes();
    updateFavoriteIcon(); // Ensure favorite icon is updated on load
});
searchBar.addEventListener('input', searchSuperheroes);
favoriteIcon.addEventListener('click', showFavoriteDetails);
closeModalButton.addEventListener('click', () => favoriteModal.style.display = 'none');

// Initialize favorite superheroes from localStorage
let favoriteSuperheroes = JSON.parse(localStorage.getItem('favoriteSuperheroes')) || [];

async function fetchInitialSuperheroes() {
    const response = await fetch(`https://gateway.marvel.com:443/v1/public/characters?ts=${ts}&apikey=${publicKey}&hash=${hash}`);
    const data = await response.json();
    console.log(data,"data")
    superheroes = data.data.results; // Assign data to the global superheroes array
    displaySuperheroes(superheroes);
}

async function searchSuperheroes() {
    const query = searchBar.value.trim().toLowerCase();
    if (query === '') {
        fetchInitialSuperheroes();
    } else {
        const response = await fetch(`https://gateway.marvel.com:443/v1/public/characters?nameStartsWith=${query}&ts=${ts}&apikey=${publicKey}&hash=${hash}`);
        const data = await response.json();
        superheroes = data.data.results; // Assign data to the global superheroes array
        displaySuperheroes(superheroes)
    }
}

function displaySuperheroes(superheroes) {
    superheroContainer.innerHTML = ''; // Clear previous content
    let row = document.createElement('div');
    row.classList.add('row');

    superheroes.forEach((superhero, index) => {
        // Create card element
        let card = document.createElement('div');
        card.classList.add('superhero');
        card.innerHTML = `
            <h3>${superhero.name}</h3>
            <img src="${superhero.thumbnail.path}/portrait_uncanny.${superhero.thumbnail.extension}" alt="${superhero.name}">
            <button class="favorite" onclick="addToFavorites(event, ${superhero.id})">Favorite</button>
        `;

        // Add click event listener to show details
        card.addEventListener('click', () => {
            showSuperheroDetails(superhero.id);
        });

        // Append card to current row
        row.appendChild(card);

        // If 3 cards are added or it's the last superhero, append row and start a new one
        if ((index + 1) % 3 === 0 || index === superheroes.length - 1) {
            superheroContainer.appendChild(row);
            row = document.createElement('div');
            row.classList.add('row');
        }
    });
}

function addToFavorites(event, id) {
    event.stopPropagation(); // Prevent the click event from propagating to the parent div
    console.log("function is called");

    // Find the superhero by id
    const superhero = superheroes.find(hero => hero.id === id);
    console.log('Superhero to add:', superhero);

    // Check if superhero is already in favorites
    if (!favoriteSuperheroes.find(hero => hero.id === superhero.id)) {
        favoriteSuperheroes.push(superhero);
        console.log('Updated favoriteSuperheroes:', favoriteSuperheroes);

        // Update localStorage
        localStorage.setItem('favoriteSuperheroes', JSON.stringify(favoriteSuperheroes));

        // Update favorite icon
        updateFavoriteIcon();
    }
}

function updateFavoriteIcon() {
    // Update favoriteSuperheroes from localStorage
    favoriteSuperheroes = JSON.parse(localStorage.getItem('favoriteSuperheroes')) || [];
    console.log(favoriteSuperheroes, "favoriteSuperheroes");

    const favoriteCount = favoriteSuperheroes.length;

    // Check if there are any favorite superheroes
    if (favoriteCount > 0) {
        favoriteIcon.style.display = 'block';
        const favoriteCountElement = document.getElementById('favoriteCount');
        favoriteCountElement.textContent = favoriteCount;
        favoriteIndicator.addEventListener('click', showFavoriteDetails); // Add event listener to show details
    } else {
        favoriteIcon.style.display = 'none';
    }
}

async function showFavoriteDetails() {
    const favoriteModal = document.getElementById('favoriteModal');
    favoriteModal.style.display = 'block'; // Show the modal

    const favoriteCardsContainer = document.getElementById('favoriteCards');
    favoriteCardsContainer.innerHTML = ''; // Clear previous cards

    if (favoriteSuperheroes.length === 0) {
        favoriteCardsContainer.innerHTML = '<p>No favorite superheroes added.</p>';
    } else {
        let row;
        let cardCount = 0;

        for (const hero of favoriteSuperheroes) {
            try {
                // Fetch detailed superhero data from API
                const response = await fetch(`${hero.resourceURI}?ts=${ts}&apikey=${publicKey}&hash=${hash}`);
                const data = await response.json();
                const details = data.data.results[0];

                // Extract necessary details
                const name = details.name;
                const description = details.description || 'No description available.';
                const thumbnail = `${details.thumbnail.path}/portrait_uncanny.${details.thumbnail.extension}`;

                // Create card HTML structure
                const card = document.createElement('div');
                card.classList.add('card');

                const image = document.createElement('img');
                image.src = thumbnail;
                image.alt = name + ' image';
                card.appendChild(image);

                const heroName = document.createElement('h3');
                heroName.textContent = name;
                card.appendChild(heroName);

                const heroDescription = document.createElement('p');
                heroDescription.textContent = description;
                card.appendChild(heroDescription);

                // Create a "Show More" button to display additional details
                const showMoreButton = document.createElement('button');
                showMoreButton.textContent = 'Show More';
                showMoreButton.classList.add('show-more-button');
                showMoreButton.addEventListener('click', () => toggleDetails(showMoreButton, details, card));
                card.appendChild(showMoreButton);

                // Append card to the current row or create a new row if necessary
                if (cardCount % 3 === 0) {
                    row = document.createElement('div');
                    row.classList.add('row');
                    favoriteCardsContainer.appendChild(row);
                }
                row.appendChild(card);
                cardCount++;
            } catch (error) {
                console.error('Error fetching superhero details:', error);
                // Display error message or handle the error as needed
            }
        }
    }
}

function toggleDetails(button, details, card) {
    const isExpanded = button.getAttribute('data-expanded') === 'true';

    if (isExpanded) {
        // Collapse details
        button.textContent = 'Show More';
        button.setAttribute('data-expanded', 'false');
        removeAdditionalDetails(card);
    } else {
        // Expand details
        button.textContent = 'Show Less';
        button.setAttribute('data-expanded', 'true');
        showMoreDetails(details, card);
    }
}

function showMoreDetails(details, card) {
    // Extract additional details
    const comics = details.comics.items.map(item => item.name).join(', ');
    const events = details.events.items.map(item => item.name).join(', ');
    const series = details.series.items.map(item => item.name).join(', ');
    const stories = details.stories.items.map(item => item.name).join(', ');

    // Create elements for additional details
    const comicsHeading = document.createElement('h4');
    comicsHeading.textContent = 'Comics:';
    card.appendChild(comicsHeading);

    const comicsList = document.createElement('p');
    comicsList.textContent = comics;
    card.appendChild(comicsList);

    const eventsHeading = document.createElement('h4');
    eventsHeading.textContent = 'Events:';
    card.appendChild(eventsHeading);

    const eventsList = document.createElement('p');
    eventsList.textContent = events;
    card.appendChild(eventsList);

    const seriesHeading = document.createElement('h4');
    seriesHeading.textContent = 'Series:';
    card.appendChild(seriesHeading);

    const seriesList = document.createElement('p');
    seriesList.textContent = series;
    card.appendChild(seriesList);

    const storiesHeading = document.createElement('h4');
    storiesHeading.textContent = 'Stories:';
    card.appendChild(storiesHeading);

    const storiesList = document.createElement('p');
    storiesList.textContent = stories;
    card.appendChild(storiesList);
}

function removeAdditionalDetails(card) {
    // Remove all elements except the image, name, and description
    const children = card.childNodes;
    for (let i = children.length - 1; i >= 0; i--) {
        const child = children[i];
        if (child.tagName === 'H4' || child.tagName === 'P') {
            card.removeChild(child);
        }
    }
}







function showSuperheroDetails(id) {
    const superhero = superheroes.find(hero => hero.id === id);
    console.log(superhero, "superhero");
    localStorage.setItem('selectedSuperhero', JSON.stringify(superhero));
    window.location.href = `superhero.html?id=${id}`;
}

// Close the modal when clicking outside of it
window.onclick = function(event) {
    if (event.target == favoriteModal) {
        favoriteModal.style.display = 'none';
    }
};

// Ensure the favorite icon is updated on page load
updateFavoriteIcon();
console.log('Updated favoriteSuperheroes:', favoriteSuperheroes);
