import { scroller } from "react-scroll";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import React, { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import { TailSpin } from "react-loader-spinner";

// ----- Types -----
interface ImpactItem {
  label: string;
  count: number;
}

interface ImpactData {
  counts: number[];
}

interface ApiErrorResponse {
  message: string;
}

interface ImpactCardProps {
  icon: string;
  value: string;
  label: string;
}

const Service: React.FC = () => {
  const navigate = useNavigate();
  const [impact, setImpact] = useState<ImpactData | null>(null);
  const [showContent, setShowContent] = useState<boolean>(false);

  useEffect(() => {
    const fetchImpact = async () => {
      try {
        const res = await axios.get<{
          success: boolean;
          message: string;
          impacts: ImpactItem[];
        }>(`${import.meta.env.VITE_BACK_URL}/auth/impacts`);

        let impactData: ImpactData = { counts: [] };

        if (Array.isArray(res.data.impacts)) {
          // Map the count values from the impacts array
          impactData.counts = res.data.impacts.map((item) => item.count);
        }

        setImpact(impactData);
     
      } catch (err) {
        const error = err as AxiosError<ApiErrorResponse>;
        console.error("Failed to fetch impact data", error);
        toast.error(
          error.response?.data?.message || "Failed to load impact data"
        );
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

  const ImpactCard: React.FC<ImpactCardProps> = ({ icon, value, label }) => (
    <div className="h-[220px] w-[280px] bg-[#F6F6F6] rounded-[1.125rem] hover:translate-y-[-10px] transition-all duration-500">
      <div className="h-full w-full grid place-items-center text-center">
        <div>
          <img
            src={icon}
            alt={label}
            className="w-16 h-16 mx-auto"
            loading="lazy"
          />
          <h2 className="mt-2 text-[#112D4E] font-semibold text-[1.55rem]">
            {value}
          </h2>
          <p className="text-[1.30rem] text-[#579B52] mt-[-8px]">{label}</p>
        </div>
      </div>
    </div>
  );

  const gaudaan = () => {
    navigate("/login");
  };

  const volunteer = () => {
    navigate("/volunteer-signup");
  };

  const dealer = () => {
    navigate("/dealer");
  };

  const GreenSorts = () => {
    navigate("/GreenSorts");
  };

  return (
    <div className="w-[85%] mx-auto py-14">
      <div className="px-4 py-10 mx-auto max-w-7xl">
        <h1 className="text-3xl md:text-4xl font-semibold text-center mb-10">
          Join Our Mission
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
          {/* Gaudaan Section */}
          <div className="bg-[#F8F7F2] rounded-[18px] flex flex-col h-full shadow-md">
            <div className="p-6 flex flex-col flex-grow">
              <h2 className="text-xl md:text-2xl text-[#579B52] font-semibold mb-2">
                Support Gaudaan
              </h2>
              <p className="text-base md:text-lg text-[#4F4F4F] mb-4 flex-grow">
                Make a meaningful impact by donating for the care, feeding, and
                shelter of cows. Every contribution helps ensure their
                well-being and dignity.
              </p>
              <button
                onClick={gaudaan}
                className="text-white text-md font-medium bg-[#579B52] px-5 py-3 rounded-2xl hover:bg-[#40753c] transition-all duration-200"
              >
                Donate to Gaudaan
              </button>
            </div>
          </div>

          {/* Volunteer */}
          <div className="bg-[#F8F7F2] rounded-[18px] flex flex-col h-full shadow-md">
            <div className="p-6 flex flex-col flex-grow">
              <h2 className="text-xl md:text-2xl text-[#579B52] font-semibold mb-2">
                Become a Gau Samarthan
              </h2>
              <p className="text-base md:text-lg text-[#4F4F4F] mb-4 flex-grow">
                Support local cow welfare efforts by organizing pickups and
                spreading awareness. Earn rewards and recognition in your
                community.
              </p>
              <button
                onClick={volunteer}
                className="text-white text-md font-medium bg-[#579B52] px-5 py-3 rounded-2xl hover:bg-[#40753c] transition-all duration-200"
              >
                Join as a Gau Samarthan
              </button>
            </div>
          </div>

          {/* Scrap Dealer */}
          <div className="bg-[#F8F7F2] rounded-[18px] flex flex-col h-full shadow-md">
            <div className="p-6 flex flex-col flex-grow">
              <h2 className="text-xl md:text-2xl text-[#579B52] font-semibold mb-2">
                Register as a Scrap Dealer
              </h2>
              <p className="text-base md:text-lg text-[#4F4F4F] mb-4 flex-grow">
                Join our network to receive local scrap pickup opportunities.
                Help recycle materials responsibly and support social causes
                through your work.
              </p>
              <button
                onClick={dealer}
                className="text-white text-md font-medium bg-[#579B52] px-5 py-3 rounded-2xl hover:bg-[#40753c] transition-all duration-200"
              >
                Partner as a Dealer
              </button>
            </div>
          </div>

          {/* Recycler */}
          <div className="bg-[#F8F7F2] rounded-[18px] flex flex-col h-full shadow-md">
            <div className="p-6 flex flex-col flex-grow">
              <h2 className="text-xl md:text-2xl text-[#579B52] font-semibold mb-2">
                Join as a Recycler
              </h2>
              <p className="text-base md:text-lg text-[#4F4F4F] mb-4 flex-grow">
                Transform donated scrap into reusable materials. Promote
                circular economy practices and contribute to a cleaner, greener
                future. Get recognized as a certified recycler.
              </p>
              <button
                onClick={GreenSorts}
                className="text-white text-md font-medium bg-[#579B52] px-5 py-3 rounded-2xl hover:bg-[#40753c] transition-all duration-200"
              >
                Join GreenSorts
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h1 className="text-3xl font-semibold mb-5">Our Impact So Far</h1>
        <div
          className="flex justify-center md:justify-evenly lg:justify-between flex-wrap gap-6 
          [&_img]:w-16 [&_img]:h-16 [&_img]:mx-auto text-center 
          [&_h2]:mt-[10px] [&_h2]:text-[#112D4E] [&_h2]:font-semibold [&_h2]:text-[1.55rem]
          [&_p]:text-[1.30rem] [&_p]:text-[#579B52] [&_p]:mt-[-8px] impact_boxes"
        >
          <ImpactCard
            icon="/animal_paw.svg"
            value={`${impact.counts[0]}+`}
            label="Animal Helped"
          />
          <ImpactCard
            icon="/recycle.svg"
            value={`${impact.counts[1]} Kg`}
            label="Donations Processed"
          />
          <ImpactCard
            icon="/location.svg"
            value={`${impact.counts[2]}+`}
            label="Cities Covered"
          />
          <ImpactCard
            icon="/group.svg"
            value={`${impact.counts[3]}+`}
            label="Volunteers"
          />
        </div>
      </div>
    </div>
  );
};

export default Service;
