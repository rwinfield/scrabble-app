import '../App.css';
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useNavigate } from 'react-router-dom';
import supabase from './supabaseClient'

export default function Login() {
    const navigate = useNavigate();

    try { // sometimes Google auth will store auth token; clear in case this happens
        localStorage.removeItem('prevAccessToken');
    }
    catch {}

    supabase.auth.onAuthStateChange(
        async (event, session) => {
            console.log("auth state changed: ", session);

            // store access token in local storage
            // if an auth change is detected, compare it with the existing auth token
            // if the two are different, then accept it as a login 
            // if the two are the same, then it is not a login (supposed """feature""" of Supabase)
            if (session && localStorage.getItem('prevAccessToken') !== null && session.access_token !== localStorage.getItem('prevAccessToken') && event !== "SIGNED_OUT") {
                navigate('/logged_in');
                localStorage.removeItem('prevAccessToken');

            }
            else {
                localStorage.setItem('prevAccessToken', session ? session.access_token : null);
            }
        }
    );
       
    return (
        <div className="App">
            <header className="App-header">
                <Auth
                    supabaseClient={supabase}
                    appearance={{ theme: ThemeSupa }}
                    theme="dark"
                    providers={["google"]}
                    redirectTo='http://localhost:3000/logged_in'
                />
            </header>
        </div>
    );
}
