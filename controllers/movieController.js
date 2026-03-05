const Movie = require('../models/Movie')

async function showAllMovies(req, res) {
    try {
        const allMovies = await Movie.find();
        res.render('movies/index', { allMovies, extraCSS: ['/css/movie.css'] });
    }
    catch (error) {
        res.render('error', { message: 'Unable to retreive data' });
    }
}

async function getOneMovie(req, res) {
    try {
        const movie = await Movie.findById(req.params.id)
        if (!movie) return res.render('error', { message: 'Movie not found' });
        res.render('movies/movie', { movie });
    }
    catch (error) {
        res.render('error', { message: 'Invalid Movie ID' });
    }
}

async function addOneMovie(req, res) {
    try {
        const movie = new Movie({
            title: req.body.title,
            genre: req.body.genre,
            releaseYear: req.body.year,
            director: req.body.director,
            posterUrl: req.body.poster,
            addedBy: req.session.userId,
            duration: req.body.duration,
            synopsis: req.body.synopsis
        });
        await movie.save();
        req.flash('success', 'Movie added successfully!');
        res.redirect('/movies');
    }
    catch (error) {
        req.flash('error', error.message);
        res.redirect('/movies/new');
    }
}

async function showEditForm(req, res) {
    try {
        const movie = await Movie.findById(req.params.id);
        if (!movie) return res.render('error', { message: 'Movie not found' });
        res.render('movies/edit', { movie });
    }
    catch (error) {
        req.flash('error', 'Invalid Movie ID');
        res.redirect(`/movies/${req.params.id}`);
    }
}

async function editMovie(req, res) {
    try {
        await Movie.findByIdAndUpdate(req.params.id, req.body, { runValidators: true });
        res.json({ message: 'Success, Movie updated', redirect: `/movies/${req.params.id}` })
    }
    catch (error) {
        res.json({ message: `Failed, ${error.message}`, redirect: `/movies/${req.params.id}/edit` })
    }
}

async function deleteMovie(req, res) {
    try {
        await Movie.findByIdAndDelete(req.params.id)
        res.json({ message: 'Sucess, Movie deleted', redirect: `/movies` })
    }
    catch (error) {
        res.json({ message: `Failed, ${error.message}`, redirect: `/movies/${req.params.id}` })
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