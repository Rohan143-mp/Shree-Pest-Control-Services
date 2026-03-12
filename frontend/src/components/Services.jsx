
import React from "react";
import { motion } from "framer-motion";
import PestControlCard from "./card";
import servicesData from "../data/servicesData";

const Services = () => {
  return (
    <div
      id="services"
      className="relative w-full flex flex-col items-center gap-4 py-[100px] px-4"
      style={{
        background: "linear-gradient(180deg, #E0F7FA 0%, #FFFFFF 100%)",
      }}
    >
      <span className="text-black font-arial text-center text-[14px] font-bold leading-normal tracking-[2.66px] capitalize">We Offer</span>
      <motion.h2
        className="text-black text-center font-arial text-[36px] font-bold leading-normal capitalize z-10 max-w-3xl"
      >
        Your safety and satisfaction are our top priority.
      </motion.h2>

      <div className="w-full max-w-[1200px] z-10 mt-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {servicesData.map((service) => (
            <PestControlCard
              key={service.id}
              id={service.id}
              title={service.title}
              description={service.description}
              price={service.price}
              image={service.image}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Services;
