const isLoggedIn = (req, res, next) => {
    if (!req.session.userId) {
        req.flash('error', 'You must be logged in to do that');
        return res.redirect('/login');
    }
    next();
};

const isOwner = async (req, res, next, model) => {
    const doc = await model.findById(req.params.id);
    if (!doc) {
        req.flash('error', 'Document not found');
        return res.redirect('back');
    }
    if (!doc.owner.equals(req.session.userId)) {
        req.flash('error', 'You do not have permission to do that');
        return res.redirect('back');
    }
    next();
};

module.exports = {
    isLoggedIn,
    isOwner
};
