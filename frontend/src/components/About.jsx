

import React from "react";
import { motion } from "framer-motion";

const About = () => {
  return (
    <div id="about" className="w-full h-max px-4 md:px-8 lg:px-[200px] flex flex-col lg:flex-row gap-8 lg:gap-[150px] py-[50px] md:my-[100px] mt-[50px] md:mt-[100px]">

      {/* Gradient Card */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        whileInView={{ x: 0, opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative w-full lg:w-[550px] h-[300px] md:h-[400px] lg:h-[473px] flex-shrink-0 rounded-[20px] md:rounded-[41.818px] 
                   bg-gradient-to-b from-[#03DCE0] to-[#02787A] 
                   shadow-[inset_0_4px_4px_rgba(0,0,0,0.25),0_4px_4px_rgba(0,0,0,0.25)] overflow-hidden"
      >
        {/* Person Image - popping out */}
        <motion.img 
          src="src/assets/about_section.png" 
          className="absolute -top-10 -right-10 md:-right-10 w-[400px] h-[350px] md:w-[500px] md:h-[400px] lg:w-[686px] lg:h-[527px] object-contain"
          alt="About Section Person"
          initial={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.7 }}
        />
      </motion.div>

      <motion.div
        initial={{ y: 50, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, delay: 0.3 }}
        className="flex flex-col items-start gap-2 lg:gap-2 max-w-[680px] w-full"
      >
        {/* Small Section Title */}
        <span className="text-black font-arial text-[12px] md:text-[14px] font-bold normal-case tracking-[2.66px] leading-normal">
          About Us
        </span>

        {/* Main Heading */}
        <h1
          className="w-full lg:w-[479px] text-transparent bg-clip-text font-arial text-2xl md:text-3xl lg:text-4xl font-bold leading-tight capitalize"
          style={{
            background: "linear-gradient(90deg, #67D4D9 1.44%, rgba(55, 112, 115, 0.8) 33.65%, rgba(62, 128, 131, 0.83) 82.21%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}
        >
          Your Trusted Pest Control Partner
        </h1>

        {/* Paragraph */}
        <p className="text-black font-arial text-sm md:text-base lg:text-[20px] leading-relaxed text-justify">
          Shree Pest Control Service is a licensed and professional pest control company specializing in residential and commercial pest solutions.  
          <br /><br />
          We are a highly experienced and well-established company offering our services in Panvel, Pen, Navi Mumbai, Pali, Alibag, and surrounding areas. Our comprehensive pest management services cover commonly found pests such as cockroaches, ants, lizards, spiders, silverfish, and more.  
          <br /><br />
          Our team has unmatched expertise and experience, ensuring effective solutions with a professional approach tailored to your needs.
        </p>
      </motion.div>

    </div>
  );
};

export default About;
