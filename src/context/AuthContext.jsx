// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Loader2 } from 'lucide-react'; // 
// Initialize Supabase Client using environment variables
// Make sure to set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY in your .env file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
// Check if variables are defined
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase URL or Anon Key is not defined in environment variables. Please check your .env file.");
  // Fallback for development if .env is missing, but should be properly configured
  // For production, this check is critical.
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true); // Tracks if the initial auth state is being loaded

    useEffect(() => {
        // Function to get initial session and set up auth state listener
        const getInitialSession = async () => {
            const { data: { session }, error } = await supabase.auth.getSession();
            if (error) {
                console.error("Error getting initial session:", error.message);
            }
            setSession(session);
            setUser(session?.user || null); // Set user from session or null
            setLoading(false); // Initial loading complete
        };

        getInitialSession(); // Call immediately on mount

        // Set up real-time listener for auth state changes
        const { data: authListener } = supabase.auth.onAuthStateChange(
            (event, session) => {
                setSession(session);
                setUser(session?.user || null); // Update user based on new session
                setLoading(false); // Ensure loading is false after any state change
                console.log('Supabase Auth State Change:', event, session?.user?.id);
            }
        );

        // Cleanup function for the listener
        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []); // Empty dependency array ensures this runs once on mount

    const signUp = async (email, password, userName) => {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: userName, // Store the name in user metadata
                    },
                },
            });
            if (error) throw error;
            return { data };
        } catch (error) {
            return { error };
        }
    };

    const signIn = async (email, password) => {
        setLoading(true);
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        setLoading(false);
        if (error) {
            console.error('Sign In Error:', error.message);
            return { error };
        }
        console.log('Sign In Success:', data);
        return { data };
    };

    const signOut = async () => {
        setLoading(true);
        const { error } = await supabase.auth.signOut();
        setLoading(false);
        if (error) {
            console.error('Sign Out Error:', error.message);
            return { error };
        }
        console.log('Sign Out Success');
        setUser(null);
        setSession(null);
        return { error: null };
    };

    const value = {
        user,
        session,
        loading,
        signUp,
        signIn,
        signOut,
        supabase, // Expose supabase client if needed elsewhere for other operations
    };

    // Only render children when authentication state is loaded
    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
            {loading && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-900 z-[9999]">
                    <Loader2 className="animate-spin text-blue-500 w-12 h-12" />
                    <p className="ml-3 text-lg text-gray-700 dark:text-gray-300">Loading authentication...</p>
                </div>
            )}
        </AuthContext.Provider>
    );
};