const router = require('express').Router();
let Invite = require('../models/invite-model');
const { route } = require('./users');

// return invites that 1) are valid, 2) match the player id, 3) do not have the player as the host, and 4) have not been declined
router.route('/getInvitesForUser/:uuid').get((req, res) => {
    const uuid = req.params.uuid;
    Invite.find({
        'active': true,
        'players': {
          $elemMatch: {
            'uuid': uuid,
            'isHost': { $ne: true },
            'declined': {$ne: true }
          }
        }
    })
        .then(invites => res.json(invites))
        .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/add').post((req, res) => {
    const newInvite = new Invite(req.body);
    newInvite.save()
        .then(() => res.json('Invite added!'))
        .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/update/:lobbyID').post((req, res) => {
    const _lobbyID = req.params.lobbyID;
    const newAcceptedStatus = req.body.newAcceptedStatus;
    const newDeclinedStatus = req.body.newDeclinedStatus;
    const _uuid = req.body.uuid;
    Invite.findOne({lobbyID: _lobbyID})
        .then((invite) => {
            const playerIndex = invite.players.findIndex(player => player.uuid === _uuid);
            invite.players[playerIndex].accepted = newAcceptedStatus;
            invite.players[playerIndex].declined = newDeclinedStatus;
            invite.save()
                .then(() => res.json('Invite updated!'))
                .catch(err => res.status(400).json('Error: ' + err));
        })
        .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/getInviteByLobbyID/:lobbyID').get((req, res) => {
    Invite.findOne({lobbyID: req.params.lobbyID})
        .then(invite => res.json(invite))
        .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/closeLobby/:lobbyID').post((req, res) => {
    Invite.findOne({lobbyID: req.params.lobbyID})
        .then((invite) => {
            invite.active = false;
            invite.save()
                .then(() => res.json('Invite updated!'))
                .catch(err => res.status(400).json('Error: ' + err));
        });
});

router.route('/updateInviteOnDisconnect/:uuid').post((req, res) => {
    const uuid = req.params.uuid;
    const lobbyID = req.body.lobbyID;
    const isHost = req.body.isHost;
    Invite.findOne({ lobbyID: lobbyID })
        .then(invite => {
            const playerIndex = invite.players.findIndex(player => player.uuid === uuid);

            invite.players[playerIndex].accepted = false;

            if (isHost) invite.active = false;

            invite.save()
                .then(() => res.json({
                        invite: invite, 
                        retPlayer: invite.players[playerIndex]
                    }))
                .catch(err => res.status(400).json('Error: ' + err));
        })
        .catch(err => res.status(400).json('Error: ' + err));
});

router.route('/setLobbyInactive').post((req, res) => {
    const lobbyID = req.body.lobbyID;
    Invite.findOne({ lobbyID: lobbyID })
        .then(invite => {
            invite.active = false;
            invite.save()
                .then(() => res.json('Invite updated!'))
                .catch(err => res.status(400).json('Error: ' + err));
        })
        .catch(err => res.status(400).json('Error: ' + err));
});

module.exports = router;