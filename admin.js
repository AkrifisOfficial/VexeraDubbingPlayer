document.addEventListener('DOMContentLoaded', () => {
    const db = firebase.firestore();
    const auth = firebase.auth();
    
    // Элементы DOM
    const loginPanel = document.getElementById('loginPanel');
    const adminPanel = document.getElementById('adminPanel');
    const adminPassword = document.getElementById('adminPassword');
    const loginBtn = document.getElementById('loginBtn');
    const loginError = document.getElementById('loginError');
    const logoutBtn = document.getElementById('logoutBtn');
    
    const playlistName = document.getElementById('playlistName');
    const addPlaylistBtn = document.getElementById('addPlaylistBtn');
    const adminPlaylists = document.getElementById('adminPlaylists');
    
    const animePlaylist = document.getElementById('animePlaylist');
    const animeTitle = document.getElementById('animeTitle');
    const animeImage = document.getElementById('animeImage');
    const animeDescription = document.getElementById('animeDescription');
    const addAnimeBtn = document.getElementById('addAnimeBtn');
    const adminAnimes = document.getElementById('adminAnimes');
    
    const episodePlaylist = document.getElementById('episodePlaylist');
    const episodeAnime = document.getElementById('episodeAnime');
    const episodeTitle = document.getElementById('episodeTitle');
    const episodeUrl = document.getElementById('episodeUrl');
    const addEpisodeBtn = document.getElementById('addEpisodeBtn');
    const adminEpisodes = document.getElementById('adminEpisodes');
    
    // Константы
    const ADMIN_EMAIL = "admin@animeplayer.com";
    const ADMIN_PASSWORD = "animeadmin123";
    
    let playlists = [];
    
    // Проверка аутентификации
    auth.onAuthStateChanged(user => {
        if (user) {
            // Пользователь авторизован
            loginPanel.style.display = 'none';
            adminPanel.style.display = 'block';
            loadPlaylists();
        } else {
            // Пользователь не авторизован
            loginPanel.style.display = 'block';
            adminPanel.style.display = 'none';
        }
    });
    
    // Заменяем старую функцию входа
document.getElementById('adminLoginBtn').addEventListener('click', () => {
    const email = document.getElementById('adminEmail').value.trim();
    const password = document.getElementById('adminPassword').value.trim();
    
    firebase.auth().signInWithEmailAndPassword(email, password)
        .then(() => {
            // Проверка, является ли пользователь администратором
            const user = firebase.auth().currentUser;
            if (user && user.email === "admin@animeplayer.com") {
                loginPanel.style.display = 'none';
                adminPanel.style.display = 'block';
                loadPlaylists();
            } else {
                firebase.auth().signOut();
                loginError.textContent = "Только администраторы могут войти";
            }
        })
        .catch(error => {
            loginError.textContent = "Ошибка входа: " + error.message;
        });
});
    
    // Выход из системы
    logoutBtn.addEventListener('click', () => {
        auth.signOut();
    });
    
    // Загрузка плейлистов
    function loadPlaylists() {
        db.collection("playlists").get()
            .then((querySnapshot) => {
                playlists = [];
                adminPlaylists.innerHTML = '';
                animePlaylist.innerHTML = '<option value="">Выберите плейлист</option>';
                episodePlaylist.innerHTML = '<option value="">Выберите плейлист</option>';
                
                querySnapshot.forEach((doc) => {
                    const playlist = doc.data();
                    playlist.id = doc.id;
                    playlists.push(playlist);
                    
                    // Добавление в список плейлистов
                    const li = document.createElement('li');
                    li.className = 'admin-item';
                    li.innerHTML = `
                        <span>${playlist.name}</span>
                        <button class="delete-btn" data-id="${playlist.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    `;
                    adminPlaylists.appendChild(li);
                    
                    // Добавление в выпадающие списки
                    const option = document.createElement('option');
                    option.value = playlist.id;
                    option.textContent = playlist.name;
                    
                    animePlaylist.appendChild(option.cloneNode(true));
                    episodePlaylist.appendChild(option);
                });
                
                // Обработка удаления плейлистов
                document.querySelectorAll('.delete-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const id = btn.dataset.id;
                        if (confirm("Удалить плейлист и все связанные данные?")) {
                            db.collection("playlists").doc(id).delete()
                                .then(() => {
                                    loadPlaylists();
                                });
                        }
                    });
                });
            })
            .catch((error) => {
                console.error("Ошибка загрузки плейлистов: ", error);
            });
    }
    
    // Добавление плейлиста
    addPlaylistBtn.addEventListener('click', () => {
        const name = playlistName.value.trim();
        if (name) {
            db.collection("playlists").add({
                name: name,
                animes: []
            })
            .then(() => {
                playlistName.value = '';
                loadPlaylists();
            })
            .catch(error => {
                console.error("Ошибка добавления плейлиста: ", error);
            });
        }
    });
    
    // Обновление списка аниме при выборе плейлиста
    animePlaylist.addEventListener('change', () => {
        const playlistId = animePlaylist.value;
        if (playlistId) {
            adminAnimes.innerHTML = '';
            
            const playlist = playlists.find(p => p.id === playlistId);
            if (playlist && playlist.animes) {
                playlist.animes.forEach(anime => {
                    const li = document.createElement('li');
                    li.className = 'admin-item';
                    li.innerHTML = `
                        <span>${anime.title}</span>
                        <button class="delete-btn" data-id="${anime.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    `;
                    adminAnimes.appendChild(li);
                    
                    // Обработка удаления аниме
                    li.querySelector('.delete-btn').addEventListener('click', (e) => {
                        e.stopPropagation();
                        if (confirm("Удалить аниме и все серии?")) {
                            const updatedAnimes = playlist.animes.filter(a => a.id !== anime.id);
                            db.collection("playlists").doc(playlistId).update({
                                animes: updatedAnimes
                            })
                            .then(() => {
                                loadPlaylists();
                            });
                        }
                    });
                });
            }
        }
    });
    
    // Добавление аниме
    addAnimeBtn.addEventListener('click', () => {
        const playlistId = animePlaylist.value;
        const title = animeTitle.value.trim();
        const image = animeImage.value.trim();
        const description = animeDescription.value.trim();
        
        if (!playlistId) {
            alert("Выберите плейлист");
            return;
        }
        
        if (!title) {
            alert("Введите название аниме");
            return;
        }
        
        const playlist = playlists.find(p => p.id === playlistId);
        if (!playlist) return;
        
        const newAnime = {
            id: Date.now().toString(),
            title: title,
            image: image,
            description: description,
            episodes: []
        };
        
        const updatedAnimes = [...(playlist.animes || []), newAnime];
        
        db.collection("playlists").doc(playlistId).update({
            animes: updatedAnimes
        })
        .then(() => {
            animeTitle.value = '';
            animeImage.value = '';
            animeDescription.value = '';
            loadPlaylists();
        })
        .catch(error => {
            console.error("Ошибка добавления аниме: ", error);
        });
    });
    
    // Обновление списка аниме при выборе плейлиста для серий
    episodePlaylist.addEventListener('change', () => {
        const playlistId = episodePlaylist.value;
        if (playlistId) {
            episodeAnime.innerHTML = '<option value="">Выберите аниме</option>';
            
            const playlist = playlists.find(p => p.id === playlistId);
            if (playlist && playlist.animes) {
                playlist.animes.forEach(anime => {
                    const option = document.createElement('option');
                    option.value = anime.id;
                    option.textContent = anime.title;
                    episodeAnime.appendChild(option);
                });
            }
        }
    });
    
    // Добавление серии
    addEpisodeBtn.addEventListener('click', () => {
        const playlistId = episodePlaylist.value;
        const animeId = episodeAnime.value;
        const title = episodeTitle.value.trim();
        const url = episodeUrl.value.trim();
        
        if (!playlistId || !animeId) {
            alert("Выберите плейлист и аниме");
            return;
        }
        
        if (!title || !url) {
            alert("Заполните все поля");
            return;
        }
        
        const playlist = playlists.find(p => p.id === playlistId);
        if (!playlist) return;
        
        const anime = playlist.animes.find(a => a.id === animeId);
        if (!anime) return;
        
        // Преобразование обычной ссылки VK в прямую
        let directUrl = url;
        if (url.includes('vk.com/video')) {
            const matches = url.match(/video(-?\d+_\d+)/);
            if (matches && matches[1]) {
                const [oid, id] = matches[1].split('_');
                directUrl = `https://vk.com/video_ext.php?oid=${oid}&id=${id}`;
            }
        }
        
        const newEpisode = {
            id: Date.now().toString(),
            title: title,
            url: directUrl
        };
        
        const updatedEpisodes = [...(anime.episodes || []), newEpisode];
        const updatedAnimes = playlist.animes.map(a => {
            if (a.id === animeId) {
                return {...a, episodes: updatedEpisodes};
            }
            return a;
        });
        
        db.collection("playlists").doc(playlistId).update({
            animes: updatedAnimes
        })
        .then(() => {
            episodeTitle.value = '';
            episodeUrl.value = '';
            loadPlaylists();
        })
        .catch(error => {
            console.error("Ошибка добавления серии: ", error);
        });
    });
});
