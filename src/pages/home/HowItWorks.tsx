import React from "react";

const HowItWorks: React.FC = (): React.ReactElement => {
  return (
    <div className="w-[90%] mx-auto">
      <div className="m-6 overflow-hidden">
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-8 bg-[#F6F6F6] rounded-[1.125rem]">
          {/* Hero Image Section */}
          <div className="lg:w-1/2 mx-auto lg:ml-10 hero h-[350px] sm:h-[450px] w-[70%] lg:h-auto relative overflow-hidden mb-8">
            <div>
              <img
                loading="lazy"
                className="xl:w-[260px] lg:w-[200px] w-[50%] z-20 absolute bottom-0 lg:left-[60px] left-[10%]"
                src="/hero_1.png"
                alt="Hero illustration 1"
              />
              <img
                loading="lazy"
                className="xl:w-[280px] lg:w-[220px] w-[50%] z-30 absolute bottom-[-40px] lg:left-[200px] left-[40%] scale-x-[-1]"
                src="/hero_2.png"
                alt="Hero illustration 2"
              />
              <img
                loading="lazy"
                className="xl:w-auto lg:w-[80%] w-[100%] absolute bottom-0 lg:left-4 left-0"
                src="/blob.svg"
                alt="Background blob"
              />
            </div>
          </div>

          {/* Text Section */}
          <div className="w-full lg:w-1/2 p-4 md:p-8">
            <h1 className="text-[1.75rem] text-[#579B52] font-semibold">
              Watch How Gauabhayaranyam Works
            </h1>
            <p className="text-[#151515] text-[1.10rem] md:text-[1.25rem] font-medium py-3">
              From doorstep pickup to community impact, see how your scrap
              donation creates change. Our short video takes you through the
              journey.
            </p>
            <ul className="list-disc text-[1.10rem] md:text-[1.25rem] text-[#4F4F4F] font-medium [&_li]:ml-2 md:[&_li]:ml-4 [&_li]:leading-8">
              <li>Schedule scrap pickups in just a few taps</li>
              <li>See how your donation is processed and valued</li>
              <li>Know exactly where your donation goes</li>
              <li>Join a network of eco-conscious donors and volunteers</li>
              <li>Schedule scrap pickups in just a few taps</li>
              <li>Know exactly where your donation goes</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
