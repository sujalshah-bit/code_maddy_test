import { useState } from "react";

const InfoModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-blue-900 text-white p-6 rounded-lg shadow-xl w-96">
        <h2 className="text-lg font-bold mb-2">Important Notice</h2>
        <p className="text-sm mb-4">
          Free services on Render sleep after 15 minutes of inactivity. If you see a
          &quot;Failed to connect to server&quot; error, please wait and retry connecting.
        </p>
        <button
          onClick={onClose}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
        >
          Got it
        </button>
      </div>
    </div>
  );
};

export default InfoModal