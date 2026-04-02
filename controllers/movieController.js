const Movie = require('../models/Movie');
const Genre = require('../models/Genre');
const { getAverageRating } = require('../models/Review');

async function showAllMovies(req, res) {
    try {
        const allMovies = await Movie.retrieveAllMovies();
        res.render('movies/index', { allMovies, extraCSS: ['/css/movie.css'] });
    }
    catch (error) {
        res.render('error', { message: 'Unable to retreive data' });
    }
}

async function getOneMovie(req, res) {
    try {
        const movie = await Movie.findOneMovie(req.params.id);
        if (!movie) return res.render('error', { message: 'Movie not found' });
        const ratingData = await getAverageRating(movie._id);
        res.render('movies/movie', { movie, ratingData });
    }
    catch (error) {
        res.render('error', { message: 'Invalid Movie ID' });
    }
}

async function showMoviesByGenre(req, res) {
    try {
        const allGenres = await Genre.retrieveAllGenres();
        const selectedGenre = req.query.genre || '';
        let allMovies = [];

        if (selectedGenre) {
            allMovies = await Movie.retrieveAllMovies();
            allMovies = allMovies.filter(movie => movie.genre === selectedGenre);
        }

        res.render('movies/filter', { allGenres, allMovies, selectedGenre });
    }
    catch (error) {
        res.render('error', { message: 'Unable to filter movies by genre' });
    }
}

async function addOneMovie(req, res) {
    const checkInputError = validateInput(req)
    if(checkInputError.length > 0){
        const allActiveGenre = await Genre.retrieveActiveGenres();
        res.render('movies/new', { inputError: checkInputError, formValues: req.body, allActiveGenre })
    }else{
        try {
            await Movie.createOneMovie(req)
            req.session.messages = { success: 'Movie added successfully!' };
            res.redirect('/movies');
        }
        catch (error) {
            req.session.messages = { error: error.message };
            res.redirect('/movies/new');
        }
    }
}

async function showAddForm(req, res){
    try{
        const allActiveGenre = await Genre.retrieveActiveGenres();
        res.render('movies/new', {inputError:[], formValues: undefined, allActiveGenre});
    } catch(error){
        res.render('error', {message: 'Unable to retrieve Genre options'})
    }
}

async function showEditForm(req, res) {
    try {
        const movie = await Movie.findOneMovie(req.params.id);
        if (!movie) return res.render('error', { message: 'Movie not found' });
         const allActiveGenre = await Genre.retrieveActiveGenres();
        res.render('movies/edit', { movie, allActiveGenre });
    }
    catch (error) {
        res.render('error', { message: 'Invalid Movie ID' });
    }
}

async function editMovie(req, res) {
    const checkInputError = validateInput(req)
    if (checkInputError.length > 0){
        res.json({inputError: checkInputError})
    }else{
        try {
            await Movie.updateOneMovie(req.params.id, req.body)
            res.json({ message: 'Success, Movie updated', redirect: `/movies/${req.params.id}` })
        }
        catch (error) {
            res.json({ message: `Failed, ${error.message}`, redirect: `/movies/${req.params.id}/edit` })
        }
    }
}

async function deleteMovie(req, res) {
    try {
        await Movie.removeOneMovie(req.params.id)
        res.json({ message: 'Sucess, Movie deleted', redirect: `/movies` })
    }
    catch (error) {
        res.json({ message: `Failed, ${error.message}`, redirect: `/movies/${req.params.id}` })
    }
}

function validateInput(req){
    let errors = []
    const { title, director, genre, releaseYear, duration, posterUrl, synopsis } = req.body
    const currentYear = new Date().getFullYear();
    if (isNaN(releaseYear) || !Number.isInteger(Number(releaseYear))
        || releaseYear < 1950 || releaseYear > currentYear) {
            errors.push(`Release Year must be a number and between year 1950 and ${currentYear} (inclusive)`)
    }
    if (isNaN(duration) || !Number.isInteger(Number(duration)) || duration < 1) {
        errors.push("Duration must be a number more than 0")
    }

    if (!title || !title.trim()){
        errors.push('Title is required.');
    }

    if (!genre || !genre.trim()){
        errors.push('Genre is required.');
    }

    if (!director || !director.trim()){
        errors.push('Director is required.');
    }

    if (!synopsis || !synopsis.trim()){
        errors.push('Synopsis is required.');
    }

    if (!posterUrl || !posterUrl.trim()) {
        errors.push('Poster URL is required.');
    }
    return errors
}

module.exports = {
    showAllMovies,
    showMoviesByGenre,
    getOneMovie,
    addOneMovie,
    showAddForm,
    showEditForm,
    editMovie,
    deleteMovie
}