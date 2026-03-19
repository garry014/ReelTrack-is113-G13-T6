const Movie = require('../models/Movie');
const { getAverageRating } = require('../models/Review');

// Validates all movie input fields. Returns an array of error strings.
// An empty array means everything is valid.
async function validateMovieInput(body) {
    const errors = [];

    // Required text fields
    if (!body.title || !body.title.trim())
        errors.push('Title is required.');

    if (!body.genre || !body.genre.trim())
        errors.push('Genre is required.');

    if (!body.director || !body.director.trim())
        errors.push('Director is required.');

    if (!body.synopsis || !body.synopsis.trim())
        errors.push('Synopsis is required.');

    // Release year
    const year = Number(body.year ?? body.releaseYear);
    const currentYear = new Date().getFullYear();

    if (!body.year && !body.releaseYear) {
        errors.push('Release year is required.');
    } else if (isNaN(year) || !Number.isInteger(year)) {
        errors.push('Release year must be a whole number.');
    } else if (year < 1950 || year > currentYear) {
        errors.push(`Release year must be between 1950 and ${currentYear}.`);
    }

    // Duration
    const duration = Number(body.duration);
    if (!body.duration && body.duration !== 0) {
        errors.push('Duration is required.');
    } else if (isNaN(duration) || !Number.isInteger(duration) || duration <= 0) {
        errors.push('Duration must be a positive whole number (minutes).');
    }

    // Poster URL (add form sends 'poster', edit fetch sends 'posterUrl')
    const posterUrl = body.poster || body.posterUrl;
    if (!posterUrl || !posterUrl.trim()) {
        errors.push('Poster URL is required.');
    }

    return errors;
}

// ---------------------------------------------------------------------------
// Controllers
// ---------------------------------------------------------------------------

async function showAllMovies(req, res) {
    try {
        const allMovies = await Movie.getAllMovies();
        res.render('movies/index', { allMovies, extraCSS: ['/css/movie.css'] });
    }
    catch (error) {
        res.render('error', { message: 'Unable to retreive data' });
    }
}

async function getOneMovie(req, res) {
    try {
        const movie = await Movie.findMovieById(req.params.id);
        if (!movie) return res.render('error', { message: 'Movie not found' });
        const ratingData = await getAverageRating(movie._id);
        res.render('movies/movie', { movie, ratingData });
    }
    catch (error) {
        res.render('error', { message: 'Invalid Movie ID' });
    }
}

async function addOneMovie(req, res) {
    try {
        const errors = await validateMovieInput(req.body);
        if (errors.length > 0) {
            return res.render('movies/new', {
                formData: req.body,
                messages: { error: errors.join(' ') }
            });
        }

        await Movie.createMovie({
            title: req.body.title.trim(),
            genre: req.body.genre.trim(),
            releaseYear: Number(req.body.year),
            director: req.body.director.trim(),
            posterUrl: req.body.poster.trim(),
            addedBy: req.session.userId,
            duration: Number(req.body.duration),
            synopsis: req.body.synopsis.trim()
        });
        req.session.messages = { success: 'Movie added successfully!' };
        res.redirect('/movies');
    }
    catch (error) {
        req.session.messages = { error: error.message };
        res.redirect('/movies/new');
    }
}

async function showEditForm(req, res) {
    try {
        const movie = await Movie.findMovieById(req.params.id);
        if (!movie) return res.render('error', { message: 'Movie not found' });
        res.render('movies/edit', { movie });
    }
    catch (error) {
        res.render('error', { message: 'Invalid Movie ID' });
    }
}

async function editMovie(req, res) {
    try {
        const errors = await validateMovieInput(req.body);
        if (errors.length > 0) {
            return res.json({ success: false, message: errors.join(' ') });
        }

        await Movie.updateMovieById(req.params.id, req.body);
        res.json({ success: true, message: 'Movie updated successfully!', redirect: `/movies/${req.params.id}` });
    }
    catch (error) {
        res.json({ success: false, message: `Failed to update movie: ${error.message}` });
    }
}

async function deleteMovie(req, res) {
    try {
        await Movie.deleteMovieById(req.params.id);
        res.json({ message: 'Sucess, Movie deleted', redirect: `/movies` });
    }
    catch (error) {
        res.json({ message: `Failed, ${error.message}`, redirect: `/movies/${req.params.id}` });
    }
}

module.exports = {
    showAllMovies,
    getOneMovie,
    addOneMovie,
    showEditForm,
    editMovie,
    deleteMovie
}