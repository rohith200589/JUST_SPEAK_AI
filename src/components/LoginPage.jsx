// src/components/LoginPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [userName, setUserName] = useState(''); // New state for user name
    const [isSigningUp, setIsSigningUp] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showEmailSentMessage, setShowEmailSentMessage] = useState(false);

    const { signUp, signIn, user, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    // Redirect if user is already logged in
    useEffect(() => {
        if (!authLoading && user) {
            navigate('/', { replace: true });
        }
    }, [user, authLoading, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        let result;
        if (isSigningUp) {
            result = await signUp(email, password, userName); // Pass userName to signUp
        } else {
            result = await signIn(email, password);
        }

        setLoading(false);

        if (result.error) {
            toast.error(result.error.message);
        } else {
            if (isSigningUp) {
                toast.success('Sign Up successful! Please check your email to confirm your account.');
                setShowEmailSentMessage(true);
            } else {
                toast.success('Logged in successfully!');
            }
        }
    };

    // If auth context is still loading, show a loader
    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 font-sans">
                 <Loader2 className="animate-spin text-blue-500 w-12 h-12" />
                 <p className="ml-3 text-lg text-gray-700 dark:text-gray-300">Checking session...</p>
            </div>
        );
    }

    // Render the email sent message if showEmailSentMessage is true
    if (showEmailSentMessage) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 font-sans">
                <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md border border-gray-200 dark:border-gray-700 text-center">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Email Sent!
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 mb-6">
                        Please check your inbox (and spam folder) to confirm your email address.
                        You can close this tab after confirmation.
                    </p>
                    <button
                        onClick={() => {
                            setShowEmailSentMessage(false);
                            setEmail('');
                            setPassword('');
                            setUserName(''); // Clear username too
                            setIsSigningUp(false); // Reset to login view
                        }}
                        className="px-6 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-300 ease-in-out"
                    >
                        Back to Login
                    </button>
                </div>
                <ToastContainer />
            </div>
        );
    }


    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 font-sans">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md border border-gray-200 dark:border-gray-700">
                <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-6">
                    {isSigningUp ? 'Sign Up' : 'Log In'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                    {isSigningUp && ( // Conditionally render name input for sign-up
                        <div>
                            <label htmlFor="userName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Name
                            </label>
                            <input
                                type="text"
                                id="userName"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                required
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                                placeholder="Your Name"
                            />
                        </div>
                    )}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                            placeholder="you@example.com"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                            placeholder="********"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={loading}
                    >
                        {loading && <Loader2 className="animate-spin mr-2 h-5 w-5" />}
                        {isSigningUp ? 'Sign Up' : 'Log In'}
                    </button>
                </form>
                <div className="mt-6 text-center">
                    <button
                        onClick={() => {
                            setIsSigningUp(!isSigningUp);
                            setEmail(''); // Clear fields when switching modes
                            setPassword('');
                            setUserName('');
                            setShowEmailSentMessage(false); // Hide message if switching back
                        }}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-600 text-sm font-medium transition-colors duration-200"
                    >
                        {isSigningUp ? 'Already have an account? Log In' : "Don't have an account? Sign Up"}
                    </button>
                </div>
            </div>
            <ToastContainer />
        </div>
    );
};

export default LoginPage;