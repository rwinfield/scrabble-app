import '../App.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSupabaseUser } from './supabaseUser';

function Account() {
    const [username, setUsername] = useState(null);
    const [oldUsername, setOldUsername] = useState('');
    const [uuid, setUuid] = useState('');

    const { supabaseUser: user, updateUsername: updateSessionUsername } = useSupabaseUser();

    useEffect(() => {
        async function getUserData() {
            if (user) {
                setUuid(user.id);
                
                // const response = await axios.get(`http://localhost:5050/users/${user.id}`);
                // setUsername(response.data[0].username);
                // setOldUsername(response.data[0].username);
                setUsername(user.username);
                setOldUsername(user.username);
            }
        }

        getUserData();
    }, [user]);

    async function updateUsername() {

        function invalidUsername() {
            for (let i = 0; i < username.length; i++) {
                let char = username.charAt(i);
                if ((char < 'A' || char > 'Z') && (char < 'a' || char > 'z') && (char < '0' || char > '9') && (char !== '_')) {
                    return true;
                }
            }
            return false;
        }

        async function usernameAlreadyExists() {
            const res = await axios.get(`http://localhost:5050/users/findByUsername/${encodeURIComponent(username)}`);
            return (Object.keys(res.data).length !== 0);
        }

        if (username.length < 3 || username.length > 20) {
            alert('Userame must be between 3 and 20 characters.');
        }
        else if (invalidUsername()) {
            alert('Username must contain only letters (\'a-z\', \'A-Z\'), digits (\'0-9\'), and underscores (\'_\').');
        }
        else if (await usernameAlreadyExists()) {
            if (username === oldUsername) {
                alert(`${username} is already your username.`)
            }
            else {
                alert(`Username ${username} already exists.`);
            }
        }
        else {
            await axios.post(`http://localhost:5050/users/update/${uuid}`, {
                username: username
            }).then(() => {
                updateSessionUsername(username);
                alert(`Successfully updated your username from "${oldUsername}" to "${username}".`)
            });
        }
    };

    return (
        <div className="App">
            <header className="App-header">
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