import { io } from 'socket.io-client';
import socket from './socket'
import { useEffect, useState, useContext, createContext } from 'react';
import { useSupabaseUser } from './supabaseUser';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';

const inviteHandlerContext = createContext();

export const useInviteHandler = () => {
    return useContext(inviteHandlerContext);
}

export default function InviteHandlerProvider({ children }) {

    const { supabaseUser: user } = useSupabaseUser();

    const [gamesInvitedTo, setGamesInvitedTo] = useState([]);
    const [lobbyStatus, setLobbyStatus] = useState(null);
    
    useEffect(() => {

        // When a user is offline, they can still be invited to a game.
        // When they log back on, they should see the invites that have been sent to them,
        // provided the invites are still active (i.e. host hasn't started the game without the player)
        async function getInvitesForUser() {
            const invitesWhileAway = await axios.get(`http://localhost:5050/invites/getInvitesForUser/${user.id}`);
            console.log(invitesWhileAway);
            invitesWhileAway.data.forEach(invite => {
                const playerIndex = invite.players.findIndex(player => player.uuid === user.id);
                if (invite.players[playerIndex].accepted) { // if the user accepted an invite in a previous sesson that is still valid, then rejoin 
                    setLobbyStatus(invite);
                    socket.emit('accept-invite', invite);
                }
                else {
                    setGamesInvitedTo(old => [...old, invite]);
                }
            });
        }

        getInvitesForUser();

        if (!socket) return;
        socket.emit('initUser', user.id);
        socket.on('connect', () => {
            console.log('socket connected');
            console.log(socket);
        });

        socket.on('receive-invite', (invite, hostUsername) => {
            try {
                setGamesInvitedTo(old => [...old, invite]);
                const inviteMessage = `${hostUsername} is inviting you to their game!`                
                toast.success(inviteMessage);
                console.log(inviteMessage);
            } catch (err) {
                console.log(err);
            }
            
        });

        socket.on('update-lobby', async (invite, username, action) => {
            setLobbyStatus(invite);
            if (action === "accept") {
                toast.success(`${username} joined the game!`)
            }
            else if (action === "decline") {
                toast.success(`${username} declined to join.`)
            }
            else {
                toast.success(`${username} left the game.`)
            }
        })

        socket.on('host-left', (invite) => {
            if (user.id === invite.players[0].uuid) {
                toast.success('You have terminated the game.');
            }
            else {
                toast.success('The host has left. The game has been cancelled.')
            }

            setLobbyStatus(null);
            setGamesInvitedTo(oldInvites => oldInvites.filter(inv => inv.lobbyID !== invite.lobbyID)); // reset
        })

        socket.on('player-left', (invite) => {
            setLobbyStatus(null);
            setGamesInvitedTo(oldInvites => oldInvites.filter(inv => inv.lobbyID !== invite.lobbyID)); // reset
            // reset
        })

        socket.on('player-disconnect', async (invite, retUsername) => {
            toast.success(`${retUsername} has disconnected.`);
            setLobbyStatus(invite);
        })

        socket.on('host-disconnect', async (lobbyID) => {
            toast.success('The host has disconnected. The game has been cancelled.');
            setLobbyStatus(null);
            setGamesInvitedTo(oldInvites => oldInvites.filter(inv => inv.lobbyID !== lobbyID));
        })

        socket.on('set-inactive', async (lobbyID) => { // needed in the case that there are no players in the lobby
            await axios.post('http://localhost:5050/invites/setLobbyInactive', {lobbyID: lobbyID});
        })

        return (() => {
            socket.disconnect();
        })
        
    }, []);

    return (
        <inviteHandlerContext.Provider value={{gamesInvitedTo, setGamesInvitedTo, lobbyStatus, setLobbyStatus}}>
            <Toaster />
            {children}
        </inviteHandlerContext.Provider>
    )
}

    