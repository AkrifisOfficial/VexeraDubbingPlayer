document.addEventListener('DOMContentLoaded', () => {
    // Добавляем в начало после объявления переменных
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const logoutBtn = document.getElementById('logoutBtn');
const userInfo = document.getElementById('userInfo');
const userAuth = document.getElementById('userAuth');
const userEmail = document.getElementById('userEmail');
const authModal = document.getElementById('authModal');
const modalTitle = document.getElementById('modalTitle');
const authEmail = document.getElementById('authEmail');
const authPassword = document.getElementById('authPassword');
const authError = document.getElementById('authError');
const confirmAuthBtn = document.getElementById('confirmAuthBtn');
const switchAuthBtn = document.getElementById('switchAuthBtn');
const cancelAuthBtn = document.getElementById('cancelAuthBtn');

let isLoginMode = true;

// Инициализация аутентификации
function initAuth() {
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            // Пользователь вошел
            userEmail.textContent = user.email;
            userAuth.style.display = 'none';
            userInfo.style.display = 'block';
        } else {
            // Пользователь вышел
            userInfo.style.display = 'none';
            userAuth.style.display = 'block';
        }
    });
}

// Открытие модального окна
loginBtn.addEventListener('click', () => {
    isLoginMode = true;
    modalTitle.textContent = 'Вход';
    confirmAuthBtn.textContent = 'Войти';
    switchAuthBtn.textContent = 'Регистрация';
    authError.textContent = '';
    authModal.style.display = 'flex';
});

registerBtn.addEventListener('click', () => {
    isLoginMode = false;
    modalTitle.textContent = 'Регистрация';
    confirmAuthBtn.textContent = 'Зарегистрироваться';
    switchAuthBtn.textContent = 'Войти';
    authError.textContent = '';
    authModal.style.display = 'flex';
});

// Переключение между входом и регистрацией
switchAuthBtn.addEventListener('click', () => {
    isLoginMode = !isLoginMode;
    if (isLoginMode) {
        modalTitle.textContent = 'Вход';
        confirmAuthBtn.textContent = 'Войти';
        switchAuthBtn.textContent = 'Регистрация';
    } else {
        modalTitle.textContent = 'Регистрация';
        confirmAuthBtn.textContent = 'Зарегистрироваться';
        switchAuthBtn.textContent = 'Войти';
    }
    authError.textContent = '';
});

// Отмена авторизации
cancelAuthBtn.addEventListener('click', () => {
    authModal.style.display = 'none';
});

// Подтверждение авторизации
confirmAuthBtn.addEventListener('click', () => {
    const email = authEmail.value.trim();
    const password = authPassword.value.trim();
    
    if (!email || !password) {
        authError.textContent = 'Заполните все поля';
        return;
    }
    
    if (isLoginMode) {
        // Вход
        firebase.auth().signInWithEmailAndPassword(email, password)
            .then(() => {
                authModal.style.display = 'none';
            })
            .catch(error => {
                authError.textContent = error.message;
            });
    } else {
        // Регистрация
        firebase.auth().createUserWithEmailAndPassword(email, password)
            .then(() => {
                authModal.style.display = 'none';
            })
            .catch(error => {
                authError.textContent = error.message;
            });
    }
});

// Выход
logoutBtn.addEventListener('click', () => {
    firebase.auth().signOut();
});

// В конце функции init() добавляем
initAuth();
    
    const db = firebase.firestore();
    
    // Элементы DOM
    const playlistsElement = document.getElementById('playlists');
    const animesElement = document.getElementById('animes');
    const episodesElement = document.getElementById('episodes');
    const videoPlayer = document.getElementById('videoPlayer');
    const currentAnimeElement = document.getElementById('currentAnime');
    const currentEpisodeElement = document.getElementById('currentEpisode');
    const themeSwitch = document.getElementById('themeSwitch');
    const playlistSearch = document.getElementById('playlistSearch');
    const animeSearch = document.getElementById('animeSearch');
    const episodeSearch = document.getElementById('episodeSearch');
    const prevBtn = document.getElementById('prevBtn');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    let playlists = [];
    let currentPlaylist = null;
    let currentAnime = null;
    let currentEpisodeIndex = -1;
    let currentEpisodes = [];

    // Инициализация темы
    function initTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light') {
            document.body.classList.add('light-theme');
            themeSwitch.textContent = '☀️ Светлая тема';
        } else {
            themeSwitch.textContent = '🌙 Темная тема';
        }
    }

    // Переключение темы
    themeSwitch.addEventListener('click', () => {
        if (document.body.classList.contains('light-theme')) {
            document.body.classList.remove('light-theme');
            localStorage.setItem('theme', 'dark');
            themeSwitch.textContent = '🌙 Темная тема';
        } else {
            document.body.classList.add('light-theme');
            localStorage.setItem('theme', 'light');
            themeSwitch.textContent = '☀️ Светлая тема';
        }
    });

    // Загрузка данных из Firestore
    function loadData() {
        db.collection("playlists").get()
            .then((querySnapshot) => {
                playlists = [];
                querySnapshot.forEach((doc) => {
                    const playlist = doc.data();
                    playlist.id = doc.id;
                    playlists.push(playlist);
                });
                renderPlaylists();
            })
            .catch((error) => {
                console.error("Ошибка загрузки данных: ", error);
                playlistsElement.innerHTML = `<li class="error">Ошибка загрузки данных. Попробуйте позже.</li>`;
            });
    }

    // Поиск плейлистов
    playlistSearch.addEventListener('input', () => {
        renderPlaylists();
    });

    // Поиск аниме
    animeSearch.addEventListener('input', () => {
        if (currentPlaylist) {
            renderAnimes(currentPlaylist);
        }
    });

    // Поиск серий
    episodeSearch.addEventListener('input', () => {
        if (currentAnime) {
            renderEpisodes(currentAnime);
        }
    });

    // Отображение плейлистов
    function renderPlaylists() {
        playlistsElement.innerHTML = '';
        
        if (playlists.length === 0) {
            playlistsElement.innerHTML = '<li class="empty-list">Нет доступных плейлистов</li>';
            return;
        }
        
        const searchTerm = playlistSearch.value.toLowerCase();
        const filteredPlaylists = playlists.filter(playlist => 
            playlist.name.toLowerCase().includes(searchTerm)
        );
        
        if (filteredPlaylists.length === 0) {
            playlistsElement.innerHTML = '<li class="empty-list">Плейлисты не найдены</li>';
            return;
        }
        
        filteredPlaylists.forEach(playlist => {
            const li = document.createElement('li');
            li.textContent = playlist.name;
            li.dataset.id = playlist.id;
            li.addEventListener('click', () => selectPlaylist(playlist));
            playlistsElement.appendChild(li);
        });
    }

    // Выбор плейлиста
    function selectPlaylist(playlist) {
        currentPlaylist = playlist;
        animesElement.innerHTML = '';
        episodesElement.innerHTML = '';
        currentAnime = null;
        animeSearch.value = '';
        
        renderAnimes(playlist);
    }

    // Отображение аниме
    function renderAnimes(playlist) {
        animesElement.innerHTML = '';
        
        if (!playlist.animes || playlist.animes.length === 0) {
            animesElement.innerHTML = '<li class="empty-list">В плейлисте нет аниме</li>';
            return;
        }
        
        const searchTerm = animeSearch.value.toLowerCase();
        const filteredAnimes = playlist.animes.filter(anime => 
            anime.title.toLowerCase().includes(searchTerm)
        );
        
        if (filteredAnimes.length === 0) {
            animesElement.innerHTML = '<li class="empty-list">Аниме не найдены</li>';
            return;
        }
        
        filteredAnimes.forEach(anime => {
            const li = document.createElement('li');
            li.className = 'anime-item';
            
            // Добавляем постер, если есть
            if (anime.image) {
                const img = document.createElement('img');
                img.src = anime.image;
                img.className = 'anime-poster';
                img.alt = anime.title;
                li.appendChild(img);
            }
            
            const titleSpan = document.createElement('span');
            titleSpan.textContent = anime.title;
            li.appendChild(titleSpan);
            
            li.dataset.id = anime.id;
            li.addEventListener('click', () => selectAnime(anime));
            animesElement.appendChild(li);
        });
    }

    // Выбор аниме
    function selectAnime(anime) {
        currentAnime = anime;
        episodesElement.innerHTML = '';
        episodeSearch.value = '';
        
        // Добавляем информацию об аниме
        if (anime.description) {
            const infoDiv = document.createElement('div');
            infoDiv.className = 'anime-info';
            infoDiv.innerHTML = `
                <p><strong>Описание:</strong> ${anime.description}</p>
            `;
            episodesElement.parentNode.insertBefore(infoDiv, episodesElement);
        }
        
        renderEpisodes(anime);
    }

    // Отображение серий
    function renderEpisodes(anime) {
        episodesElement.innerHTML = '';
        
        if (!anime.episodes || anime.episodes.length === 0) {
            episodesElement.innerHTML = '<li class="empty-list">Нет доступных серий</li>';
            return;
        }
        
        const searchTerm = episodeSearch.value.toLowerCase();
        const filteredEpisodes = anime.episodes.filter(episode => 
            episode.title.toLowerCase().includes(searchTerm)
        );
        
        if (filteredEpisodes.length === 0) {
            episodesElement.innerHTML = '<li class="empty-list">Серии не найдены</li>';
            return;
        }
        
        currentEpisodes = filteredEpisodes;
        
        filteredEpisodes.forEach((episode, index) => {
            const li = document.createElement('li');
            li.textContent = episode.title;
            li.addEventListener('click', () => playEpisode(episode, index));
            episodesElement.appendChild(li);
        });
    }

    // Воспроизведение серии
    function playEpisode(episode, index) {
        currentEpisodeIndex = index;
        currentAnimeElement.textContent = currentAnime.title;
        currentEpisodeElement.textContent = episode.title;
        
        // Преобразование обычной ссылки VK в прямую
        let directUrl = episode.url;
        if (episode.url.includes('vk.com/video')) {
            const matches = episode.url.match(/video(-?\d+_\d+)/);
            if (matches && matches[1]) {
                const [oid, id] = matches[1].split('_');
                directUrl = `https://vk.com/video_ext.php?oid=${oid}&id=${id}`;
            }
        }
        
        videoPlayer.src = directUrl;
        videoPlayer.load();
        videoPlayer.play();
        
        // Обновление кнопки
        playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
    }

    // Кнопка Play/Pause
    playPauseBtn.addEventListener('click', () => {
        if (videoPlayer.paused) {
            videoPlayer.play();
            playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        } else {
            videoPlayer.pause();
            playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        }
    });

    // Следующая серия
    nextBtn.addEventListener('click', () => {
        if (currentEpisodes.length > 0 && currentEpisodeIndex < currentEpisodes.length - 1) {
            const nextEpisode = currentEpisodes[currentEpisodeIndex + 1];
            playEpisode(nextEpisode, currentEpisodeIndex + 1);
        }
    });

    // Предыдущая серия
    prevBtn.addEventListener('click', () => {
        if (currentEpisodes.length > 0 && currentEpisodeIndex > 0) {
            const prevEpisode = currentEpisodes[currentEpisodeIndex - 1];
            playEpisode(prevEpisode, currentEpisodeIndex - 1);
        }
    });

    // Инициализация
    initTheme();
    loadData();
});
