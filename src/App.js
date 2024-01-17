import './App.css';
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./components/loginPage";
import LoginSuccess from "./components/loginSuccess";
import Account from "./components/accountPage";
import Restricted from "./components/restricted";
import { SupabaseUserProvider } from "./components/supabaseUser";

function App() {
    return (
        <Router>
            <div>
                <Routes>
                    <Route path="/" element={ <Login/> }/>
                    <Route path="/logged_in" element={ <SupabaseUserProvider><Restricted><LoginSuccess/></Restricted></SupabaseUserProvider> }/>
                    <Route path="/account" element={ <SupabaseUserProvider><Restricted><Account/></Restricted></SupabaseUserProvider> }/>
                </Routes>
            </div>
        </Router>
    );
}

export default App;
