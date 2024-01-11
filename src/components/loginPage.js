import '../App.css';
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import supabase from './supabaseClient'

function Login() {
    const navigate = useNavigate();

    function onAuthStateChange(callback) {
        let currentSession = null;
      
        // https://github.com/supabase/gotrue-js/issues/284 for solution to auto-redirect on leaving tab, many thanks
        supabase.auth.onAuthStateChange((event, session) => {
            if (session?.user?.id === currentSession?.user?.id) return;
            currentSession = session;
            callback(session);
        });
    }

    useEffect(() => {
        onAuthStateChange(async (event) => {
            if (event === "SIGNED_IN") {
                navigate("/logged_in"); 
            }
            else {
                navigate("/");
            }
        });  
    }, []);
    
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