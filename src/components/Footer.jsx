import axios from 'axios';
import { useState } from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../authContext/Auth';

export default function Footer() {
    const { authorizationToken } = useAuth();

    const navigate = useNavigate();

    const [logoUrl, setLogoUrl] = useState(null);

    useEffect(() => {
        const fetchLogo = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_BACK_URL}/logo`, {
                    headers: { Authorization: authorizationToken },
                    responseType: 'blob',
                });
                const url = URL.createObjectURL(response.data);
                setLogoUrl(url);
            } catch (error) {
                console.error('Error fetching logo:', error);
            }
        };

        if (!logoUrl) fetchLogo();
    }, [logoUrl, authorizationToken]);

    const location = [
        {
            address: import.meta.env.VITE_OFFICE_ADDRESS,
            mapQuery: import.meta.env.VITE_GOOGLE_MAP_QUERY
        }
    ];
    const email = [import.meta.env.VITE_CONTACT_EMAIL];

    return (
        <div className='bg-white text-black'>
            <div>
                {/* section 1 */}
                <div className='w-[85%] mx-auto flex flex-col lg:flex-row gap-3 lg:gap-12 pt-10 pb-14'>
                    <div className='flex-3'>
                        {/* logo */}
                        <div>
                            <div className='w-22 sm:w-28 bg-white'>
                                <div className='w-22 sm:w-28 bg-white'>
                                    <img
                                        src={logoUrl || "/images/gauabhayaranyam.png"}
                                        loading="lazy"
                                        alt="logo"
                                        onError={(e) => {
                                            e.currentTarget.onerror = null;
                                            e.currentTarget.src = "/images/gauabhayaranyam.png";
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                        <p className='text-[1.125rem] font-light py-3 w-[75%] lg:w-auto'>Gauabhayaranyam is a platform that helps you turn unused items into
                            meaningful impact. Our mission has been inspiring homes to contribute since we began this journey.
                        </p>
                        <div className='flex gap-2 [&_img]:cursor-pointer [&_img]:hover:translate-y-[-10px] [&_img]:transition-all [&_img]:duration-500'>
                            <img src="facebook_icon.svg" loading="lazy" alt="" />
                            <img src="twitter_icon.svg" loading="lazy" alt="" />
                            <img src="linkdin_icon.svg" loading="lazy" alt="" />
                            <img src="insta_icon.svg" loading="lazy" alt="" />
                            <img src="youtube_icon.svg" loading="lazy" alt="" />
                        </div>

                    </div>

                    <div className='flex-1 py-10 lg:py-0'>
                        <h2 className='text-[#579B52] text-[1.25rem] font-medium'>Useful Links</h2>
                        <ul className="ml-3 pt-3 space-y-3 text-[1.125rem] font-light">
                            {[
                                { label: "About Us", path: "/about" },
                                { label: "Contact Us", path: "/contact" },
                                { label: "Terms & Conditions", path: "#terms" },
                                { label: "Privacy & Policy", path: "#privacy" }
                            ].map((item, idx) => (
                                <li
                                    key={idx}
                                    onClick={() => navigate(item.path)}
                                    className="cursor-pointer w-fit relative group transition duration-300"
                                >
                                    <span className="text-black group-hover:text-blue-600 transition">
                                        {item.label}
                                    </span>
                                    <span className="absolute left-0 -bottom-0.5 w-0 h-[2px] bg-blue-500 group-hover:w-full transition-all duration-300"></span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className='flex-2'>
                        <h2 className='text-[#579B52] text-[1.25rem] font-medium'>Get In Touch</h2>
                        <div>
                            {Array.isArray(location) && location.map((loc, index) => (
                                <div key={index} className='flex py-3'>
                                    <img className="mt-[-18px]" src="/location_sm.svg" alt="location icon" />
                                    <a
                                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc.mapQuery)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className='ml-3 text-[1.125rem] hover:text-blue-500 hover:underline'
                                    >
                                        {loc.address}
                                    </a>
                                </div>
                            ))}
                        </div>
                        <div>
                            {Array.isArray(email) && email.map((email, index) => (
                                <div key={index} className='flex py-3'>
                                    <img src="/message_sm.svg" alt="email icon" />
                                    <a
                                        href={`mailto:${email}`}
                                        className='ml-3 text-[1.125rem] hover:text-blue-500 hover:underline'
                                    >
                                        {email}
                                    </a>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

                {/* section 2 */}
                <div className='w-full border-[#D9D9D9] border-t-[0.5px] py-4 mt-4 flex justify-center text-center'>
                    <p className='text-[1.125rem] w-[80%] lg:w-auto'>Copyright © {new Date().getFullYear()} <span className='text-[#579B52]'>Gauabhayaranyam</span> Design and Developed by <a href="https://www.izonnet.com/" target="_blank" className='text-[#579B52] hover:text-blue-500 hover:underline'>Izonnet Web Solution Pvt. Ltd.</a></p>
                </div>
            </div>
        </div>
    )
}
