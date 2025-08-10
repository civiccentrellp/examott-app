"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signin } from "@/utils/auth";
import { toast } from "sonner";
import { useUser } from "@/context/userContext";

interface SignInFormProps {
  toggle: () => void;
}

export function SignInForm({ toggle }: SignInFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const { refreshUser } = useUser(); 

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await signin({ email, password });
      await refreshUser();       
      toast.success("Successfully signed in!", {
        position: "top-right",
        duration: 3000,
      });
      router.push("/dashboard");
    } catch (err) {
      console.error("Login failed", err);
      setError("Invalid email or password");
    }
  };

  return (
    <div className="w-full max-w-sm">
      <h2 className="text-2xl font-semibold mb-6 text-center">Sign In</h2>
      <form className="flex flex-col space-y-4" onSubmit={handleSignIn}>
        <input
          type="email"
          placeholder="Email"
          className="p-3 rounded bg-white text-black border-1 border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="p-3 rounded bg-white text-black border-1 border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" className="bg-violet-300 text-black py-2 mt-4 rounded hover:bg-gray-600">
          Sign In
        </button>
      </form>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      <p className="mt-4 text-sm text-center">
        Don’t have an account?{" "}
        <span className="underline cursor-pointer" onClick={toggle}>
          Sign Up
        </span>
      </p>
    </div>
  );
}
