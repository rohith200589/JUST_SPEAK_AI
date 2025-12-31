// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react'; // Assuming Loader2 is available

const ProtectedRoute = () => {
    const { user, loading } = useAuth();

    if (loading) {
        // Show a loading indicator while checking authentication status
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-900 z-[9999]">
                <Loader2 className="animate-spin text-blue-500 w-12 h-12" />
                <p className="ml-3 text-lg text-gray-700 dark:text-gray-300">Checking authentication...</p>
            </div>
        );
    }

    // If user is authenticated, render the nested routes (Outlet)
    // Otherwise, redirect to the login page
    return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;