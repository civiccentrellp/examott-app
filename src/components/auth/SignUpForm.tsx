"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signup } from "@/utils/auth";

interface SignUpFormProps {
  toggle: () => void;
}

export function SignUpForm({ toggle }: SignUpFormProps) {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await signup({ name, email, password, mobile });
      toggle();
    } catch (err) {
      console.error("Signup failed", err);
      setError("Signup failed. Please try again.");
    }
  };

  return (
    <div className="w-full max-w-sm">
      <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>
      <form className="flex flex-col space-y-4" onSubmit={handleSignUp}>
        <input
          type="text"
          placeholder="Full Name"
          className="p-3 rounded bg-white text-black"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Mobile"
          className="p-3 rounded bg-white text-black"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          className="p-3 rounded bg-white text-black"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="p-3 rounded bg-white text-black"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" className="bg-gray-100 text-black py-2 rounded hover:bg-gray-600">
          Sign Up
        </button>
      </form>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      <p className="mt-4 text-sm text-center">
        Already have an account?{" "}
        <span className="underline cursor-pointer" onClick={toggle}>
          Sign In
        </span>
      </p>
    </div>
  );
}
