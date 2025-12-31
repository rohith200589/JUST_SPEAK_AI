// src/components/NotFoundPage.jsx
import React from 'react';
import { Link } from 'react-router-dom'; // Assuming react-router-dom is used for navigation
import { Frown } from 'lucide-react'; // A sad face icon for the 404 page

const NotFoundPage = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white font-sans p-4">
            <Frown size={80} className="text-blue-600 dark:text-blue-400 mb-6 animate-bounce-in" />
            <h1 className="text-5xl sm:text-7xl font-extrabold mb-4 text-center">
                404
            </h1>
            <h2 className="text-2xl sm:text-3xl font-semibold mb-4 text-center">
                Page Not Found
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 text-center max-w-md">
                Oops! The page you're looking for might have been removed, had its name changed, or is temporarily unavailable.
            </p>
            <Link
                to="/" // Adjust this to your application's actual home path
                className="px-6 py-3 bg-blue-600 text-white rounded-md shadow-lg hover:bg-blue-700 transition-colors duration-300 text-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
            >
                Go to Homepage
            </Link>
        </div>
    );
};

export default NotFoundPage;
