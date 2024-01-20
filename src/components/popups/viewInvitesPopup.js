import React, { useState, useEffect } from 'react';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import socket from '../socket'
import { useInviteHandler } from '../inviteHandler';

const ViewInvitesPopup = () => {

    let { gamesInvitedTo } = useInviteHandler();

    const sortedByDate = gamesInvitedTo
        .map(obj => { return { ...obj, date: new Date(obj.date) } })
        .sort((a, b) => b.date - a.date);

    gamesInvitedTo = sortedByDate;

    const numInvites = Object.keys(gamesInvitedTo).length;

    // manages popup closing effect
    const [closing, setClosing] = useState(false);   
    
    console.log("GAMES INVITED TO: ", gamesInvitedTo)

    console.log("numInvites: ", numInvites);

    function getHostName(invite) {
        console.log(invite);
        try {
            return invite.players[0].username;
        } catch (e) {
            console.error(e);
        }
    }

    function getTimeElapsed(invite) {
        try {
            const date = invite.date;
            const elapsed = new Date().getTime() - date;
            const s = Math.floor(elapsed/1000);
            const m = Math.floor((elapsed/1000)/60);
            const h = Math.floor((elapsed/1000)/3600);
            const d = Math.floor((elapsed/1000)/(24*3600));
            console.log(`${d}d, ${h}h, ${m}m, ${s}s`);
            if (d >= 1) {
                return `${d}d`
            }
            else if (h >= 1) {
                return `${h}h`
            }
            else if (m >= 1) {
                return `${m}m`
            }
            else {
                return `${s}s`
            }
        } catch (e) {
            console.log(e);
        }
    }

    function acceptInvite(invite) {
        console.log("I JUST EMITTED")
        socket.emit('accept-invite', invite);
        // update invite obj in database so that the user's accpted field is true
    }

    function declineInvite(invite) {
        // update invite obj in database so that the user's accpted field is false
    }

    function handleClose(close) {
        setClosing(true);
        setTimeout(() => {
            close();
        }, 400);
    }

    return (
        <Popup modal
            className={closing ? 'custom' : ''}
            onOpen={() => {setClosing(false)}}
            closeOnDocumentClick={false}
            trigger={<button>View invites ({numInvites})</button>}
            >
            {close => (
                <div>
                    {numInvites === 0 && (
                        <h3>No invites found.</h3>
                    )}
                    {numInvites !== 0 && (
                        <div>
                            <h3>{numInvites} invite{numInvites === 1 ? "" : "s"}:</h3>
                            {Object.keys(gamesInvitedTo).map((key) => (
                                <div key={key}>
                                    <li>
                                        {getHostName(gamesInvitedTo[key])}
                                        <br/>
                                        <button onClick={() => {acceptInvite(gamesInvitedTo[key]); handleClose(close);}}>Accept</button>
                                        <button onClick={() => declineInvite(gamesInvitedTo[key])}>Decline</button>
                                        {getTimeElapsed(gamesInvitedTo[key])} ago
                                    </li>
                                </div>
                            ))}
                            <br height='50'/>
                        </div>
                        
                    )}
                    <button onClick={() => {
                        handleClose(close);
                    }}>Close</button>
                </div>
            )}
        </Popup>
    )
}

export default ViewInvitesPopup;