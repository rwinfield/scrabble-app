import { createContext, useContext, useEffect, useState } from 'react';
import supabase from './supabaseClient';
import axios from 'axios';

const supabaseUserContext = createContext();

export const useSupabaseUser = () => {
    return useContext(supabaseUserContext);
};

export const SupabaseUserProvider = ({ children }) => {
    const [supabaseUser, setSupabaseUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchSupabaseUser() {
            const { data, error } = await supabase.auth.getUser();
            if (error) {
                console.error('Error: ' + error);
                setLoading(false);
                return;
            }
            if (data?.user) {
                let username = "";
                try {
                    const response = await axios.get(`http://localhost:5050/users/${data.user.id}`);
                    username = response.data[0].username;
                }
                catch (error) {
                    console.log("Error: ", error);
                }
                data.user.username = username;
                setSupabaseUser(data.user);
                setLoading(false);
            }
            
        }

        fetchSupabaseUser();
    }, [loading]);

    // immediately update user object when updating username
    async function updateUsername(newUsername) {
        setSupabaseUser({
            ...supabaseUser, 
            username: newUsername 
        });
    };

    return (
        <supabaseUserContext.Provider value={{ supabaseUser, loading, updateUsername }}>
            {children}
        </supabaseUserContext.Provider>
    );
};



