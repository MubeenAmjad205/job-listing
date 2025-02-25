import { FaBolt } from "react-icons/fa";

export const Loader: React.FC = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-8 relative overflow-hidden">
    {/* Animated gradient background */}
    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-20 animate-pulse"></div>
    {/* Lightning effects */}
    <div className="absolute top-0 right-0 m-8 text-white opacity-30 animate-ping">
      <FaBolt className="w-12 h-12" />
    </div>
    <div className="absolute bottom-0 left-0 m-8 text-white opacity-30 animate-ping">
      <FaBolt className="w-12 h-12" />
    </div>
    {/* Centered spinner and message */}
    <div className="relative z-10 flex flex-col items-center">
      <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
      <p className="mt-4 text-xlg font-bold text-gray-600 animate-pulse">
        AI is working on your request...
      </p>
    </div>
  </div>
);