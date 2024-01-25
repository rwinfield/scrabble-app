const router = require('express').Router();
let User = require('../models/user-model');

router.route('/').get((req, res) => {
    User.find()
        .then(users => res.json(users))
        .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/:uuid').get((req, res) => {
    User.find({uuid: req.params.uuid})
        .then(user => res.json(user))
        .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/add').post((req, res) => {
    const uuid = req.body.uuid;
    const username = req.body.username;

    const newUser = new User ({
        uuid,
        username
    });

    newUser.save()
        .then(() => res.json('User added!'))
        .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/update/:uuid').post((req, res) => {
    User.findOne({uuid: req.params.uuid})
        .then(user => {
            user.username = req.body.username;
            user.save()
                .then(() => res.json('User updated!'))
                .catch(err => res.status(400).json('Error: ' + err));
        })
        .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/findByUsername/:username').get((req, res) => {
    User.find({username: req.params.username})
        .then(users => res.json(users))
        .catch(err => res.status(400).json('Error: ' + err));
})

module.exports = router;