const Genre = require('../models/Genre');
const Movie = require('../models/Movie');

async function showAllGenres(req, res) {
    try {
        const allGenres = await Genre.retrieveAllGenres();
        res.render('genres/index', { allGenres });
    }
    catch (error) {
        res.render('error', { message: 'Unable to retrieve genres' });
    }
}

async function showGenresWithMovies(req, res) {
    try {
        const allGenres = await Genre.retrieveAllGenres();
        const selectedGenre = req.query.genre || '';
        let allMovies = [];

        if (selectedGenre) {
            allMovies = await Movie.retrieveAllMovies();
            allMovies = allMovies.filter(movie => movie.genre === selectedGenre);
        }

        res.render('genres/filter', { allGenres, allMovies, selectedGenre });
    }
    catch (error) {
        res.render('error', { message: 'Unable to filter movies by genre' });
    }
}

function showAddForm(req, res) {
    res.render('genres/new', { inputError: undefined, formValues: undefined });
}

async function addOneGenre(req, res) {
    const checkInputError = validateInput(req);

    if (checkInputError.status) {
        res.render('genres/new', { inputError: checkInputError.messages, formValues: req.body });
    }
    else {
        try {
            await Genre.createOneGenre(req);
            req.session.messages = { success: 'Genre added successfully!' };
            res.redirect('/genres');
        }
        catch (error) {
            req.session.messages = { error: error.message };
            res.redirect('/genres/new');
        }
    }
}

async function getOneGenre(req, res) {
    try {
        const genre = await Genre.findOneGenre(req.params.id);
        if (!genre) return res.render('error', { message: 'Genre not found' });

        const allMovies = await Movie.retrieveAllMovies();
        const relatedMovies = allMovies.filter(movie => movie.genre === genre.name);

        res.render('genres/genre', { genre, relatedMovies });
    }
    catch (error) {
        res.render('error', { message: 'Invalid Genre ID' });
    }
}

async function showEditForm(req, res) {
    try {
        const genre = await Genre.findOneGenre(req.params.id);
        if (!genre) return res.render('error', { message: 'Genre not found' });

        res.render('genres/edit', { genre });
    }
    catch (error) {
        res.render('error', { message: 'Invalid Genre ID' });
    }
}

async function editGenre(req, res) {
    const checkInputError = validateInput(req);

    if (checkInputError.status) {
        res.json({ inputError: checkInputError.messages });
    }
    else {
        try {
            await Genre.updateOneGenre(req.params.id, req.body);
            res.json({ message: 'Success, Genre updated', redirect: `/genres/${req.params.id}` });
        }
        catch (error) {
            res.json({ message: `Failed, ${error.message}`, redirect: `/genres/${req.params.id}/edit` });
        }
    }
}

async function deleteGenre(req, res) {
    try {
        await Genre.removeOneGenre(req.params.id);
        res.json({ message: 'Success, Genre deleted', redirect: '/genres' });
    }
    catch (error) {
        res.json({ message: `Failed, ${error.message}`, redirect: `/genres/${req.params.id}` });
    }
}

function validateInput(req) {
    let errors = { status: false, messages: [] };

    if (!req.body.name || req.body.name.trim() === '') {
        errors.status = true;
        errors.messages.push('Genre name is required');
    }

    if (!req.body.description || req.body.description.trim() === '') {
        errors.status = true;
        errors.messages.push('Genre description is required');
    }

    return errors;
}

module.exports = {
    showAllGenres,
    showGenresWithMovies,
    showAddForm,
    addOneGenre,
    getOneGenre,
    showEditForm,
    editGenre,
    deleteGenre
};