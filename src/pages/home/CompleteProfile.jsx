import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Mail, Phone, Loader2, LucideLoaderPinwheel } from 'lucide-react';
import { useAuth } from '../../authContext/Auth';

const CompleteProfile = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { storeToken } = useAuth();

  const [formData, setFormData] = useState({
    provider: '',
    providerId: '',
    email: '',
    phone: '',
    username: '',
    name: '',
    roles: ['user'], // Default to 'user'
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const availableRoles = ['user', 'dealer', 'recycler', 'volunteer']; // Exclude 'admin'

  useEffect(() => {
    const authData = JSON.parse(decodeURIComponent(searchParams.get('authData') || '{}'));
    if (!authData.provider || !authData.providerId) {
      toast.error('Invalid authentication data');
      navigate('/login');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      provider: authData.provider,
      providerId: authData.providerId,
      username: authData.username,
      name: authData.name,
      email: authData.email || '', // Pre-fill email if provided
    }));
  }, [searchParams, navigate]);

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10}$/;

    if (!formData.email) newErrors.email = 'Email is required';
    else if (!emailRegex.test(formData.email)) newErrors.email = 'Invalid email format';

    if (!formData.phone) newErrors.phone = 'Phone number is required';
    else if (!phoneRegex.test(formData.phone)) newErrors.phone = 'Phone number must be 10 digits';

    if (!formData.roles || formData.roles.length === 0) newErrors.roles = 'At least one role is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'roles') {
      const selectedRoles = Array.from(e.target.selectedOptions, (option) => option.value);
      setFormData((prev) => ({ ...prev, roles: selectedRoles }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_BACK_URL}/auth/complete-profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to complete profile');
      }

      const { token, user } = data;
      storeToken(token, user, user.roles);

      setTimeout(() => {
        if (user.roles.includes('admin')) {
          navigate('/admin-dashboard');
          toast.success('Admin logged in successfully');
        } else if (user.roles.includes('volunteer')) {
          navigate('/volunteer-dashboard');
          toast.success('Logged in successfully');
        } else if (user.roles.includes('user')) {
          navigate('/user-dashboard');
          toast.success('Logged in successfully');
        } else if (user.roles.includes('dealer')) {
          navigate('/dealer-dashboard');
          toast.success('Logged in successfully');
        } else if (user.roles.includes('recycler')) {
          navigate('/greensorts-dashboard');
          toast.success('Logged in successfully');
        } else {
          toast.error('You are not authorized to access this dashboard.');
          navigate('/login');
        }
      }, 3000);
    } catch (err) {
      toast.error(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 py-10">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <img src="/logo.png" alt="ScrapSeva Logo" className="w-16 mx-auto mb-3" />
          <h1 className="text-xl font-medium text-gray-700">Complete Your Profile</h1>
          <h2 className="text-2xl font-bold text-green-600">ScrapSeva</h2>
        </div>

        <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-2xl shadow-lg border border-gray-200 space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600" size={18} />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full pl-10 pr-4 py-3 text-sm rounded-xl border ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-green-500`}
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>

          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600" size={18} />
            <input
              type="text"
              name="phone"
              placeholder="Phone Number (10 digits)"
              value={formData.phone}
              onChange={handleChange}
              className={`w-full pl-10 pr-4 py-3 text-sm rounded-xl border ${
                errors.phone ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-green-500`}
            />
            {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Roles</label>
            <select
              name="roles"
              multiple
              value={formData.roles}
              onChange={handleChange}
              className={`w-full p-3 text-sm rounded-xl border ${
                errors.roles ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-green-500`}
            >
              {availableRoles.map((role) => (
                <option key={role} value={role}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </option>
              ))}
            </select>
            {errors.roles && <p className="text-xs text-red-500 mt-1">{errors.roles}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-xl text-sm font-semibold hover:bg-green-700 transition"
          >
            {loading && <Loader2 className="animate-spin w-4 h-4" />}
            {loading ? 'Submitting...' : 'Complete Profile'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfile;