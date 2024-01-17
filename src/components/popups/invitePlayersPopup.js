import React, { useState, useEffect } from 'react';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import axios from 'axios';
import { useSupabaseUser } from '../supabaseUser';

const InvitePopup = ({ openInvitePopup, setOpenInvitePopup }) => {

    // manages popup closing effect
    const [closing, setClosing] = useState(false);

    // the current username that is in the text box
    const [currentSearchUsername, setCurrentSearchUsername] = useState('');

    // the username that the user searched for (to be displayed with 'add' button or 'no results found' text)
    const [enteredSearchUsername, setEnteredSearchUsername] = useState('');

    // an object representing the player that the user searched for
    const [searchedPlayer, setSearchedPlayer] = useState({});

    // a player was found with the searched username (toggles 'add' button)
    const [playerFound, setPlayerFound] = useState(false);

    // a player was not found with the searched username (toggles 'no results found' text)
    const [playerNotFound, setPlayerNotFound] = useState(false);

    // the searched player has already been added to the list
    const [playerAlreadyAdded, setPlayerAlreadyAdded] = useState(false);

    // number of players the user has added to the game (max of 3)
    const [playerCount, setPlayerCount] = useState(0);

    // if the user searches for their own username
    const [selfFound, setSelfFound] = useState(false);

    // the user's own username (works in tandem with the above)
    const [ownUsername, setOwnUsername] = useState('');


    // list of the players the user would like to invite
    const [inviteList, setInviteList] = useState([]);

    const { supabaseUser: user } = useSupabaseUser();

    useEffect(() => {
        function getUserData() {
            if (user) {
                setOwnUsername(user.username);
            }
        }

        getUserData();
    }, [user]);

    /** 
    * Checks if a user exists with the entered username 
    */
    async function handlePlayerSearch() {
        setPlayerFound(false); // initialize with false to reset player found status (i.e. if previous player found)
        setPlayerNotFound(false);
        setSelfFound(false);
        setPlayerAlreadyAdded(false);

        if (currentSearchUsername === ownUsername) {
            setSelfFound(true);
            return;
        }

        setEnteredSearchUsername(currentSearchUsername);
        for (let player of inviteList) {
            if (player.username === currentSearchUsername) {
                setPlayerAlreadyAdded(true);
                return;
            }
        }

        const res = await axios.get(`http://localhost:5050/users/findByUsername/${encodeURIComponent(currentSearchUsername)}`);
        
        if (Object.keys(res.data).length !== 0) { // user is found with this username
            setPlayerFound(true);
            setSearchedPlayer(res.data[0]);
        }
        else {
            setPlayerNotFound(true);
            setEnteredSearchUsername(currentSearchUsername);
        }
    }

    function addToInviteList() {
        setInviteList((prevState) => [
            ...prevState,
            {
                uuid: searchedPlayer.uuid,
                username: searchedPlayer.username
            }
        ]);

        // will de-render the searched player username and the 'add' button
        setPlayerFound(false); 

        // resets the text field
        setCurrentSearchUsername('');

        // increase player count
        setPlayerCount(playerCount + 1);
    }

    const handleDelete = (playerToRemove) => {
        const newList = inviteList.filter((player) => player !== playerToRemove);
        setInviteList(newList);
        setPlayerCount(playerCount - 1);
    }
    
    return (
        <Popup modal nested 
            className={closing ? 'custom' : ''}
            onOpen={() => {setClosing(false)}}
            closeOnDocumentClick={false}
            open = {openInvitePopup}
            >
            {close => (
                <div className={closing ? 'custom-popup' : ''}>
                    Search for other players (max: 3)
                    <br/>
                    <input
                        type="text"
                        placeholder="Enter a username..."
                        value={currentSearchUsername}
                        onChange={(event) => setCurrentSearchUsername(event.target.value.trim())}
                        disabled={playerCount === 3 ? true : false}
                    />
                    <br/>
                    <button onClick={() => {handlePlayerSearch()}}>Search</button>
                    {playerFound && (
                        <div>
                            {enteredSearchUsername}
                            <button onClick={() => {addToInviteList()} }>Add</button>
                        </div>
                    )}
                    {playerNotFound && (
                        <div>
                            No player found with the username '{enteredSearchUsername}'.
                        </div>
                    )}
                    {selfFound && (
                        <div>
                            Did you really think you could invite yourself?
                        </div>
                    )}
                    {playerAlreadyAdded && (
                        <div>
                            You have already added '{enteredSearchUsername}'.
                        </div>
                    )}
                    <br/>
                    {inviteList.length > 0 && <h4>Your invite list:</h4>}
                    {Object.keys(inviteList).map((playerKey) => (
                        <div key={playerKey}>
                            {inviteList[playerKey].username !== '' && (
                            <li>
                                {inviteList[playerKey].username}
                                <button onClick={() => handleDelete(inviteList[playerKey])}>Remove</button>
                            </li>
                            )}
                        </div>
                    ))}

                    <br height='50'/>
                    <button onClick={() => {
                        setClosing(true);
                        setTimeout(() => {
                            close();
                            setOpenInvitePopup(false);
                        }, 400);
                    }}>Close</button>
                </div>
                
            )}   
        </Popup>
    )
}

export default InvitePopup;