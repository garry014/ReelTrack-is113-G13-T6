const Movie = require('../models/Movie')

async function showAllMovies(req, res){
    try{
        const allMovies = await Movie.find()
        res.render('movies/index', {allMovies})
    }
    catch(error){
        console.log(error)
    }
}

module.exports = {
    showAllMovies
}