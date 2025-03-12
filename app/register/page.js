"use client";

import { useState } from "react";
import { registerUser } from "../utils/api"; // API function for registration
import { useRouter } from "next/navigation";

export default function Signup() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    phone_number: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check for empty fields
    if (Object.values(formData).some((field) => !field.trim())) {
      setError("All fields are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await registerUser(formData);
      router.push("/login"); // Redirect to login page after successful signup
    } catch (err) {
      setError(err || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen  bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center">
      <div className="bg-white mt-8 m-4 mb-8 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-gray-800">Sign Up</h2>
        {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600">Username</label>
            <input
              type="text"
              name="username"
              className="mt-2 p-3 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">Email</label>
            <input
              type="email"
              name="email"
              className="mt-2 p-3 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">First Name</label>
            <input
              type="text"
              name="first_name"
              className="mt-2 p-3 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.first_name}
              onChange={handleChange}
              placeholder="Enter your first name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">Last Name</label>
            <input
              type="text"
              name="last_name"
              className="mt-2 p-3 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.last_name}
              onChange={handleChange}
              placeholder="Enter your last name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">Phone Number</label>
            <input
              type="tel"
              name="phone_number"
              className="mt-2 p-3 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.phone_number}
              onChange={handleChange}
              placeholder="Enter your phone number"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">Password</label>
            <input
              type="password"
              name="password"
              className="mt-2 p-3 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 mt-4 bg-blue-900 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          >
            {loading ? "Signing up..." : "Sign Up"}
          </button>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <a href="/login" className="text-blue-600 hover:underline">
                Log in
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
