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
    const [inLobby, setInLobby] = useState(false);
    const [inviteToGame, setInviteToGame] = useState(null);

    console.log("HI I AM HERE");
    
    useEffect(() => {

        // When a user is offline, they can still be invited to a game.
        // When they log back on, they should see the invites that have been sent to them,
        // provided the invites are still active (i.e. host hasn't started the game without the player)
        async function getInvitesForUser() {
            const invitesWhileAway = await axios.get(`http://localhost:5050/invites/getInvitesForUser/${user.id}`);
            console.log(invitesWhileAway);
            invitesWhileAway.data.forEach(invite => {
                if (invite.active) {
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

        socket.on('join-lobby', (invite) => {
            console.log("OK, HERE")
            toast.success(`You joined ${invite.players[0].username}'s lobby!`);
            setInLobby(true);
            setInviteToGame(invite);
        })

        return (() => {
            socket.disconnect()
        })
        
    }, []);

    console.log("GOING TO RETURN:", gamesInvitedTo);

    return (
        <inviteHandlerContext.Provider value={{gamesInvitedTo, inLobby, inviteToGame}}>
            <Toaster />
            {children}
        </inviteHandlerContext.Provider>
    )
}

    