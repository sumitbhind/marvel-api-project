const favoritesList = document.getElementById('favoritesList');

displayFavoriteSuperheroes();

function displayFavoriteSuperheroes() {
    const favoriteSuperheroes = JSON.parse(localStorage.getItem('favoriteSuperheroes')) || [];
    favoritesList.innerHTML = favoriteSuperheroes.map(superhero => `
        <div class="superhero">
            <h3>${superhero.name}</h3>
            <button class="favorite" onclick="removeFromFavorites(${superhero.id})">Remove from Favorites</button>
        </div>
    `).join('');
}

function removeFromFavorites(id) {
    let favoriteSuperheroes = JSON.parse(localStorage.getItem('favoriteSuperheroes')) || [];
    favoriteSuperheroes = favoriteSuperheroes.filter(superhero => superhero.id !== id);
    localStorage.setItem('favoriteSuperheroes', JSON.stringify(favoriteSuperheroes));
    displayFavoriteSuperheroes();
}
