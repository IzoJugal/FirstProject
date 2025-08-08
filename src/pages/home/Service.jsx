// import { scroller } from "react-scroll";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { TailSpin } from 'react-loader-spinner';

export default function Service() {
    const navigate = useNavigate();

    const [impact, setImpact] = useState(null);
    const [showContent, setShowContent] = useState(false);

    useEffect(() => {
        const fetchImpact = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_BACK_URL}/auth/impacts`);
                let impactData = {};
                if (Array.isArray(res.data)) {
                    impactData = res.data.reduce((acc, item) => {
                        acc[item.label] = item.count;
                        return acc;
                    }, {});
                } else if (typeof res.data === 'object' && res.data !== null) {
                    impactData = res.data;
                } 
                const counts = impactData.impacts.map(item => item.count);
                setImpact(counts);
               } catch (err) {
                console.error("Failed to fetch impact data", err);
            }
        };

        fetchImpact();

        const timer = setTimeout(() => {
            setShowContent(true);
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    if (!impact || !showContent) {
        return (
            <div className="w-full h-screen flex items-center justify-center">

                <TailSpin
                    height="80"
                    width="80"
                    color="#579B52"
                    ariaLabel="tail-spin-loading"
                    radius="1"
                    visible={true}
                />
            </div>
        );
    }


    const ImpactCard = ({ icon, value, label }) => (
        <div className="h-[220px] w-[280px] bg-[#F6F6F6] rounded-[1.125rem] hover:translate-y-[-10px] transition-all duration-500">
            <div className="h-full w-full grid place-items-center text-center">
                <div>
                    <img src={icon} alt="" className="w-16 h-16 mx-auto" loading="lazy" />
                    <h2 className="mt-2 text-[#112D4E] font-semibold text-[1.55rem]">{value}</h2>
                    <p className="text-[1.30rem] text-[#579B52] mt-[-8px]">{label}</p>
                </div>
            </div>
        </div>
    );

    const gaudaan = () => {
        try {
            navigate("/login")
        } catch (error) {
            toast.error("Donated", error);
        }
    }

    const volunteer = () => {
        try {
            navigate("/volunteer-signup")
            // toast.success("For Volunteer Download App");

        } catch (error) {
            toast.error("Volunteer", error);
        }
    }

    const dealer = () => {
        try {
            navigate("/dealer")
        } catch (error) {
            toast.error("Dealer", error);
        }
    }

    const GreenSorts = () => {
        try {
           navigate("/GreenSorts")
        } catch (error) {
            toast.error("GreenSorts", error);
        }
    }

    return (
        <div className='w-[85%] mx-auto py-14'>

            <div className="px-4 py-10 mx-auto max-w-7xl">
                <h1 className="text-3xl md:text-4xl font-semibold text-center mb-10">Join Our Mission</h1>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">

                    {/* Gaudaan Section */}
                    <div className="bg-[#F8F7F2] rounded-[18px] flex flex-col h-full">
                        <div className="p-6 flex flex-col flex-grow">
                            <h2 className="text-xl md:text-2xl text-[#579B52] font-semibold mb-2">Support Gaudaan</h2>
                            <p className="text-base md:text-lg text-[#4F4F4F] flex-grow">
                                Contribute to the well-being of cows by donating for their care and shelter.
                            </p>
                            <button onClick={gaudaan} className="text-white text-md bg-[#579B52] px-5 py-3 mt-4 rounded-2xl hover:bg-[#40753c] transition-all duration-200">
                                Donate for Gaudaan
                            </button>
                        </div>
                    </div>

                    {/* Volunteer */}
                    <div className="bg-[#F8F7F2] rounded-[18px] flex flex-col h-full">
                        <div className="p-6 flex flex-col flex-grow">
                            <h2 className="text-xl md:text-2xl text-[#579B52] font-semibold mb-2">Become a Volunteer</h2>
                            <p className="text-base md:text-lg text-[#4F4F4F] flex-grow">
                                Help organize pickups and create awareness. Get rewarded and recognized in your city.
                            </p>
                            <button onClick={volunteer} className="text-white text-md bg-[#579B52] px-5 py-3 mt-4 rounded-2xl hover:bg-[#40753c] transition-all duration-200">
                                Sign Up to Volunteer
                            </button>
                        </div>
                    </div>

                    {/* Dealer */}
                    <div className="bg-[#F8F7F2] rounded-[18px] flex flex-col h-full">
                        <div className="p-6 flex flex-col flex-grow">
                            <h2 className="text-xl md:text-2xl text-[#579B52] font-semibold mb-2">Register as Scrap Dealer</h2>
                            <p className="text-base md:text-lg text-[#4F4F4F] flex-grow">
                                Get connected to pickups in your area. Process scrap and support charity.
                            </p>
                            <button onClick={dealer} className="text-white text-md bg-[#579B52] px-5 py-3 mt-4 rounded-2xl hover:bg-[#40753c] transition-all duration-200">
                                Partner as Dealer
                            </button>
                        </div>
                    </div>

                    {/* Recycle Scrap */}
                    <div className="bg-[#F8F7F2] rounded-[18px] flex flex-col h-full">
                        <div className="p-6 flex flex-col flex-grow">
                            <h2 className="text-xl md:text-2xl text-[#579B52] font-semibold mb-2">Join as a Recycler</h2>
                            <p className="text-base md:text-lg text-[#4F4F4F] flex-grow">
                               Process donated scrap into reusable materials. Help reduce waste and build a cleaner, circular future. Get listed as a certified recycler.
                            </p>
                            <button onClick={GreenSorts} className="text-white text-md bg-[#579B52] px-5 py-3 mt-4 rounded-2xl hover:bg-[#40753c] transition-all duration-200">
                              Join GreenSorts
                            </button>
                        </div>
                    </div>

                </div>
            </div>


            <div className="mt-8">
                <h1 className="text-3xl font-semibold mb-5">Our Impact So Far</h1>
                <div className="flex justify-center md:justify-evenly lg:justify-between flex-wrap gap-6 
                    [&_img]:w-16 [&_img]:h-16 [&_img]:mx-auto text-center 
                    [&_h2]:mt-[10px] [&_h2]:text-[#112D4E] [&_h2]:font-semibold [&_h2]:text-[1.55rem]
                    [&_p]:text-[1.30rem] [&_p]:text-[#579B52] [&_p]:mt-[-8px] impact_boxes">

                    <ImpactCard icon="/animal_paw.svg" value={`${impact[0]}+`} label="Animal Helped" />
                    <ImpactCard icon="/recycle.svg" value={`${impact[1]} Kg`} label="Donations Processed" />
                    <ImpactCard icon="/location.svg" value={`${impact[2]}+`} label="Cities Covered" />
                    <ImpactCard icon="/group.svg" value={`${impact[3]}+`} label="Volunteers" />

                </div>
            </div>
        </div>
    )
}
