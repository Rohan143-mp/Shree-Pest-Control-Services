import React from "react";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react"; // Location pin icon
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';

const Branches = () => {
  return (
    <div>
    <div
      className="w-full flex flex-col items-center gap-4 py-[100px] px-4"
      style={{
        background: "linear-gradient(180deg, #E0F7FA 0%, #FFFFFF 100%)",
      }}
    >
      {/* Heading */}
      <motion.span
        className="text-black font-arial text-center text-[14px] font-bold leading-normal tracking-[2.66px] capitalize"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        We’re Here
      </motion.span>

      <motion.h2
        className="text-[#2A2A2A] text-center font-arial text-[36px] font-bold leading-normal capitalize"
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        We’d Love to Meet You Here
      </motion.h2>

      {/* Branches */}
      <div className="flex gap-8 md:gap-12 lg:gap-20 mt-10 flex-wrap justify-center">
        {[
          {
            name: "Pali",
            src: "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d603336.0378545296!2d73.218493!3d18.54376!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be8117e3b7f54b7%3A0xaf461deeedf8869d!2sSHREE%20PEST%20CONTROL%20SERVICES!5e1!3m2!1sen!2sus!4v1757790615515!5m2!1sen!2sus",
          },
          {
            name: "Pen",
            src: "https://www.google.com/maps/embed?pb=!1m12!1m8!1m3!1d602318.09032531!2d74.456283!3d18.829815!3m2!1i1024!2i768!4f13.1!2m1!1sShree%20Pest%20Control%20Near%20bharat%20gas%20pen%20Near%20pen%20st%20stand%20Shree%20yash%20plaza%2C%20Pen%2C%20Maharashtra%20402107!5e1!3m2!1sen!2sus!4v1757791180436!5m2!1sen!2sus",
          },
          {
            name: "Panvel",
            src: "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d601766.4745805784!2d73.100142!3d18.983089!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7e9b96b208d31%3A0x22d50aeb04edac6b!2sSirvi%20Park%20%2C%20Sector%202a%2C%20Karanjade!5e1!3m2!1sen!2sus!4v1757791362825!5m2!1sen!2sus",
          },
        ].map((branch, index) => (
          <motion.div
            key={index}
            className="w-[90vw] sm:w-[400px] max-w-[400px] h-[300px] md:h-[400px]"
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: index * 0.2 }}
            whileHover={{ scale: 1.05, rotate: 1 }}
          >
            {/* Animated Pin + Title */}
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <MapPin className="w-5 h-5 md:w-6 md:h-6 text-red-500" />
              </motion.div>
              <h1 className="text-black font-arial text-[20px] md:text-[25px] font-bold capitalize">
                {branch.name}
              </h1>
            </div>

            {/* Map */}
            <iframe
              src={branch.src}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="rounded-lg shadow-xl mt-4"
            ></iframe>
          </motion.div>
        ))}
      </div>
    </div>

        <footer className="bg-gray-900 text-gray-200 py-8 md:py-12 justify-center px-4 md:px-8 lg:px-[200px]">
      <div className="container mx-auto px-4 md:px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">

        {/* Office Addresses */}
        <div>
          <h2 className="text-xl font-bold mb-4 text-white">Office Address</h2>
          <p className="mb-2">📍 Pali Branch: At Pali, Near Ballaleshwar Temple, Opp. Register Office, Pali.</p>
          <p className="mb-2">📍 Pen Branch: Near Bus Stop, Public Bazar, Nagar Parishad Road, Bhushan Electronics, Pen.</p>
          <p className="mb-2">📍 Panvel Branch: Karanjade Sector 2A, Near Sambhav Group, Chandrakant Villa, 1st Floor 102.</p>
        </div>

        {/* Contact Info */}
        <div>
          <h2 className="text-xl font-bold mb-4 text-white">Contact Information</h2>
          <p className="mb-2">📧 shreepestcontrol07@gmail.com</p>
          <p className="mb-2">📞 +91 84828 43422</p>
          <p className="mb-2">📞 +91 93717 78222</p>
        </div>

        {/* Social Media */}
        <div>
          <h2 className="text-xl font-bold mb-4 text-white">Follow Us</h2>
          <div className="flex gap-4 text-2xl">
            <a href="#" className="hover:text-blue-500"><FaFacebook /></a>
            <a href="#" className="hover:text-sky-400"><FaTwitter /></a>
            <a href="#" className="hover:text-pink-500"><FaInstagram /></a>
            <a href="#" className="hover:text-blue-700"><FaLinkedin /></a>
          </div>
        </div>

        {/* Navigation Links */}
        <div>
          <h2 className="text-xl font-bold mb-4 text-white">Quick Links</h2>
          <ul className="space-y-2">
            <li><a href="#home" className="hover:text-teal-400">Home</a></li>
            <li><a href="#about" className="hover:text-teal-400">About Us</a></li>
            <li><a href="#services" className="hover:text-teal-400">Services</a></li>
            <li><a href="#contact" className="hover:text-teal-400">Contact</a></li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="mt-10 border-t border-gray-700 pt-6 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} Shree Pest Control Services. All rights reserved.
      </div>
    </footer>
    </div>
  );
};

export default Branches;

