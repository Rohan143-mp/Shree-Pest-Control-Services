import React from "react";
import { useParams } from "react-router-dom";
import servicesData from "../data/servicesData";
import Navbar from "../components/Navbar";

const ServiceDetail = () => {
  const { id } = useParams();
  const service = servicesData.find((item) => item.id === parseInt(id));

  if (!service) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500 text-xl font-semibold">Service not found!</p>
      </div>
    );
  }

  return (
    <>
      {/* Glassy Navbar */}
      <Navbar glossy={true} />

      {/* Service Detail Container */}
      <div className="pt-[100px] md:pt-[120px] min-h-screen bg-gray-100 px-4 md:px-8 lg:px-20 flex justify-center">
  <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col max-w-6xl w-full">
    {/* Service Image */}
    <div className="w-full">
      <img
        src={service.image}
        alt={service.title}
        className="w-full h-[200px] md:h-96 object-cover"
      />
    </div>

    {/* Service Details */}
    <div className="p-4 md:p-6 flex flex-col gap-4">
      <h1 className="text-xl md:text-3xl font-bold text-gray-800">{service.title}</h1>
      <p className="text-sm md:text-base text-gray-600">{service.description}</p>
      <p className="text-red-600 font-semibold text-lg md:text-xl">Price: ₹{service.price}</p>

      <div className="mt-4">
        <h2 className="text-xl md:text-2xl font-semibold text-blue-700 mb-2">
          Treatment Details
        </h2>
        <p className="text-sm md:text-base text-gray-700 whitespace-pre-line">{service.treatment}</p>
      </div>
    </div>
  </div>
</div>

    </>
  );
};

export default ServiceDetail;
