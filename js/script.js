document.addEventListener('DOMContentLoaded', () => {
    const apiKey = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkNGFjZWU2Y2ZmMDBhNTNjYjE1NjE5NWNmNGEyM2M5MyIsIm5iZiI6MTczOTg4NDU0OS4zMjA5OTk5LCJzdWIiOiI2N2I0ODgwNTFlZDQ1Mjg0NTM5ZmI2NTQiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.xfyeXxd9pqUdNS2U8yLfciBOk5pl6hQvexrXowx6rVI';

    const fetchData = (url) => {
        return fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Erreur HTTP! Statut: ${response.status}`);
                }
                return response.json();
            })
            .catch(error => console.error('Erreur lors de la récupération des données:', error));
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Intl.DateTimeFormat('fr-FR', options).format(new Date(dateString));
    };

    const getGenres = (genreIds) => {
        const genreMap = {
            28: 'Action', 12: 'Aventure', 16: 'Animation', 35: 'Comédie',
            80: 'Crime', 99: 'Documentaire', 18: 'Drame', 10751: 'Familial',
            14: 'Fantastique', 36: 'Histoire', 27: 'Horreur', 10402: 'Musique',
            9648: 'Mystère', 10749: 'Romance', 878: 'Science-Fiction',
            10770: 'Téléfilm', 53: 'Thriller', 10752: 'Guerre', 37: 'Western'
        };
        return genreIds.map(id => genreMap[id]).join(', ');
    };

    const updateTrendingMovies = (type) => {
        let movieApiUrl;
        if (type === 'day') {
            movieApiUrl = 'https://api.themoviedb.org/3/trending/movie/day?language=fr-FR';
        } else if (type === 'week') {
            movieApiUrl = 'https://api.themoviedb.org/3/trending/movie/week?language=fr-FR';
        }

        fetchData(movieApiUrl)
            .then(data => {
                const tendancesContainer = document.getElementById('tendances');
                tendancesContainer.innerHTML = '';
                const numberOfMoviesToDisplay = 4;

                for (let i = 0; i < numberOfMoviesToDisplay && i < data.results.length; i++) {
                    const movie = data.results[i];
                    const movieCard = createMediaCard(movie, 'movie');
                    tendancesContainer.appendChild(movieCard);
                }
            });
    };

    const updatePopularTvShows = (type) => {
        let tvApiUrl;
        if (type === 'top_rated') {
            tvApiUrl = 'https://api.themoviedb.org/3/tv/top_rated?language=fr-FR';
        } else if (type === 'popular') {
            tvApiUrl = 'https://api.themoviedb.org/3/tv/popular?language=fr-FR';
        }

        fetchData(tvApiUrl)
            .then(data => {
                const populairesContainer = document.getElementById('populaires');
                populairesContainer.innerHTML = '';
                const numberOfShowsToDisplay = 4;

                for (let i = 0; i < numberOfShowsToDisplay && i < data.results.length; i++) {
                    const tvShow = data.results[i];
                    const tvCard = createMediaCard(tvShow, 'tv');
                    populairesContainer.appendChild(tvCard);
                }
            });
    };

    document.getElementById('day').addEventListener('click', () => {
        document.getElementById('day').classList.add('active');
        document.getElementById('week').classList.remove('active');
        updateTrendingMovies('day');
    });

    document.getElementById('week').addEventListener('click', () => {
        document.getElementById('week').classList.add('active');
        document.getElementById('day').classList.remove('active');
        updateTrendingMovies('week');
    });

    document.getElementById('top_rated').addEventListener('click', () => {
        document.getElementById('top_rated').classList.add('active');
        document.getElementById('popular').classList.remove('active');
        updatePopularTvShows('top_rated');
    });

    document.getElementById('popular').addEventListener('click', () => {
        document.getElementById('popular').classList.add('active');
        document.getElementById('top_rated').classList.remove('active');
        updatePopularTvShows('popular');
    });

    updateTrendingMovies('day');
    updatePopularTvShows('top_rated');

    const createMediaCard = (media, type) => {
        const releaseDate = media.release_date || media.first_air_date;
        const formattedDate = releaseDate ? formatDate(releaseDate) : 'Date inconnue';
        const genres = media.genre_ids ? getGenres(media.genre_ids) : 'Genres inconnus';

        const mediaCard = document.createElement('div');
        mediaCard.classList.add('movie');
        mediaCard.innerHTML = `
            <a href="focus.html?id=${media.id}&type=${type}" class="media-link">
              <img src="https://image.tmdb.org/t/p/w500${media.poster_path}" alt="${media.title || media.name}">
              <h5>${media.title || media.name}</h5>
              <p class="release-date">${formattedDate} · ${type === 'movie' ? 'Film' : 'Série'} · ${genres}</p>
              <div class="score">
                <p>${Math.round(media.vote_average * 10)}%</p>
              </div>
            </a>
        `;
        return mediaCard;
    };

    const searchMovies = (query) => {
        const searchUrl = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}&language=fr-FR`;
        fetchData(searchUrl)
            .then(data => {
                const resultsContainer = document.getElementById('results');
                resultsContainer.innerHTML = '';

                if (data.results.length > 0) {
                    resultsContainer.style.display = 'block';
                    data.results.slice(0, 5).forEach(movie => {
                        const resultItem = document.createElement('div');
                        resultItem.classList.add('result-item');
                        resultItem.innerHTML = `
                            <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}" style="width:50px;margin-right:10px;">
                            <div class="info">
                                <div class="title">${movie.title}</div>
                                <div class="details">${movie.release_date ? formatDate(movie.release_date) : 'Date inconnue'} · Film · ${getGenres(movie.genre_ids)}</div>
                            </div>
                        `;
                        resultItem.addEventListener('click', () => {
                            window.location.href = `focus.html?id=${movie.id}&type=movie`;
                        });
                        resultsContainer.appendChild(resultItem);
                    });
                } else {
                    resultsContainer.style.display = 'none';
                }
            });
    };

    document.getElementById('searchInput').addEventListener('input', function() {
        const query = this.value;
        if (query.length >= 3) {
            searchMovies(query);
        } else {
            document.getElementById('results').style.display = 'none';
        }
    });

    document.getElementById('searchButton').addEventListener('click', function() {
        const query = document.getElementById('searchInput').value;
        if (query) {
            searchMovies(query);
        }
    });
});
