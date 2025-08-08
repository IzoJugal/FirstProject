import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../authContext/Auth";
import { ChevronRight } from "lucide-react";

const UpcomingPickup = () => {
  const navigate = useNavigate();
  const { authorizationToken } = useAuth();

  const [loading, setLoading] = useState(true);
  const [donations, setDonations] = useState([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${import.meta.env.VITE_BACK_URL}/auth/getpickupdonations`, {
          headers: {
            Authorization: authorizationToken
          }
        });
        setDonations(res.data.donations || []);
      } catch (err) {
        console.error("Failed to fetch donations", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDonations();
  }, [authorizationToken]);

  function truncateByChars(str, maxLength = 20) {
    return str.length > maxLength ? str.slice(0, maxLength) + "..." : str;
  }

  function formatDateToCustomString(isoString) {
    const date = new Date(isoString);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${date.getDate()}, ${months[date.getMonth()]} ${date.getFullYear()}`;
  }

  // Calculate pagination
  const totalPages = Math.ceil(donations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentDonations = donations.slice(startIndex, startIndex + itemsPerPage);

  // Pagination handlers
  const goToPreviousPage = () => {
    setCurrentPage((page) => Math.max(page - 1, 1));
    window.scrollTo(0, 0); // scroll to top on page change
  };

  const goToNextPage = () => {
    setCurrentPage((page) => Math.min(page + 1, totalPages));
    window.scrollTo(0, 0);
  };

  return (
    <div className='w-full'>
      <div className='w-[90%] mx-auto sm:w-[75%]'>
        <div className="mt-10 mb-16">
          <h1 className="text-3xl font-semibold">Upcoming Pick-up</h1>

          <div className="mt-5 md:w-[90%] mx-auto flex flex-col gap-4 min-h-[200px]">
            {loading ? (
              <div className="text-center py-10 text-gray-500 animate-pulse">Loading donations...</div>
            ) : donations.length === 0 ? (
              <div className="text-center py-10 text-gray-400">No donations found.</div>
            ) : (
              <>
                {currentDonations.map((e) => (
                  <div
                    key={e._id}
                    className="flex justify-between p-3 w-full border-2 border-[#D9D9D9] rounded-2xl cursor-pointer"
                    onClick={() => {
                      navigate(`/pickup/${e._id}`);
                      window.scrollTo(0, 0);
                    }}
                  >
                    <div className="flex-1 flex items-center">
                      <div className="w-20 h-20 rounded-full overflow-hidden">
                        <img
                          src={`${import.meta.env.VITE_BACK_URL}/auth/profile/image/${e.donor?.profileImage}`}
                          alt="User"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="ml-4">
                        <h1 className="text-xl text-[#112D4E] font-semibold">{e.donor?.firstName}</h1>
                        <h2 className="flex gap-1 text-[#579B52]">
                          <img src="/location_sm2.svg" alt="" />
                          <span className="block sm:hidden">
                            {truncateByChars(`${e.addressLine1} ${e.addressLine2}, ${e.city}`, 15)}
                          </span>
                          <span className="hidden sm:block">
                            {e.addressLine1} {e.addressLine2}, {e.city}
                          </span>
                        </h2>
                        <p className="text-[#4F4F4F] text-sm">
                          {formatDateToCustomString(e.pickupDate)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-[#F6F6F6] grid place-content-center cursor-pointer">
                        <ChevronRight />
                      </div>
                    </div>
                  </div>
                ))}

                {/* Pagination Controls */}
                <div className="flex justify-center gap-4 mt-6">
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                  <span className="flex items-center font-semibold">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UpcomingPickup;
