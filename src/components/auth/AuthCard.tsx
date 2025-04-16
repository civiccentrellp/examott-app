interface AuthCardProps {
    isSignIn: boolean;
    toggle: () => void;
  }
  
  export function AuthCard({ isSignIn, toggle }: AuthCardProps) {
    return (
      <div className="flex flex-col justify-center items-center h-full text-center">
        <h2 className="text-3xl font-bold mb-4">
          {isSignIn ? "Welcome to ExamOTT" : "Welcome Back!"}
        </h2>
        <p className="mb-6">
          {isSignIn ? "Sign up and explore our platform" : "Already have an account?"}
        </p>
        <button
          className="px-6 py-2 bg-gray-800 text-white rounded hover:bg-gray-600 transition"
          onClick={toggle}
        >
          {isSignIn ? "Sign Up" : "Sign In"}
        </button>
      </div>
    );
  }
  