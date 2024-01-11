import '../App.css';
import React, { useState, useEffect } from 'react';
import supabase from './supabaseClient';
import axios from 'axios';

function Account() {
    const [displayName, setDisplayName] = useState('');
    const [oldDisplayName, setOldDisplayName] = useState('');
    const [username, setUsername] = useState(null);
    const [oldUsername, setOldUsername] = useState('');
    const [uuid, setUuid] = useState('');

    useEffect(() => {
        async function getUserData() {
            await supabase.auth.getUser().then(async (value) => {
                if (value.data?.user) {
                    setDisplayName(value.data.user.user_metadata?.full_name || '');
                    setOldDisplayName(value.data.user.user_metadata?.full_name || '');
                    setUuid(value.data.user.id);
                    
                    const response = await axios.get(`http://localhost:5050/users/${value.data.user.id}`);
                    setUsername(response.data[0].username);
                    setOldUsername(response.data[0].username);
                }
            });
        }

        getUserData();
    }, []);

    async function updateDisplayName() {
        await axios.post('http://localhost:5050/users/update/')
        await supabase.auth.updateUser({data : {full_name : displayName}}).then(() => {
            alert(`Successfully updated your display name from "${oldDisplayName}" to "${displayName}".`);
        });
    }

    async function updateUsername() {

        function invalidUsername() {
            console.log("hello!!!")
            for (let i = 0; i < username.length; i++) {
                let char = username.charAt(i);
                if ((char < 'A' || char > 'Z') && (char < 'a' || char > 'z') && (char < '0' || char > '9') && (char !== '_')) {
                    return true;
                }
            }
            return false;
        }

        if (username.length < 3 || username.length > 20) {
            alert('Userame must be between 3 and 20 characters.');
        }
        else if (invalidUsername()) {
            alert('Username must contain only letters (\'a-z\', \'A-Z\'), digits (\'0-9\'), and underscores (\'_\').');
        }
        else {
            await axios.post(`http://localhost:5050/users/update/${uuid}`, {
                username: username
            }).then(alert(`Successfully updated your username from "${oldUsername}" to "${username}".`));
        }
    };

    return (
        <div className="App">
            <header className="App-header">
                <input 
                    type="text"
                    defaultValue={displayName}
                    onChange={(event) => setDisplayName(event.target.value)}>
                </input>
                <button onClick={updateDisplayName}>Update Display Name</button>
                <br/>
                <input 
                    type="text"
                    defaultValue={username}
                    onChange={(event) => setUsername(event.target.value)}>
                </input>
                <button onClick={updateUsername}>Update Username</button>
            </header>
        </div>
    )
}

export default Account;