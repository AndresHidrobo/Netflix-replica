/* =====================================================
   TASKFLOW / NETFLIX-LIKE MINI APP
   Lógica + Datos + Flujo
   Tecnologías: JavaScript Vanilla + localStorage
   ===================================================== */


/* ======================
   DATA STORAGE HELPERS
   ====================== */

// Obtener usuarios desde localStorage
function getUsers() {
    return JSON.parse(localStorage.getItem("users")) || [];
}

// Guardar usuarios en localStorage
function saveUsers(users) {
    localStorage.setItem("users", JSON.stringify(users));
}

// Usuario en sesión
function getCurrentUser() {
    return JSON.parse(sessionStorage.getItem("currentUser"));
}

function setCurrentUser(user) {
    sessionStorage.setItem("currentUser", JSON.stringify(user));
}

// Perfil seleccionado
function getSelectedProfile() {
    return JSON.parse(sessionStorage.getItem("selectedProfile"));
}

function setSelectedProfile(profile) {
    sessionStorage.setItem("selectedProfile", JSON.stringify(profile));
}

function clearSession() {
    sessionStorage.clear();
}


/* ======================
   UI HELPERS
   ====================== */

function showPage(page) {
    const pages = ["landing", "login", "register", "profiles", "home"];

    pages.forEach(p =>
        document.getElementById(p + "Page").classList.add("hidden")
    );

    // Reglas de navegación
    if (page === "home") {
        if (!getCurrentUser()) return showPage("login");
        if (!getSelectedProfile()) return showPage("profiles");
    }

    document.getElementById(page + "Page").classList.remove("hidden");
}

function showError(id, message) {
    const el = document.getElementById(id);
    el.textContent = message;
    el.classList.remove("hidden");
}


/* ======================
   REGISTER
   ====================== */

function handleRegister() {
    const email = document.getElementById("registerEmail").value.trim();
    const password = document.getElementById("registerPassword").value;
    const confirm = document.getElementById("registerConfirm").value;

    if (!email || !password || !confirm) {
        showError("registerError", "All fields are required");
        return;
    }

    if (password !== confirm) {
        showError("registerError", "Passwords do not match");
        return;
    }

    const users = getUsers();
    const exists = users.some(u => u.email === email);

    if (exists) {
        showError("registerError", "User already exists");
        return;
    }

    users.push({
        email,
        password,
        profiles: [{ id: Date.now(), name: "Main Profile" }],
        favorites: {}
    });

    saveUsers(users);
    showPage("login");
}


/* ======================
   LOGIN
   ====================== */

function handleLogin() {
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    const users = getUsers();
    const user = users.find(
        u => u.email === email && u.password === password
    );

    if (!user) {
        showError("loginError", "Invalid credentials");
        return;
    }

    setCurrentUser(user);
    showProfiles();
}


/* ======================
   PROFILES
   ====================== */

function showProfiles() {
    const user = getCurrentUser();
    if (!user) return showPage("login");

    const grid = document.getElementById("profilesGrid");
    grid.innerHTML = "";

    user.profiles.forEach(profile => {
        const card = document.createElement("div");
        card.className = "profile-card";
        card.innerHTML = `
            <div class="profile-avatar">👤</div>
            <div>${profile.name}</div>
        `;

        card.onclick = () => {
            setSelectedProfile(profile);
            showHome();
        };

        grid.appendChild(card);
    });

    showPage("profiles");
}


/* ======================
   CATALOG DATA
   ====================== */

const catalog = [
    { id: 1, title: "Dark City", year: 2020 },
    { id: 2, title: "The Signal", year: 2019 },
    { id: 3, title: "Lost Horizon", year: 2021 },
    { id: 4, title: "Echoes", year: 2018 },
    { id: 5, title: "Nebula", year: 2022 },
    { id: 6, title: "Afterlight", year: 2020 },
    { id: 7, title: "Mirage", year: 2017 },
    { id: 8, title: "Pulse", year: 2023 },
    { id: 9, title: "Voyager", year: 2016 },
    { id: 10, title: "Signal Lost", year: 2021 }
];


/* ======================
   HOME / RENDER MOVIES
   ====================== */

function showHome() {
    renderMovies();
    showPage("home");
}

function renderMovies() {
    const container = document.getElementById("moviesGrid");
    container.innerHTML = "";

    const user = getCurrentUser();
    const profile = getSelectedProfile();
    const favorites = user.favorites[profile.id] || [];

    catalog.forEach(movie => {
        const card = document.createElement("div");
        card.className = "movie-card";

        const isFav = favorites.includes(movie.id);

        card.innerHTML = `
            <h4>${movie.title}</h4>
            <p>${movie.year}</p>
            <button>
                ${isFav ? "Remove from My List" : "Add to My List"}
            </button>
        `;

        card.querySelector("button").onclick = () =>
            toggleFavorite(movie.id);

        container.appendChild(card);
    });
}


/* ======================
   FAVORITES
   ====================== */

function toggleFavorite(movieId) {
    const user = getCurrentUser();
    const profile = getSelectedProfile();

    if (!user.favorites[profile.id]) {
        user.favorites[profile.id] = [];
    }

    const list = user.favorites[profile.id];
    const index = list.indexOf(movieId);

    if (index === -1) {
        list.push(movieId);
    } else {
        list.splice(index, 1);
    }

    const users = getUsers().map(u =>
        u.email === user.email ? user : u
    );

    saveUsers(users);
    setCurrentUser(user);
    renderMovies();
}


/* ======================
   LOGOUT
   ====================== */

function logout() {
    clearSession();
    showPage("landing");
}


/* ======================
   INITIAL LOAD
   ====================== */

document.addEventListener("DOMContentLoaded", () => {
    showPage("landing");
});
