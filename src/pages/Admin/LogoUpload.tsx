import React, { useState, useEffect, useCallback } from 'react';
import axios, { AxiosResponse, AxiosError } from 'axios';
import { useAuth } from '../../authContext/Auth';
import imageCompression from 'browser-image-compression';
import { toast } from 'react-toastify';

// Define interfaces for context and API responses
interface AuthContext {
  authorizationToken: string;
  logout: () => void;
}

interface LogoUploadResponse {
  message: string;
  logoUrl: string;
}

interface ErrorResponse {
  error?: string;
}

const LogoUpload: React.FC = () => {
  const { authorizationToken, logout } = useAuth() as AuthContext;
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  const fetchLogo = useCallback(async () => {
    try {
      const response: AxiosResponse<Blob> = await axios.get(`${import.meta.env.VITE_BACK_URL}/logo`, {
        headers: { Authorization: authorizationToken },
        responseType: 'blob',
      });
      const url = URL.createObjectURL(response.data);
      setLogoUrl(url);
    } catch (error) {
      console.error('Error fetching logo:', error);
    }
  }, [authorizationToken]);

  useEffect(() => {
    if (!logoUrl) fetchLogo();
  }, [logoUrl, fetchLogo]); // Removed authorizationToken from dependencies to avoid unnecessary re-renders

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/png', 'image/jpeg', 'image/gif'];

    if (selectedFile) {
      if (!allowedTypes.includes(selectedFile.type)) {
        setMessage('Please select a valid image (PNG, JPEG, or GIF).');
        setFile(null);
        return;
      }
      if (selectedFile.size > maxSize) {
        setMessage('File size exceeds 5MB limit.');
        setFile(null);
        return;
      }

      try {
        const compressedFile = await imageCompression(selectedFile, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1024,
        });
        setFile(compressedFile);
        setMessage('');
      } catch (error) {
        console.error('Error compressing image:', error);
        setMessage('Failed to compress image.');
      }
    }
  };

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      setMessage('Please select a logo to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('logo', file);

    try {
      setLoading(true);

      const res: AxiosResponse<LogoUploadResponse> = await axios.post(
        `${import.meta.env.VITE_BACK_URL}/logo/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: authorizationToken,
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              Math.round((progressEvent.loaded * 100) / progressEvent.total);
            }
          },
        }
      );

      toast.success(res.data.message);
      setFile(null);
      setLogoUrl(res.data.logoUrl);
      await fetchLogo();
      logout();
      toast.info('Please Re-Login.');
    } catch (err) {
      const error = err as AxiosError<ErrorResponse>;
      console.error('Upload error:', error);
      console.timeEnd('upload');
      setMessage(
        error.response?.status === 401
          ? error.response?.data?.error?.toLowerCase().includes('user info')
            ? 'User information is missing. Please log in again.'
            : 'Unauthorized. Please check your admin access.'
          : error.response?.data?.error || 'Upload failed'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-2xl font-semibold mb-4 text-gray-800">Upload Site Logo</h3>

      {logoUrl && (
        <div className="mb-4 text-center">
          <img
            src={logoUrl}
            alt="Current Logo"
            className="w-32 h-auto mx-auto"
            onError={() => console.error('Logo failed to load.')}
          />
          <p className="text-sm text-gray-500 mt-2">Current Logo</p>
        </div>
      )}

      <form onSubmit={handleUpload} className="flex flex-col gap-4">
        <input
          type="file"
          accept="image/*"
          onChange={handleChange}
          disabled={loading}
          className="block w-full text-sm text-gray-600
                     file:mr-4 file:py-2 file:px-4
                     file:rounded file:border-0
                     file:text-sm file:font-semibold
                     file:bg-blue-50 file:text-blue-700
                     hover:file:bg-blue-100
                     cursor-pointer"
        />
        <button
          type="submit"
          disabled={loading}
          className={`bg-blue-600 text-white py-2 rounded transition-colors duration-200
            hover:bg-blue-700 ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          {loading ? 'Uploading...' : 'Upload'}
        </button>
      </form>

      {message && (
        <p
          className={`mt-4 text-center font-medium ${
            message.toLowerCase().includes('failed') || message.toLowerCase().includes('unauthorized')
              ? 'text-red-600'
              : 'text-green-600'
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
};

export default LogoUpload;