import '../App.css';
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import supabase from './supabaseClient'

function Login() {

    const navigate = useNavigate();
    
    //let old_event; // prevents redirect to success page upon leaving tab

    useEffect(() => {
        supabase.auth.onAuthStateChange(async (event) => {
            if (event === "SIGNED_IN" /*&& old_event !== event*/) {
                navigate("/logged_in"); 
            }
            else {
                navigate("/");
            }
        });  
    }, [navigate]);
    
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

export default Login;