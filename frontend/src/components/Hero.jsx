import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import Navbar from './Navbar'

const Hero = () => {
  return (
    <div className="relative w-full min-h-[600px] md:h-[960px] overflow-hidden rounded-b-[30px]">
      {/* Background Layers */}
      <div className="absolute top-0 left-0 w-full h-full bg-[url('src/assets/hero_section.png')] bg-cover bg-center bg-no-repeat blur-[3.7px] -z-10"></div>
      <div className="absolute top-0 left-0 w-full h-full rounded-b-[30px] bg-[linear-gradient(270deg,rgba(0,0,0,0.2)_0.12%,rgba(0,0,0,0.92)_100.45%)] -z-10"></div>

    <div className="px-4 md:px-8 lg:px-[200px]">
      {/* Navbar */}
      <div className="w-full">
        <Navbar />
      </div>

      {/* Hero Section */}
      <div className="mt-8 md:mt-[60px] flex flex-col lg:flex-row justify-between items-start gap-8 lg:gap-0">
        {/* Left Section with animation */}
        <motion.div
          className="w-full lg:max-w-[646px]"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        >
          <p className="text-white font-arial text-[10px] md:text-[12px] not-italic font-normal leading-normal tracking-[5.76px] capitalize">
            Shree Pest Control
          </p>
          <h2 className="w-full lg:w-[646px] text-[#E2E9E9] font-arial text-[28px] md:text-[48px] lg:text-[72px] not-italic font-bold leading-tight mt-2">
            Expert Pest Solutions for Your Peace of Mind
          </h2>
          <p className="w-full lg:w-[449px] text-white font-arial text-[12px] md:text-[14px] not-italic font-normal leading-normal tracking-[0.84px] mt-2">
            We safeguard your property from rodents, insects, and other pests using eco-friendly methods and experienced technicians. Trust Norats to keep your space clean and pest-free.
          </p>

          <Link to="/booking">
          <motion.button
            className="flex w-[165px] h-[46px] px-[17px] py-[13px] pl-[19px] justify-center items-center flex-shrink-0 rounded-[5px] bg-[#03DCE0] cursor-pointer mt-4"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            whileHover={{
              scale: 1.08,
              boxShadow: "0 0 25px #03DCE0",
              transition: { duration: 0.3, ease: "easeOut" }
            }}
            whileTap={{
              scale: 0.95,
              transition: { duration: 0.2, ease: "easeOut" }
            }}
          >
            Schedule Service
          </motion.button>
          </Link>

          {/* Stats Cards */}
          <div className="flex flex-wrap gap-3 md:gap-6 mt-6 md:mt-10">
            <motion.div
              className="w-[140px] md:w-[180px] lg:w-[220px] h-[120px] md:h-[150px] bg-white rounded-2xl shadow-xl flex flex-col items-center justify-center"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <p className="text-xs md:text-sm font-semibold tracking-wide text-gray-500 uppercase">
                Happy Clients
              </p>
              <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mt-2">100+</h2>
            </motion.div>

            <motion.div
              className="w-[140px] md:w-[180px] lg:w-[220px] h-[120px] md:h-[150px] bg-white rounded-2xl shadow-xl flex flex-col items-center justify-center"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <p className="text-xs md:text-sm font-semibold tracking-wide text-gray-500 uppercase">
                Services
              </p>
              <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mt-2">10+</h2>
            </motion.div>

            <motion.div
              className="w-[140px] md:w-[180px] lg:w-[220px] h-[120px] md:h-[150px] bg-white rounded-2xl shadow-xl flex flex-col items-center justify-center"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              <p className="text-xs md:text-sm font-semibold tracking-wide text-gray-500 uppercase">
                Branches
              </p>
              <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mt-2">5+</h2>
            </motion.div>
          </div>
        </motion.div>

        {/* Right Section with animation */}
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
          className="hidden lg:block"
        >
          <img
            src="src/assets/hero2.png"
            className="w-[506px] h-[810px] flex-shrink-0 aspect-[22/27]"
            alt="Hero Illustration"
          />
        </motion.div>
      </div>
    </div>
    </div>
  )
}

export default Hero
