import '../App.css';
import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import supabase from './supabaseClient';
import axios from 'axios';

function LoginSuccess() {
    const [user, setUser] = useState({});
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        async function getUserData() {
            await supabase.auth.getUser().then((value) => {
                if (value.data?.user) {
                    setUser(value.data.user);

                    const uuid = value.data.user.id;
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
                setLoading(false);

                
            })
        }

        getUserData();
    }, [])

    async function signOutUser() {
        await supabase.auth.signOut();
        navigate("/");
    }

    return (
        <div className="App">
            <header className="App-header">
                {!loading && <div>
                    <h1>Welcome, {user.user_metadata?.full_name ? user.user_metadata.full_name : user.email}!</h1>
                    <br/>
                    <button onClick={() => navigate("/account")}>My account</button>
                    <button onClick={() => signOutUser()}>Sign out</button>
                </div>
                }
            </header>
        </div>
    )
};
    
export default LoginSuccess;