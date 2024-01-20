import React, { useState, useEffect } from 'react';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import { io } from 'socket.io-client';
import { useInviteHandler } from '../inviteHandler';

const ViewInvitesPopup = () => {

    const { gamesInvitedTo: gamesInvitedTo } = useInviteHandler();

    const numInvites = Object.keys(gamesInvitedTo).length;

    // manages popup closing effect
    const [closing, setClosing] = useState(false);   
    
    console.log("GAMES INVITED TO: ", gamesInvitedTo)

    console.log("numInvites: ", numInvites);

    function getHostName(invite) {
        try {
            return invite.players[0].username;
        } catch (e) {
            console.error(e);
        }
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
                                        <button>Accept</button>
                                        <button>Decline</button>
                                    </li>
                                </div>
                            ))}
                            <br height='50'/>
                        </div>
                        
                    )}
                    <button onClick={() => {
                        setClosing(true);
                        setTimeout(() => {
                            close();
                        }, 400);
                    }}>Close</button>
                </div>
            )}
        </Popup>
    )
}

export default ViewInvitesPopup;