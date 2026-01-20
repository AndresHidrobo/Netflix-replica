// ===== CATALOG DATA =====
const CATALOG = [
    { id: 1, title: "The Dark Knight", category: "Action", year: 2008, description: "Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice." },
    { id: 2, title: "Inception", category: "Sci-Fi", year: 2010, description: "A thief who steals corporate secrets through dream-sharing technology." },
    { id: 3, title: "Interstellar", category: "Sci-Fi", year: 2014, description: "A team of explorers travel through a wormhole in space." },
    { id: 4, title: "The Shawshank Redemption", category: "Drama", year: 1994, description: "Two imprisoned men bond over a number of years." },
    { id: 5, title: "Pulp Fiction", category: "Crime", year: 1994, description: "The lives of two mob hitmen, a boxer, and a pair of diner bandits intertwine." },
    { id: 6, title: "The Matrix", category: "Sci-Fi", year: 1999, description: "A computer hacker learns about the true nature of reality." },
    { id: 7, title: "Forrest Gump", category: "Drama", year: 1994, description: "The presidencies of Kennedy and Johnson unfold through the perspective of an Alabama man." },
    { id: 8, title: "The Godfather", category: "Crime", year: 1972, description: "The aging patriarch of an organized crime dynasty transfers control to his reluctant son." },
    { id: 9, title: "Fight Club", category: "Drama", year: 1999, description: "An insomniac office worker forms an underground fight club." },
    { id: 10, title: "The Lord of the Rings", category: "Fantasy", year: 2001, description: "A meek Hobbit sets out on a journey to destroy a powerful ring." },
    { id: 11, title: "Gladiator", category: "Action", year: 2000, description: "A former Roman General sets out to exact vengeance against the corrupt emperor." },
    { id: 12, title: "The Prestige", category: "Mystery", year: 2006, description: "Two stage magicians engage in competitive one-upmanship." }
];

// ===== STORAGE HELPERS =====
const StorageHelper = {
    getUsers: function() {
        const users = localStorage.getItem('netflix_users');
        return users ? JSON.parse(users) : [];
    },
    
    saveUsers: function(users) {
        localStorage.setItem('netflix_users', JSON.stringify(users));
    },
    
    getCurrentSession: function() {
        const session = localStorage.getItem('netflix_session');
        return session ? JSON.parse(session) : null;
    },
    
    setCurrentSession: function(email, profileId) {
        localStorage.setItem('netflix_session', JSON.stringify({ email: email, profileId: profileId }));
    },
    
    clearSession: function() {
        localStorage.removeItem('netflix_session');
    },
    
    getUserByEmail: function(email) {
        const users = StorageHelper.getUsers();
        return users.find(function(u) { return u.email === email; });
    },
    
    updateUser: function(email, updatedUser) {
        const users = StorageHelper.getUsers();
        const index = users.findIndex(function(u) { return u.email === email; });
        if (index !== -1) {
            users[index] = updatedUser;
            StorageHelper.saveUsers(users);
        }
    }
};

// ===== STATE =====
var currentUser = null;
var selectedProfile = null;
var favorites = [];

// ===== NAVIGATION =====
function showPage(pageName) {
    const pages = ['landingPage', 'registerPage', 'loginPage', 'profilesPage', 'homePage'];
    pages.forEach(function(page) {
        document.getElementById(page).classList.add('hidden');
    });
    document.getElementById(pageName + 'Page').classList.remove('hidden');
}

function showError(elementId, message) {
    const el = document.getElementById(elementId);
    el.textContent = message;
    el.classList.remove('hidden');
}

function hideError(elementId) {
    document.getElementById(elementId).classList.add('hidden');
}

// ===== REGISTER =====
function handleRegister() {
    hideError('registerError');
    
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;

    if (!email || !password || !confirmPassword) {
        showError('registerError', 'All fields are required');
        return;
    }

    if (password !== confirmPassword) {
        showError('registerError', 'Passwords do not match');
        return;
    }

    const users = StorageHelper.getUsers();
    if (users.find(function(u) { return u.email === email; })) {
        showError('registerError', 'Email already registered');
        return;
    }

    const newUser = {
        email: email,
        password: password,
        profiles: [
            { id: 'default', name: 'Default Profile' }
        ],
        favorites: { 'default': [] }
    };

    users.push(newUser);
    StorageHelper.saveUsers(users);
    
    // Clear form
    document.getElementById('registerEmail').value = '';
    document.getElementById('registerPassword').value = '';
    document.getElementById('registerConfirmPassword').value = '';
    
    showPage('login');
}

// ===== LOGIN =====
function handleLogin() {
    hideError('loginError');
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    const user = StorageHelper.getUserByEmail(email);
    
    if (!user || user.password !== password) {
        showError('loginError', 'Invalid email or password');
        return;
    }

    currentUser = user;
    renderProfiles();
    showPage('profiles');
}

// ===== PROFILES =====
function renderProfiles() {
    const grid = document.getElementById('profilesGrid');
    grid.innerHTML = '';

    currentUser.profiles.forEach(function(profile) {
        const card = document.createElement('div');
        card.className = 'profile-card';
        card.onclick = function() { selectProfile(profile); };
        card.innerHTML = '<div class="profile-avatar">👤</div><p class="profile-name">' + profile.name + '</p>';
        grid.appendChild(card);
    });

    // Add profile card
    const addCard = document.createElement('div');
    addCard.className = 'profile-card';
    addCard.onclick = toggleAddProfile;
    addCard.innerHTML = '<div class="profile-avatar add-profile-avatar">➕</div><p class="profile-name">Add Profile</p>';
    grid.appendChild(addCard);
}

function toggleAddProfile() {
    const form = document.getElementById('addProfileForm');
    form.classList.toggle('hidden');
    document.getElementById('newProfileName').value = '';
}

function handleAddProfile() {
    const name = document.getElementById('newProfileName').value.trim();
    if (!name) return;

    const newProfile = {
        id: 'profile_' + Date.now(),
        name: name
    };

    currentUser.profiles.push(newProfile);
    currentUser.favorites[newProfile.id] = [];
    
    StorageHelper.updateUser(currentUser.email, currentUser);
    renderProfiles();
    toggleAddProfile();
}

function selectProfile(profile) {
    selectedProfile = profile;
    StorageHelper.setCurrentSession(currentUser.email, profile.id);
    favorites = currentUser.favorites[profile.id] || [];
    
    document.getElementById('currentProfileName').textContent = profile.name;
    renderMovies();
    renderFavorites();
    showPage('home');
}

// ===== HOME =====
function renderMovies() {
    const grid = document.getElementById('moviesGrid');
    grid.innerHTML = '';

    CATALOG.forEach(function(movie) {
        const card = createMovieCard(movie);
        grid.appendChild(card);
    });
}

function createMovieCard(movie) {
    const isFavorite = favorites.includes(movie.id);
    
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.innerHTML = '<div class="movie-poster">🎬</div>' +
        '<div class="movie-info">' +
        '<div class="movie-title">' + movie.title + '</div>' +
        '<div class="movie-meta">' + movie.category + ' • ' + movie.year + '</div>' +
        '<div class="movie-description">' + movie.description + '</div>' +
        '<button class="btn btn-favorite ' + (isFavorite ? 'active' : '') + '" onclick="toggleFavorite(' + movie.id + ')">' +
        '<span class="heart-icon">' + (isFavorite ? '❤️' : '🤍') + '</span>' +
        '<span>' + (isFavorite ? 'Remove' : 'My List') + '</span>' +
        '</button>' +
        '</div>';
    return card;
}

function toggleFavorite(movieId) {
    if (favorites.includes(movieId)) {
        favorites = favorites.filter(function(id) { return id !== movieId; });
    } else {
        favorites.push(movieId);
    }

    currentUser.favorites[selectedProfile.id] = favorites;
    StorageHelper.updateUser(currentUser.email, currentUser);
    
    renderMovies();
    renderFavorites();
}

function renderFavorites() {
    const section = document.getElementById('favoritesSection');
    const grid = document.getElementById('favoritesGrid');
    
    if (favorites.length === 0) {
        section.classList.add('hidden');
        return;
    }

    section.classList.remove('hidden');
    grid.innerHTML = '';

    const favoriteMovies = CATALOG.filter(function(m) { return favorites.includes(m.id); });
    favoriteMovies.forEach(function(movie) {
        const card = createMovieCard(movie);
        grid.appendChild(card);
    });
}

// ===== LOGOUT =====
function handleLogout() {
    StorageHelper.clearSession();
    currentUser = null;
    selectedProfile = null;
    favorites = [];
    showPage('landing');
}

// ===== INIT =====
function init() {
    const session = StorageHelper.getCurrentSession();
    if (session) {
        const user = StorageHelper.getUserByEmail(session.email);
        if (user) {
            currentUser = user;
            const profile = user.profiles.find(function(p) { 
                return p.id === session.profileId;
            });
            if (profile) {
                selectProfile(profile);
            } else {
                renderProfiles();
                showPage('profiles');
            }
        }
    }

    // Add Enter key support
    document.getElementById('registerConfirmPassword').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') handleRegister();
    });
    
    document.getElementById('loginPassword').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') handleLogin();
    });
}

// Start app
init();