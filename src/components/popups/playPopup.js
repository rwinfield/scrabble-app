import React, { useState } from 'react';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import InvitePopup from './invitePlayersPopup';

const PlayPopup = ({ usernameExists }) => {
    const [openInvitePopup, setOpenInvitePopup] = useState(false);
    const [closing, setClosing] = useState(false);
    return (
        <div>
            <Popup modal nested 
                className={closing ? 'custom' : ''}
                trigger = {<button>Play</button>} 
                onOpen={() => {setClosing(false)}}
                closeOnDocumentClick={false}
                disabled={!usernameExists}
                >
                {close => (
                    <div className={closing ? 'custom-popup' : ''}>
                        <button onClick={() => {setOpenInvitePopup(o => !o); close();}}>Invite players</button>
                        <button>View invitations</button>
                        <br/>
                        <button onClick={() => {
                            setClosing(true);
                            setTimeout(() => {
                                close();
                            }, 400);
                        }}>Close</button>
                    </div>
                )}
            </Popup>
            {openInvitePopup && <InvitePopup openInvitePopup={openInvitePopup} setOpenInvitePopup={setOpenInvitePopup}/>}
        </div>
    )
}

export default PlayPopup;