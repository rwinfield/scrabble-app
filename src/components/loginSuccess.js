import '../App.css';
import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import supabase from './supabaseClient';
import 'reactjs-popup/dist/index.css';
import PlayPopup from './popups/playPopup';
import InvitePlayersPopup from './popups/invitePlayersPopup';
import ViewInvitesPopup from './popups/viewInvitesPopup';
import { useSupabaseUser } from './supabaseUser';
import { io } from 'socket.io-client';

function LoginSuccess() {

    const navigate = useNavigate();

    const { supabaseUser: user } = useSupabaseUser();

    async function signOutUser() {
        await supabase.auth.signOut();
        navigate("/");
        
    }

    return (
        <div className="App">
            <header className="App-header">
                <div>
                    <h1>Welcome, {user.username ? user.username : user.email}!</h1>
                    { !user.username && (
                        <h4>Before you can play, you must set your username. Please click on "My account" below to set your username.</h4>
                    )}
                    <br/>
                        {/* <PlayPopup usernameExists={user.username}/> */}
                        <InvitePlayersPopup/>
                        <ViewInvitesPopup/>
                    <br/>
                    <button onClick={() => navigate("/account")}>My account</button>
                    <button onClick={() => signOutUser()}>Sign out</button>
                </div>
            </header>
        </div>
    )
};
    
export default LoginSuccess;