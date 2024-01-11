import './App.css';
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./components/loginPage";
import LoginSuccess from "./components/loginSuccess";
import Account from "./components/accountPage";
import Restricted from "./components/restricted";

function App() {
    return (
        <Router>
            <div>
                <Routes>
                <Route path="/" element={ <Login/> }/>
                    <Route path="/logged_in" element={ <Restricted><LoginSuccess/></Restricted> }/>
                    <Route path="/account" element={ <Restricted><Account/></Restricted> }/>
                </Routes>
            </div>
        </Router>
    );
}

export default App;
