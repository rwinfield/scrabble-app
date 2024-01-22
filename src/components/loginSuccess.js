import '../App.css';
import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import supabase from './supabaseClient';
import 'reactjs-popup/dist/index.css';
import InvitePlayersPopup from './popups/invitePlayersPopup';
import ViewInvitesPopup from './popups/viewInvitesPopup';
import { useSupabaseUser } from './supabaseUser';
import { useInviteHandler } from './inviteHandler';
import socket from './socket';
import axios from 'axios';

function LoginSuccess() {

    const navigate = useNavigate();

    const { supabaseUser: user } = useSupabaseUser();
    const { lobbyStatus, setLobbyStatus } = useInviteHandler();

    let inLobby = false;

    if (lobbyStatus?.players) {
        const ownUserIndex = lobbyStatus.players.findIndex(player => player.uuid === user.id);
        inLobby = lobbyStatus.players[ownUserIndex].accepted;
    }

    async function signOutUser() {
        await supabase.auth.signOut();
        navigate("/");
        
    }

    async function handleLeave() {
        if (lobbyStatus.players[0].uuid !== user.id) { // someone other than host left
            await axios.post(`http://localhost:5050/invites/update/${lobbyStatus.lobbyID}`, {
                newAcceptedStatus: false,
                newDeclinedStatus: true,
                uuid: user.id
            })

            const refreshedInvite = (await axios.get(`http://localhost:5050/invites/getInviteByLobbyID/${lobbyStatus.lobbyID}`)).data;

            setLobbyStatus(null);
            socket.emit('leave-lobby', refreshedInvite, user.username);
        }
        else {
            await axios.post(`http://localhost:5050/invites/closeLobby/${lobbyStatus.lobbyID}`);

            socket.emit('host-left-lobby', lobbyStatus);
        }
    }

    /**
     * Display the names of the people invited.
     * - White: accepted
     * - Gray: awaiting response
     * - No name: declined or left 
     */
    const PlayerList = () => {
        return (
            <div>
                <h3>Players:</h3>
                {lobbyStatus.players.map((player) => {
                if (player.accepted && !player.declined) {
                    return (
                        <div key={player.id} style={{ color: 'white' }}>
                            {player.username}
                        </div>
                    );
                } else if (!player.accepted && !player.declined) {
                    return (
                        <div key={player.id} style={{ color: 'gray' }}>
                            {player.username}
                        </div>
                    );
                }

                return null;
                })}
            </div>
        );
      };

    return (
        <div className="App">
            <header className="App-header">
                <div>
                    <h1>Welcome, {user.username ? user.username : user.email}!</h1>
                    { !user.username && (
                        <h4>Before you can play, you must set your username. Please click on "My account" below to set your username.</h4>
                    )}
                    { inLobby && (
                        <div>
                            {user.id === lobbyStatus.players[0].uuid ? (
                                <h4>You are the host</h4>
                            ) : (
                                <h4>You are in {lobbyStatus.players[0].username}'s lobby.</h4>
                            )}
                        <button onClick={() => handleLeave()}>Leave</button>
                        <PlayerList/>
                        </div>
                    )}
                    <br/>
                    { !inLobby && (
                        <div>
                        <InvitePlayersPopup/>
                        <ViewInvitesPopup/>
                        </div>
                    )}
                    <br/>
                    <button onClick={() => navigate("/account")}>My account</button>
                    <button onClick={() => signOutUser()}>Sign out</button>
                </div>
            </header>
        </div>
    )
};
    
export default LoginSuccess;