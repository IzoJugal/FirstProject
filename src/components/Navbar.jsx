import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../authContext/Auth";


export default function Navbar() {
    const { authorizationToken } = useAuth();
    const [showMenu, setShowMenu] = useState(false);
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
    const links = [
        { name: "Home", path: "/" },
        { name: "About", path: "/about" },
        { name: "How It Works", path: "/how-it-works" },
        { name: "Services", path: "/services" },
        { name: "Download", path: "/download-section" },
        { name: "Contact Us", path: "/contact" },
        { name: "Login", path: "/login" },
    ];


    return (
        <div className='bg-[#F8F7F2] w-screen flex justify-between z-50 top-0 sticky overflow-hidden'>

            {/* Logo links to home route */}
            <div className='ml-[7.5%]'>
                <Link to="/" className="cursor-pointer">
                    <img
                        src={logoUrl || "/images/gauabhayaranyam.png"}
                        alt="logo"
                        loading="lazy"
                        className="w-28"
                        onError={(e) => {
                            e.currentTarget.onerror = null; // Prevent infinite fallback loop
                            e.currentTarget.src = "/images/gauabhayaranyam.png";
                        }}
                    />
                </Link>
            </div>

            <div className='flex items-center'>
                <ul className='hidden md:flex justify-between md:w-[70vw] lg:w-[700px] mr-[15%] links gap-6'>
                    {links.map((link, index) => (
                        <li key={index}>
                            <Link
                                to={link.path}
                                className="cursor-pointer border-b-2 border-transparent hover:border-[#579B52] transition-all duration-300"
                            >
                                {link.name}
                            </Link>
                        </li>
                    ))}
                </ul>

                {/* Mobile menu icon */}
                <img
                    onClick={() => setShowMenu(true)}
                    className='w-6 md:hidden mr-8 cursor-pointer'
                    src="/menu_icon.svg"
                    alt="menu"
                />

                {/* Mobile menu */}
                <div className={`${showMenu ? 'fixed w-full' : 'h-0 w-0'} md:hidden right-0 top-0 bottom-0 z-20 overflow-hidden bg-white transition-all duration-300`}>
                    <img
                        className='w-7 m-4 cursor-pointer'
                        onClick={() => setShowMenu(false)}
                        src="/cross_icon.png"
                        alt="close"
                    />
                    <ul className='flex flex-col items-center gap-4 mt-5 px-5 text-lg font-medium'>
                        {links.map((link, index) => (
                            <li key={index}>
                                <Link
                                    to={link.path}
                                    className="cursor-pointer"
                                    onClick={() => setShowMenu(false)}
                                >
                                    {link.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
