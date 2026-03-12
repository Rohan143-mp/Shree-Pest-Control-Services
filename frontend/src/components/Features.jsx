import React from "react";
import { TbSettingsCheck } from "react-icons/tb";
import { MdSecurity } from "react-icons/md";
import { BiSolidMedal } from "react-icons/bi";
import { motion } from "framer-motion";

const Features = () => {
  // Animation variants for each feature card
  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.3, duration: 0.6, ease: "easeOut" },
    }),
  };

  return (
    <div id="features" className="w-full flex flex-col items-center py-16">
      {/* Section Title */}
      <motion.h2
        initial={{ opacity: 0, y: -30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="text-black text-center font-arial text-[36px] font-bold leading-normal capitalize"
      >
        Best Features
      </motion.h2>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mt-12 max-w-6xl">
        {/* Feature 1 */}
        <motion.div
          custom={0}
          initial="hidden"
          whileInView="visible"
          variants={cardVariants}
          viewport={{ once: true }}
          className="flex flex-col items-center text-center px-6"
        >
          <TbSettingsCheck size={60} className="text-cyan-500 mb-4" />
          <h3 className="text-black font-arial text-[24px] font-bold leading-normal capitalize mb-2">
            Efficient
          </h3>
          <p className="text-black font-arial text-[16px] font-normal leading-[1.5] tracking-[0.5px] max-w-[300px]">
            Our expert pest control service professionals are well-trained and experienced. 
            They understand your pest issue and provide efficient solutions.
          </p>
        </motion.div>

        {/* Feature 2 */}
        <motion.div
          custom={1}
          initial="hidden"
          whileInView="visible"
          variants={cardVariants}
          viewport={{ once: true }}
          className="flex flex-col items-center text-center px-6"
        >
          <MdSecurity size={60} className="text-green-600 mb-4" />
          <h3 className="text-black font-arial text-[24px] font-bold leading-normal capitalize mb-2">
            Secure
          </h3>
          <p className="text-black font-arial text-[16px] font-normal leading-[1.5] tracking-[0.5px] max-w-[300px]">
            We utilize kid safe chemicals & have brilliant notoriety which guarantees the best administration 
            to you for all vermin issues, including cockroach pest control & so forth.
          </p>
        </motion.div>

        {/* Feature 3 */}
        <motion.div
          custom={2}
          initial="hidden"
          whileInView="visible"
          variants={cardVariants}
          viewport={{ once: true }}
          className="flex flex-col items-center text-center px-6"
        >
          <BiSolidMedal size={60} className="text-yellow-500 mb-4" />
          <h3 className="text-black font-arial text-[24px] font-bold leading-normal capitalize mb-2">
            Quality
          </h3>
          <p className="text-black font-arial text-[16px] font-normal leading-[1.5] tracking-[0.5px] max-w-[300px]">
            We are driving and best bug control organization in Mumbai and to truly discover 
            the nature of our administrations, solicit any from our fulfilled customers.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Features;
