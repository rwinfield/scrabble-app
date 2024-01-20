import '../App.css';
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useNavigate } from 'react-router-dom';
import supabase from './supabaseClient'
import axios from 'axios';
import { io } from 'socket.io-client';
import { useState, useEffect } from 'react';
import { useSupabaseUser } from './supabaseUser';

// export default function Login() {
//     const navigate = useNavigate();

//     try { // sometimes Google auth will store auth token; clear in case this happens
//         localStorage.removeItem('prevAccessToken');
//     }
//     catch {}

//     supabase.auth.onAuthStateChange(
//         async (event, session) => {
//             console.log("auth state changed: ", session);

//             // store access token in local storage
//             // if an auth change is detected, compare it with the existing auth token
//             // if the two are different, then accept it as a login 
//             // if the two are the same, then it is not a login (supposed """feature""" of Supabase)
//             if (session && localStorage.getItem('prevAccessToken') !== null && session.access_token !== localStorage.getItem('prevAccessToken') && event !== "SIGNED_OUT") {
//                 initAccount(session.user.id);
//                 initSocket(session.user.id);
//                 navigate('/logged_in');
//                 localStorage.removeItem('prevAccessToken');
//             }
//             else {
//                 localStorage.setItem('prevAccessToken', session ? session.access_token : null);
//             }
//         }
//     );

//     async function initAccount(uuid) {
//         try {
//             const response = await axios.get(`http://localhost:5050/users/${uuid}`);
//             if (response.data.length === 0) {
//                 // If user not found in the database, initialize account
//                 await axios.post('http://localhost:5050/users/add', {
//                     uuid: uuid,
//                     username: ''
//                 });
//             }
//         } 
//         catch (error) {
//             console.log(error);
//         }
//     }

//     function initSocket(uuid) {
//         const socket = io("http://localhost:4000");
//         socket.emit('initUser', uuid);
//     }
       
//     return (
//         <div className="App">
//             <header className="App-header">
//                 <Auth
//                     supabaseClient={supabase}
//                     appearance={{ theme: ThemeSupa }}
//                     theme="dark"
//                     providers={["google"]}
//                     redirectTo='http://localhost:3000/logged_in'
//                 />
//             </header>
//         </div>
//     );
// }

export default function Login() {
    const navigate = useNavigate();

    // const logOutUser = async () => {
    //     const user = await supabase.auth.getUser();
    //     if (user) supabase.auth.signOut();
    // }

    const [session, setSession] = useState(
        sessionStorage.getItem("session")
    );

    useEffect(() => {
        sessionStorage.setItem("session", JSON.stringify(session));
    }, [session]);
    
    
    useEffect(() => {
        console.log("I AM HERE")
        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, _session) => {
            console.log(`Supbase auth event: ${event}`);
            
            if (event === "SIGNED_IN") {
                setSession(_session);
                console.log("hello there");
                initAccount(_session.user.id);
                initSocket(_session.user.id);
                navigate("/logged_in");
            }
            else {
                // if (event !== "INITIAL_SESSION") {
                //     navigate("/");
                // }
            }

            
        });
        return () => {
            authListener.subscription.unsubscribe();
          };
    }, [session]);

    async function initAccount(uuid) {
        try {
            const response = await axios.get(`http://localhost:5050/users/${uuid}`);
            if (response.data.length === 0) {
                // If user not found in the database, initialize account
                await axios.post('http://localhost:5050/users/add', {
                    uuid: uuid,
                    username: ''
                });
            }
        } 
        catch (error) {
            console.log(error);
        }
    }

    function initSocket(uuid) {
        console.log("hellooooo");
        // const socket = io("http://localhost:4000");
        // socket.emit('initUser', uuid);
    }

    return (
        <div className="App">
            <header className="App-header">
                <Auth
                    supabaseClient={supabase}
                    appearance={{ theme: ThemeSupa }}
                    theme="dark"
                    providers={["google"]}
                    // redirectTo='http://localhost:3000/logged_in'
                />
            </header>
        </div>
    );
}