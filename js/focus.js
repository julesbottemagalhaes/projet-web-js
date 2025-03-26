document.addEventListener('DOMContentLoaded', () => {
    const apiKey = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkNGFjZWU2Y2ZmMDBhNTNjYjE1NjE5NWNmNGEyM2M5MyIsIm5iZiI6MTczOTg4NDU0OS4zMjA5OTk5LCJzdWIiOiI2N2I0ODgwNTFlZDQ1Mjg0NTM5ZmI2NTQiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.xfyeXxd9pqUdNS2U8yLfciBOk5pl6hQvexrXowx6rVI'; // Remplacez par votre token d'accès

    const fetchData = (url) => {
        return fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        })
            .then(response => response.json())
            .catch(error => console.error('Erreur lors de la récupération des données:', error));
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Intl.DateTimeFormat('fr-FR', options).format(new Date(dateString));
    };

    const formatDuration = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h${mins}`;
    };

    const displayMediaDetails = (mediaId, mediaType) => {
        let mediaUrl;
        if (mediaType === 'movie') {
            mediaUrl = `https://api.themoviedb.org/3/movie/${mediaId}?language=fr-FR&append_to_response=credits,videos`;
        } else if (mediaType === 'tv') {
            mediaUrl = `https://api.themoviedb.org/3/tv/${mediaId}?language=fr-FR&append_to_response=credits,videos`;
        }

        fetchData(mediaUrl)
            .then(data => {
                const banner = document.querySelector('.banner');
                banner.style.backgroundImage = `url('https://image.tmdb.org/t/p/original${data.backdrop_path}')`;

                document.getElementById('focus-poster').src = `https://image.tmdb.org/t/p/w500${data.poster_path}`;
                document.getElementById('focus-title').innerText = data.title || data.name;

                const releaseDate = data.release_date || data.first_air_date;
                const duration = mediaType === 'movie' ? formatDuration(data.runtime) : data.episode_run_time ? formatDuration(data.episode_run_time[0]) : 'N/A';
                const mediaTypeText = mediaType === 'movie' ? 'Film' : 'Série';
                const genres = data.genres.map(genre => genre.name).join(', ');

                document.getElementById('focus-release-date').innerHTML = `${formatDate(releaseDate)} &middot; ${mediaTypeText} &middot; ${duration} &middot; ${genres}`;

                document.getElementById('focus-overview').innerText = data.overview || 'Aucun synopsis disponible.';
                document.getElementById('focus-score').innerText = `${Math.round(data.vote_average * 10)}%`;

                if (data.credits && data.credits.cast && data.credits.cast.length > 0) {
                    document.getElementById('focus-cast').innerHTML = '';
                    const cast = data.credits.cast.slice(0, 8);
                    cast.forEach(actor => {
                        const actorElement = document.createElement('div');
                        actorElement.classList.add('actor');
                        actorElement.innerHTML = `
                            <img src="https://image.tmdb.org/t/p/w500${actor.profile_path}" alt="${actor.name}">
                            <h4>${actor.name}</h4>
                            <span>${actor.character}</span>
                        `;
                        document.getElementById('focus-cast').appendChild(actorElement);
                    });
                } else {
                    document.getElementById('focus-cast').innerHTML = 'Aucun acteur disponible.';
                }

                const trailers = data.videos.results.filter(video => video.site === 'YouTube' && video.type === 'Trailer');
                const trailerContainer = document.getElementById('focus-trailers');
                if (trailers.length > 0) {
                    trailerContainer.innerHTML = '';
                    trailers.forEach(trailer => {
                        const trailerElement = document.createElement('iframe');
                        trailerElement.width = 560;
                        trailerElement.height = 315;
                        trailerElement.src = `https://www.youtube.com/embed/${trailer.key}`;
                        trailerElement.allowFullscreen = true;
                        trailerContainer.appendChild(trailerElement);
                    });
                } else {
                    trailerContainer.innerHTML = 'Aucune bande-annonce disponible.';
                }
            });
    };

    const urlParams = new URLSearchParams(window.location.search);
    const mediaId = urlParams.get('id');
    const mediaType = urlParams.get('type');

    if (mediaId && mediaType) {
        displayMediaDetails(mediaId, mediaType);
    } else {
        console.error('Les paramètres ID ou type sont manquants dans l\'URL.');
    }
});
