const router = require('express').Router();
let Invite = require('../models/invite-model');

// return invites that are 1) valid, 2) match the player id, and 3) do not have the player as the host
router.route('/getInvitesForUser/:uuid').get((req, res) => {
    const uuid = req.params.uuid;
    Invite.find({
        'active': true,
        'players': {
          $elemMatch: {
            'uuid': uuid,
            'isHost': { $ne: true }
          }
        }
    })
        .then(invites => res.json(invites))
        .catch(err => res.status(400).json('Error: ' + err));
})

router.route('/add').post((req, res) => {
    const newInvite = new Invite(req.body);
    newInvite.save()
        .then(() => res.json('Invite added!'))
        .catch(err => res.status(400).json('Error: ' + err));
});

module.exports = router;