import '../App.css';
import React, { useState, useEffect } from 'react';
import supabase from './supabaseClient'

function Account() {
    const [displayName, setDisplayName] = useState('');
    const [oldName, setOldName] = useState('');

    useEffect(() => {
        async function getUserData() {
            await supabase.auth.getUser().then((value) => {
                if (value.data?.user) {
                    setDisplayName(value.data.user.user_metadata?.full_name || '');
                    setOldName(value.data.user.user_metadata?.full_name || '');
                }
            })
        }

        async function getUsername() {}

        getUserData();
        getUsername();
    }, []);

    async function updateDisplayName() {
        console.log("old name: " + oldName);
        await supabase.auth.updateUser({data : {full_name : displayName}}).then(() => {
            console.log(displayName);
            alert(`Successfully updated your display name from "${oldName}" to "${displayName}".`);
        });
    }

    // async function updateUsername() {
    //     console.log("old name: " + oldName);
    //     await supabase.auth.updateUser({data : {full_name : displayName}}).then(() => {
    //         console.log(displayName);
    //         alert(`Successfully updated your display name from "${oldName}" to "${displayName}".`);
    //     });
    // }

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
                {/* <input 
                    type="text"
                    defaultValue={username}
                    onChange={(event) => setUsername(event.target.value)}>
                </input>
                <button onClick={updateUsername}>Update Username</button> */}
            </header>
        </div>
    )
}

export default Account;