import React from 'react';
import { useSupabaseUser } from './supabaseUser';
import { useNavigate } from 'react-router-dom';

function Restricted({ children }) {
    const { supabaseUser, loading } = useSupabaseUser();
    const navigate = useNavigate();

    if (loading) {
        return (
        <div className="App">
            <header className="App-header">
            <div>
                <h1>Loading...</h1>
            </div>
            </header>
        </div>
        );
    }

    if (!supabaseUser) {
        return (
        <div className="App">
            <header className="App-header">
            <h2>Please log in to view the contents of this page.</h2>
            <br />
            <button onClick={() => navigate('/')}>Sign in</button>
            </header>
        </div>
        );
    }

    return <div>{children}</div>;
}

export default Restricted;