document.addEventListener('DOMContentLoaded', () => {
    const playlistsElement = document.getElementById('playlists');
    const animesElement = document.getElementById('animes');
    const episodesElement = document.getElementById('episodes');
    const videoPlayer = document.getElementById('videoPlayer');
    const currentAnimeElement = document.getElementById('currentAnime');
    const currentEpisodeElement = document.getElementById('currentEpisode');
    const themeSwitch = document.getElementById('themeSwitch');

    let playlists = [];
    let currentPlaylist = null;
    let currentAnime = null;

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

    // Загрузка данных из JSON
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            playlists = data.playlists;
            renderPlaylists();
        })
        .catch(error => console.error('Ошибка загрузки данных:', error));

    // Отображение плейлистов
    function renderPlaylists() {
        playlistsElement.innerHTML = '';
        playlists.forEach(playlist => {
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
        
        playlist.animes.forEach(anime => {
            const li = document.createElement('li');
            li.textContent = anime.title;
            li.dataset.id = anime.id;
            li.addEventListener('click', () => selectAnime(anime));
            animesElement.appendChild(li);
        });
    }

    // Выбор аниме
    function selectAnime(anime) {
        currentAnime = anime;
        episodesElement.innerHTML = '';
        
        anime.episodes.forEach(episode => {
            const li = document.createElement('li');
            li.textContent = episode.title;
            li.addEventListener('click', () => playEpisode(episode));
            episodesElement.appendChild(li);
        });
    }

    // Воспроизведение серии
    function playEpisode(episode) {
        currentAnimeElement.textContent = currentAnime.title;
        currentEpisodeElement.textContent = episode.title;
        videoPlayer.src = episode.url;
        videoPlayer.load();
        videoPlayer.play();
    }

    // Инициализируем тему при загрузке
    initTheme();
});
