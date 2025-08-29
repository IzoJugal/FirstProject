import { useState, useEffect } from "react";
import "../../assets/AB.css";
import { GiMoneyStack } from "react-icons/gi";

export default function Home() {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [flipped, setFlipped] = useState<boolean>(false);

  // Array of image paths
  const images: string[] = Array.from(
    { length: 20 },
    (_, i) => `/carousel/img${i + 1}.jpg`
  );

  const [currentImage, setCurrentImage] = useState<number>(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="bg-[#F8F7F2] overflow-hidden">
      <div className="container">
        <span className="moving-text p-0 text-2xl text-red-600">
          <GiMoneyStack className="text-3xl text-green-500" />
          We are not accepting any hard cash or digital money!!
        </span>
      </div>

      <div className="w-[90%] sm:[85%] mx-auto flex flex-col lg:flex-row gap-5 md:gap-10 lg:gap-0">
        {/* Left Section */}
        <div className="lg:w-1/2">
          <div className="[&_h2]:text-[#579B52] [&_h2]:font-semibold lg:mt-8">
            <h2 className="text-[2rem] md:text-[2.75rem]">Donate Scrap,</h2>
            <h2 className="text-[2.85rem] md:text-[3.40rem] mt-[-20px]">
              Spread smiles
            </h2>
            <p className="w-[95%] md:w-[80%] text-[1.10rem] md:text-[1.25rem] my-3 font-medium text-[#151515]">
              Donate your old, unused items and help support education, shelter,
              and sustainability.
            </p>

            <button
              onClick={() => setShowModal(true)}
              className="m-4 bg-[#579B52] hover:bg-[#457B40] text-white px-6 py-3 rounded-lg transition font-medium"
            >
              Get Started with Our App
            </button>

            {/* Modal */}
            {showModal && (
              <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center px-4">
                <div className="relative w-full max-w-lg h-[450px] perspective">
                  <button
                    onClick={() => setShowModal(false)}
                    className="absolute top-4 right-4 text-white text-3xl font-bold z-10 bg-black bg-opacity-30 rounded-full w-10 h-10 flex items-center justify-center hover:bg-red-600 hover:text-white transition"
                    aria-label="Close modal"
                  >
                    &times;
                  </button>

                  <div
                    className={`relative w-full h-full transition-transform duration-700 transform-style-3d ${
                      flipped ? "rotate-y-180" : ""
                    }`}
                  >
                    {/* Front: Android */}
                    <div className="absolute w-full h-full backface-hidden bg-white rounded-xl p-8 shadow-lg flex flex-col justify-center items-center text-center space-y-6">
                      <img src="/android-logo.svg" alt="Android" className="w-20" />
                      <h2 className="text-2xl font-semibold text-green-700">
                        Android App
                      </h2>
                      <p className="text-base text-gray-700 max-w-xs">
                        Get started for Scrap Donate on Android.
                      </p>
                      <a
                        href={import.meta.env.VITE_GPLAY as string}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline text-base font-medium hover:text-blue-800 transition"
                      >
                        Play Store
                      </a>
                      <button
                        onClick={() => setFlipped(true)}
                        className="mt-6 text-sm text-gray-600 hover:text-gray-900 hover:scale-105 transition-transform"
                      >
                        Switch to iOS →
                      </button>
                    </div>

                    {/* Back: iOS */}
                    <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-white rounded-xl p-8 shadow-lg flex flex-col justify-center items-center text-center space-y-6">
                      <img src="/ios.jpg" alt="iOS" className="w-20" />
                      <h2 className="text-2xl font-semibold text-gray-900">
                        iOS App
                      </h2>
                      <p className="text-base text-gray-700 max-w-xs">
                        Use the app on iPhone or iPad.
                      </p>
                      <a
                        href={import.meta.env.VITE_IOS as string}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline text-base font-medium hover:text-blue-800 transition"
                      >
                        App Store
                      </a>
                      <button
                        onClick={() => setFlipped(false)}
                        className="mt-6 text-sm text-gray-600 hover:text-gray-900 hover:scale-105 transition-transform"
                      >
                        ← Back to Android
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Section */}
        <div className="w-full p-4">
          <div className="w-full p-2">
            <img
              src={images[currentImage]}
              alt={`Slide ${currentImage + 1}`}
              className="w-full aspect-video object-cover rounded-3xl transition duration-700 ease-in-out"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
