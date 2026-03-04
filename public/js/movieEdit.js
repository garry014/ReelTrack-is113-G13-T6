let titleInput = document.getElementById('title')
let directorInput = document.getElementById('director')
let yearInput = document.getElementById('year')
let posterInput = document.getElementById('poster')
let durationInput = document.getElementById('duration')
let genreInput = document.getElementById('genre')
let synopsisInput = document.getElementById('synopsis')
let editMovieForm = document.getElementById('editMovieForm')
let movieid = document.getElementById('movieid')

editMovieForm.addEventListener('submit', (event) => {
    event.preventDefault()
    const movieData = {
        title: titleInput.value,
        genre: genreInput.value,
        releaseYear: yearInput.value,
        director: directorInput.value,
        posterUrl: posterInput.value,
        duration: durationInput.value,
        synopsis: synopsisInput.value
    }
    // fetch request to edit movie (PUT)
    fetch(`/movies/${movieid.value}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(movieData)
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        location.href = data.redirect
    })
    .catch(error => alert(error.message))

})