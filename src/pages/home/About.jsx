import { GiMoneyStack } from "react-icons/gi";
import '../../assets/AB.css';

export default function About() {
    return (
        <div className='w-[85%] p-4 mx-auto'>

            <div className='[&>p]:text-[#4F4F4F] [&_p]:text-[1.10rem] md:[&_p]:text-[1.25rem] py-12'>

                <div className="container">
                    <span className="moving-text p-0 text-2xl text-red-600">
                        <GiMoneyStack className="text-3xl text-green-500" />
                        We are not accepting any hard cash or digital money!!
                    </span>
                </div>

                <h1 className='text-3xl font-semibold'>About Us</h1>
                <p className='my-4'>Gauabhayaranyam is a purpose-driven platform that empowers individuals to turn their unused household items into meaningful contributions.
                    Our goal is simple yet impactful — collect reusable scrap and transform it into support for local charities, schools, and environmental initiatives.</p>

                <p>We're building a movement where every home can become a source of change. Whether you're a donor, a volunteer, or a partner, Gauabhayaranyam gives you the tools
                    to make a real difference — right from your doorstep.</p>
            </div>

            <div className='bg-[#579B52] rounded-[18px] flex flex-col lg:flex-row'>
                <div className='lg:w-[45%] xl:w-1/2'>
                    <div className='p-5 lg:p-8 text-white'>
                        <h1 className='text-[1.70rem] md:text-[2rem] font-semibold'>How Your Donation Helps</h1>
                        <ul className='list-disc text-[1.10rem] md:text-[1.25rem] ml-3 lg:ml-5 py-4 [&>li]:leading-8 font-medium'>
                            <li>Donated items are recycled to support shelters.</li>
                            <li>Scrap proceeds help feed rescued animals.</li>
                            <li>Every donation reduces waste and builds hope.</li>
                            <li>Your contribution gives abandoned animals a second chance.</li>
                        </ul>
                    </div>
                </div>
                <div className='lg:w-[55%] xl:w-1/2 pb-5 lg:p-5'>
                    <div
                        className='grid md:grid-cols-3 grid-cols-1 gap-3 w-full
                               md:[&>img]:w-[180px] md:[&>img]:h-[270px]
                               [&>img]:w-[80%] [&>img]:h-[270px]
                               [&>img]:object-cover [&>img]:rounded-4xl [&>img]:border-5 [&>img]:border-white [&>img]:mx-auto

                    '>
                        <img src="/about_1.png" loading="lazy" alt="" />
                        <img src="/about_2.png" loading="lazy" alt="" />
                        <img src="/about_3.png" loading="lazy" alt="" />
                    </div>
                </div>
            </div>
        </div>
    )
}
