import React, { useState } from "react";
import { motion } from "framer-motion";
import { CountryDropdown } from "react-country-region-selector";
import { animationVariants } from "~/utils/animationUtils";

/**
 * Props for DemographicsPopup
 * - onSubmit: called with demographics data when form is submitted
 * - loading: disables form and shows loading state
 * - error: error message to display
 */
interface DemographicsPopupProps {
  onSubmit: (data: { gender: string; country: string; age: string }) => void;
  loading?: boolean;
  error?: string;
}

/**
 * DemographicsPopup
 * Modal card for collecting demographics info after signup.
 * Fields: Gender, Country, Age.
 * Calls onSubmit with the data when "Continue" is pressed.
 */
const DemographicsPopup: React.FC<DemographicsPopupProps> = ({
  onSubmit,
  loading = false,
  error = "",
}) => {
  const [gender, setGender] = useState("");
  const [country, setCountry] = useState("");
  const [age, setAge] = useState("");
  const [localError, setLocalError] = useState("");

  // Validate and submit form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gender || !country || !age) {
      setLocalError("Please fill out all fields.");
      return;
    }
    setLocalError("");
    onSubmit({ gender, country, age });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <motion.div
        className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl"
        {...animationVariants.scaleSpring}
      >
        <h2 className="mb-4 text-center text-2xl font-bold">
          Tell us about yourself
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block font-medium">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full rounded border border-gray-300 p-2"
              required
              disabled={loading}
            >
              <option value="">Select...</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="nonbinary">Non-binary</option>
              <option value="prefer_not_to_say">Prefer not to say</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block font-medium">Country</label>
            <CountryDropdown
              value={country}
              onChange={(val) => setCountry(val)}
              classes="w-full rounded p-2 border border-gray-300"
              disabled={loading}
            />
          </div>
          <div>
            <label className="mb-1 block font-medium">Age</label>
            <input
              type="number"
              min="13"
              max="120"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full rounded border border-gray-300 p-2"
              required
              disabled={loading}
            />
          </div>
          {(localError || error) && (
            <div className="text-center text-sm text-red-600">
              {localError || error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className={`mt-4 w-full rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 font-semibold text-white shadow-lg hover:from-blue-600 hover:to-purple-700 ${
              loading ? "cursor-not-allowed opacity-60" : ""
            }`}
          >
            {loading ? "Saving..." : "Continue"}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default DemographicsPopup;
