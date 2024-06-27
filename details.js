document.addEventListener('DOMContentLoaded', displaySuperheroDetails);

function displaySuperheroDetails() {
    const superhero = JSON.parse(localStorage.getItem('selectedSuperhero'));
    if (superhero) {
        fetch(`https://gateway.marvel.com:443/v1/public/characters/${superhero.id}`)
            .then(response => response.json())
            .then(superheroDetails => {
                const superheroNameElement = document.getElementById('superheroName');
                const basicInfoSection = document.getElementById('basicInfo');
                const comicsList = document.getElementById('comicsList');
                const eventsList = document.getElementById('eventsList');
                const seriesList = document.getElementById('seriesList');
                const storiesList = document.getElementById('storiesList');

                if (superheroNameElement && basicInfoSection && comicsList && eventsList && seriesList && storiesList) {
                    superheroNameElement.textContent = superheroDetails.name;
                    basicInfoSection.innerHTML = `<p>${superheroDetails.description}</p><img src="${superheroDetails.thumbnail.path}.${superheroDetails.thumbnail.extension}" alt="${superheroDetails.name}">`;

                    populateList(comicsList, superheroDetails.comics.items);
                    populateList(eventsList, superheroDetails.events.items);
                    populateList(seriesList, superheroDetails.series.items);
                    populateList(storiesList, superheroDetails.stories.items);
                } else {
                    console.error('One or more elements not found');
                }
            })
            .catch(error => {
                console.error('Error fetching superhero details:', error);
            });
    } else {
        console.error('No superhero details found in localStorage');
    }
}

function populateList(listElement, items) {
    listElement.innerHTML = items.map(item => `<li>${item.name}</li>`).join('');
}
