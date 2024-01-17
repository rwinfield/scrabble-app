import '../App.css';
import { useNavigate } from 'react-router-dom';
import React, { useEffect } from 'react';
import supabase from './supabaseClient';
import axios from 'axios';
import 'reactjs-popup/dist/index.css';

import PlayPopup from './popups/playPopup';
import { useSupabaseUser } from './supabaseUser';

function LoginSuccess() {
    
    const navigate = useNavigate();

    const { supabaseUser: user } = useSupabaseUser();

    useEffect(() => {
        async function getUserData() {            
            if (user) {
                const uuid = user.id;
                
                // THIS PART TO BE MOVED TO LOGIN PAGE. THIS SHOULD HAPPEN DIRECTLY AFTER A NEW USER SIGNS UP.
                async function initAccount() {
                    await axios.get(`http://localhost:5050/users/${uuid}`)
                        .then(async response => {
                            if (response.data.length === 0) {
                                await axios.post('http://localhost:5050/users/add', {
                                    uuid: uuid,
                                    username: ""
                                });
                            }
                        })
                        .catch(async (error) => {
                            console.log(error);
                        })
                }

                initAccount();
            }
        }

        getUserData();
    }, [user])

    async function signOutUser() {
        try { // sometimes Google auth will store auth token; clear in case this happens
            localStorage.removeItem('prevAccessToken');
        }
        catch {}
        await supabase.auth.signOut();
        navigate("/");
        
    }

    return (
        <div className="App">
            <header className="App-header">
                <div>
                    <h1>Welcome, {user.username ? user.username : user.email}!</h1>
                    <br/>
                        <PlayPopup/>
                    <br/>
                    <button onClick={() => navigate("/account")}>My account</button>
                    <button onClick={() => signOutUser()}>Sign out</button>
                </div>
            </header>
        </div>
    )
};
    
export default LoginSuccess;