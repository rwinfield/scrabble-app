import '../App.css'
import supabase from './supabaseClient'
import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';

function Restricted({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        async function getUserData() {
            await supabase.auth.getUser().then((value) => {
                if (value.data?.user) {
                    setUser(value.data.user);
                }
            });

            setLoading(false);
        }
        
        getUserData();
    }, []);

    if (loading) {
        return (
            <div className="App">
                <header className="App-header">
                    <div><h1>Loading...</h1></div>
                </header>
            </div>
        );
    }

    if (user) {
        return (
            <div>{children}</div>
        );
    } else {
        return (
            <div className="App">
                <header className="App-header">
                    <h2>Please log in to view the contents of this page.</h2>
                    <br/>
                    <button onClick={() => navigate("/")}>Sign in</button>
                </header>
            </div>
        );
    }
}

export default Restricted;