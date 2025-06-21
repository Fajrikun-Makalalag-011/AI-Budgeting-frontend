import React from "react";
import { Link } from "react-router-dom";

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 p-4">
      <div className="w-full max-w-5xl bg-white/60 backdrop-blur-md rounded-2xl shadow-2xl p-8 md:p-12">
        <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
          {/* Left Side: Text and CTA */}
          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4 text-gray-800">
              Mulai Kelola Keuanganmu
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Gunakan kekuatan AI untuk membuat rencana anggaran yang cerdas,
              lacak pengeluaran, dan capai tujuan finansialmu.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link
                to="/register"
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold text-lg shadow-lg hover:bg-blue-700 transition transform hover:scale-105"
              >
                Get Started
              </Link>
              <Link
                to="/login"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-bold text-lg shadow-lg hover:bg-gray-100 transition border border-blue-200"
              >
                Login
              </Link>
            </div>
          </div>

          {/* Right Side: Static Inspirational Text */}
          <div className="hidden md:block p-6 bg-gray-800 rounded-xl shadow-lg">
            <blockquote className="text-lg text-gray-300 italic border-l-4 border-green-400 pl-4">
              "Mengatur uang adalah kunci menuju kebebasan. Setiap rupiah yang
              tercatat adalah langkah mendekati tujuan finansial Anda."
            </blockquote>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
