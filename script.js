// ==================== STATE CENTRALISÉ ====================
const state = {
    currentUser: null,     
    bookmarks: [],         
    isViewingBookmarks: false 
};

// ==================== ÉLÉMENTS DOM ====================
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const welcomeState = document.getElementById('welcomeState');
const loadingState = document.getElementById('loadingState');
const errorState = document.getElementById('errorState');
const errorMessage = document.getElementById('errorMessage');
const resultsSection = document.getElementById('resultsSection');
const bookmarksSection = document.getElementById('bookmarksSection');
const bookmarksNavBtn = document.getElementById('bookmarksNavBtn');
const closeBookmarksBtn = document.getElementById('closeBookmarksBtn');
const bookmarkCountSpan = document.getElementById('bookmarkCountNav');
const userProfileDiv = document.getElementById('userProfile');
const reposListDiv = document.getElementById('reposList');
const reposCountSpan = document.getElementById('reposCount');
const bookmarksListDiv = document.getElementById('bookmarksList');
const errorRetryBtn = document.getElementById('errorRetryBtn');

// ==================== LOCALSTORAGE ====================
function loadBookmarksFromStorage() {
    const stored = localStorage.getItem('github_finder_bookmarks');
    if (stored) {
        try {
            state.bookmarks = JSON.parse(stored);
        } catch(e) {
            state.bookmarks = [];
        }
    } else {
        state.bookmarks = [];
    }
    updateBookmarkCount();
}

function saveBookmarksToStorage() {
    localStorage.setItem('github_finder_bookmarks', JSON.stringify(state.bookmarks));
    updateBookmarkCount();
}

function updateBookmarkCount() {
    const count = state.bookmarks.length;
    bookmarkCountSpan.textContent = count;
}

// ==================== GESTION DES FAVORIS ====================
function isUserBookmarked(login) {
    return state.bookmarks.some(b => b.login === login);
}

function addBookmark(user) {
    if (!isUserBookmarked(user.login)) {
        const bookmark = {
            id: user.id,
            login: user.login,
            name: user.name || user.login,
            avatar_url: user.avatar_url
        };
        state.bookmarks.push(bookmark);
        saveBookmarksToStorage();
        updateBookmarkButtonState();
    }
}

function removeBookmark(login) {
    state.bookmarks = state.bookmarks.filter(b => b.login !== login);
    saveBookmarksToStorage();
    updateBookmarkButtonState();
    
    // Si on est dans la vue favoris, rafraîchir l'affichage
    if (state.isViewingBookmarks) {
        displayBookmarks();
    }
}

function toggleBookmark(user) {
    if (isUserBookmarked(user.login)) {
        removeBookmark(user.login);
    } else {
        addBookmark(user);
    }
}

function updateBookmarkButtonState() {
    const bookmarkBtn = document.querySelector('.bookmark-btn');
    if (bookmarkBtn && state.currentUser) {
        if (isUserBookmarked(state.currentUser.login)) {
            bookmarkBtn.textContent = ' Retirer des favoris';
            bookmarkBtn.classList.add('bookmarked');
        } else {
            bookmarkBtn.textContent = '☆ Ajouter aux favoris';
            bookmarkBtn.classList.remove('bookmarked');
        }
    }
}

// ==================== AFFICHAGE DES ÉTATS UI ====================
function showWelcome() {
    welcomeState.classList.remove('hidden');
    loadingState.classList.add('hidden');
    errorState.classList.add('hidden');
    resultsSection.classList.add('hidden');
    bookmarksSection.classList.add('hidden');
    state.isViewingBookmarks = false;
}

function showLoading() {
    welcomeState.classList.add('hidden');
    loadingState.classList.remove('hidden');
    errorState.classList.add('hidden');
    resultsSection.classList.add('hidden');
    bookmarksSection.classList.add('hidden');
}

function showError(message) {
    welcomeState.classList.add('hidden');
    loadingState.classList.add('hidden');
    errorState.classList.remove('hidden');
    resultsSection.classList.add('hidden');
    bookmarksSection.classList.add('hidden');
    errorMessage.textContent = message;
}

function showResults() {
    welcomeState.classList.add('hidden');
    loadingState.classList.add('hidden');
    errorState.classList.add('hidden');
    resultsSection.classList.remove('hidden');
    bookmarksSection.classList.add('hidden');
    state.isViewingBookmarks = false;
}

function showBookmarksView() {
    welcomeState.classList.add('hidden');
    loadingState.classList.add('hidden');
    errorState.classList.add('hidden');
    resultsSection.classList.add('hidden');
    bookmarksSection.classList.remove('hidden');
    state.isViewingBookmarks = true;
    displayBookmarks();
}

// ==================== AFFICHAGE DU PROFIL UTILISATEUR ====================
function displayUserProfile(user) {
    const isBookmarked = isUserBookmarked(user.login);
    
    const profileHTML = `
        <img class="profile-avatar" src="${user.avatar_url}" alt="${user.login}">
        <div class="profile-info">
            <h2>${user.name || user.login}</h2>
            <div class="profile-login">@${user.login}</div>
            ${user.bio ? `<div class="profile-bio">${user.bio}</div>` : ''}
            <div class="profile-stats">
                <div class="stat"> ${user.followers.toLocaleString()} followers</div>
                <div class="stat"> ${user.following.toLocaleString()} following</div>
                <div class="stat"> ${user.public_repos} repos</div>
            </div>
            <button class="bookmark-btn" data-login="${user.login}">
                ${isBookmarked ? ' Retirer des favoris' : '☆ Ajouter aux favoris'}
            </button>
            <br>
            <a href="${user.html_url}" target="_blank" class="profile-link"> Voir sur GitHub →</a>
        </div>
    `;
    
    userProfileDiv.innerHTML = profileHTML;
    
    // Ajouter l'event listener au bouton favoris
    const bookmarkBtn = document.querySelector('.bookmark-btn');
    if (bookmarkBtn) {
        bookmarkBtn.addEventListener('click', () => {
            toggleBookmark(user);
        });
    }
}

// ==================== AFFICHAGE DES REPOSITORIES ====================
function displayRepositories(repos) {
    if (!repos || repos.length === 0) {
        reposListDiv.innerHTML = '<p>Aucun dépôt public</p>';
        reposCountSpan.textContent = '0';
        return;
    }
    
    reposCountSpan.textContent = repos.length;
    
    const reposHTML = repos.slice(0, 6).map(repo => `
        <div class="repo-card">
            <div class="repo-name"> ${repo.name}</div>
            ${repo.description ? `<div class="repo-desc">${repo.description.substring(0, 100)}</div>` : '<div class="repo-desc">Pas de description</div>'}
            <div class="repo-stats">
                <span> ${repo.stargazers_count}</span>
                <span> ${repo.forks_count}</span>
                ${repo.language ? `<span> ${repo.language}</span>` : ''}
            </div>
        </div>
    `).join('');
    
    
    reposListDiv.innerHTML = reposHTML;
}

// ==================== APPEL API GITHUB ====================
async function fetchGitHubUser(username) {
    const response = await fetch(`https://api.github.com/users/${username}`, {


        headers : {
        }
    });
    if (!response.ok) {
        if (response.status === 404) {
            throw new Error('Utilisateur non trouvé');
        }
        throw new Error('Erreur API');
    }
    return await response.json();
}

async function fetchUserRepos(username) {
    const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=6`);
    if (!response.ok) {
        return [];
    }
    return await response.json();
}

// ==================== RECHERCHE PRINCIPALE ====================
async function searchUser(username) {
    if (!username || username.trim() === '') {
        showError('Veuillez entrer un nom d\'utilisateur');
        return;
    }
    
    username = username.trim().toLowerCase();
    showLoading();
    
    try {
        // Requête API pour le profil
        const userData = await fetchGitHubUser(username);
        
        // Requête API pour les repos
        const reposData = await fetchUserRepos(username);
        
        state.currentUser = userData;
        displayUserProfile(userData);
        displayRepositories(reposData);
        showResults();
        
    } catch (error) {
        console.error('Erreur:', error);
        if (error.message === 'Utilisateur non trouvé') {
            showError(`L'utilisateur "${username}" n'existe pas sur GitHub`);
        } else {
            showError('Erreur réseau. Vérifiez votre connexion.');
        }
        state.currentUser = null;
    }
}


// ==================== AFFICHAGE DES FAVORIS ====================
function displayBookmarks() {
    if (state.bookmarks.length === 0) {
        bookmarksListDiv.innerHTML = `
            <div class="welcome-card" style="grid-column: 1/-1;">
                <p>Aucun favori pour le moment</p>
                <p style="font-size: 0.9rem;">Recherchez un développeur et ajoutez-le à vos favoris </p>
            </div>
        `;
        return;
    }
    
    const bookmarksHTML = state.bookmarks.map(bookmark => `
        <div class="bookmark-card" data-login="${bookmark.login}">
            <img class="bookmark-avatar" src="${bookmark.avatar_url}" alt="${bookmark.login}">
            <div class="bookmark-info">
                <h4>${bookmark.name}</h4>
                <div class="bookmark-login">@${bookmark.login}</div>
            </div>
            <div class="bookmark-actions">
                <button class="load-bookmark-btn" data-login="${bookmark.login}">Charger</button>
                <button class="remove-bookmark-btn" data-login="${bookmark.login}"></button>
            </div>
        </div>
    `).join('');
    
    bookmarksListDiv.innerHTML = bookmarksHTML;
    
    // Ajouter les event listeners pour chaque favori
    document.querySelectorAll('.load-bookmark-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const login = btn.dataset.login;
            loadBookmarkProfile(login);
        });
    });
    
    document.querySelectorAll('.remove-bookmark-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const login = btn.dataset.login;
            removeBookmark(login);
        });
    });
}

async function loadBookmarkProfile(login) {
    showLoading();
    try {
        const userData = await fetchGitHubUser(login);
        const reposData = await fetchUserRepos(login);
        state.currentUser = userData;
        displayUserProfile(userData);
        displayRepositories(reposData);
        showResults();
    } catch (error) {
        showError(`Impossible de charger ${login}`);
    }
}


// ==================== EVENT LISTENERS ====================
searchBtn.addEventListener('click', () => {
    searchUser(searchInput.value);
});

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchUser(searchInput.value);
    }
});

bookmarksNavBtn.addEventListener('click', () => {
    showBookmarksView();
});

closeBookmarksBtn.addEventListener('click', () => {
    if (state.currentUser) {
        showResults();
    } else {
        showWelcome();
    }
});

errorRetryBtn.addEventListener('click', () => {
    showWelcome();
    searchInput.value = '';
});

// Exemple tags cliquables
document.querySelectorAll('.example-tag').forEach(tag => {
    tag.addEventListener('click', () => {
        searchUser(tag.textContent);
    });
});

// ==================== INITIALISATION ====================
loadBookmarksFromStorage();
showWelcome();













