const isLoggedIn = (req, res, next) => {
    if (!req.session.userId) {
        req.session.messages = { error: 'You must be logged in to do that' };
        return res.redirect('/login');
    }
    next();
};

const isOwner = async (req, res, next, model) => {
    const doc = await model.findById(req.params.id);
    if (!doc) {
        req.session.messages = { error: 'Document not found' };
        return res.redirect('back');
    }
    if (!doc.owner.equals(req.session.userId)) {
        req.session.messages = { error: 'You do not have permission to do that' };
        return res.redirect('back');
    }
    next();
};

const isAdmin = (req, res, next) => {
    if (res.locals.currentUser.role !== 'admin') {
        req.session.messages = { error: 'Only admin can perform this action' };
        return res.redirect('/login')
    }
    next()
}

module.exports = {
    isLoggedIn,
    isOwner,
    isAdmin
};
