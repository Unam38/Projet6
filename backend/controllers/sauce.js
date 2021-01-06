const Sauce = require('../models/sauce');
const fs = require('fs');

exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    const sauce = new Sauce({
      ...sauceObject,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
      likes: 0,
      dislikes: 0
    });
    sauce.save()
      .then(() => res.status(201).json({ message: 'Objet enregistré !'}))
      .catch(error => res.status(400).json({ error }));
};

exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ?
        {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        } : { ...req.body };
    Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Objet modifié !'}))
        .catch(error => res.status(400).json({ error }));
};

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            const filename = sauce.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, () => {
                Sauce.deleteOne({ _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Objet supprimé !'}))
                    .catch(error => res.status(400).json({ error }));
            });
        })
        .catch(error => res.status(500).json({ error }));
};

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(404).json({ error }));
};

exports.getAllSauces = (req, res, next) => {
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json({ error }));
};

exports.addLikeDislike = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
        const userId = req.body.userId;
        const userWantsToLike = (req.body.like === 1);
        const userWantsToDislike = (req.body.like === -1);
        const userWantsToCancel = (req.body.like === 0);
        const userCanLike = (!sauce.usersLiked.includes(userId));
        const userCanDislike = (!sauce.usersDisliked.includes(userId));
        const userCanCancel = (sauce.usersLiked.includes(userId) || sauce.usersDisliked.includes(userId));
        
        if (userWantsToLike && userCanLike) {sauce.usersLiked.push(userId)};
        if (userWantsToDislike && userCanDislike) {sauce.usersDisliked.push(userId)};
        if (userWantsToCancel && userCanCancel) {
            if (sauce.usersLiked.includes(userId)) {
                let index = sauce.usersLiked.indexOf(userId);
                sauce.usersLiked.splice(index, 1);
            } else {
                let index = sauce.usersDisliked.indexOf(userId);
                sauce.usersDisliked.splice(index, 1);
            }
        }
        sauce.likes = parseInt(sauce.usersLiked.length);
        sauce.dislikes = parseInt(sauce.usersDisliked.length);
        const updatedSauce = sauce;
        updatedSauce.save();
        return updatedSauce;
    })
    .then(sauce => res.status(200).json(sauce))
    .catch(error => res.status(400).json({ error }));
};