import React from "react";
import { Link, useNavigate } from "react-router-dom";


const NotFound = () => {
    const navigate = useNavigate();
    
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center bg-white px-4">
      <img src="/images/404-cow.png" alt="404" className="w-64 h-auto mb-6" />
      <h1 className="text-3xl md:text-4xl font-bold text-red-600 mb-4">404 - Page Not Found</h1>
      <p className="text-gray-600 mb-6">Oops! The page you’re looking for doesn’t exist.</p>
      <Link
        onClick={()=>{navigate(-1)}}
        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition"
      >
        Go to Home
      </Link>
    </div>
  );
};

export default NotFound;
