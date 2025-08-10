interface AuthCardProps {
  isSignIn: boolean;
  toggle: () => void;
}

export function AuthCard({ isSignIn, toggle }: AuthCardProps) {
  return (
    <div
      className="flex flex-col md:flex-row justify-center items-center h-full text-center px-4 gap-6"
    >
      {/* SVG Illustration */}
      <img
        src="/assets/report-analysis-3-82.svg"
        alt="Auth Illustration"
        className="sm:w-32 md:w-40 lg:w-60 h-20 md:h-40 lg:h-60"
      />

      {/* Text & Button */}
      <div className="flex flex-col items-center md:items-center text-left md:text-center">
        <h2 className="text-lg sm:text-sm md:text-3xl font-bold mb-2 md:mb-4">
          <p>Welcome to ExamOtt </p>
        </h2>
        <p className="mb-4 md:mb-6 text-gray-700 text-xs sm:text-sm md:text-base max-w-xs">
          {isSignIn ? "Don't have account?" : "Already have an account?"}
        </p>
        <button
          className="px-4 py-2 bg-violet-100 text-violet-600 border-1 font-semibold rounded shadow-lg 
                     border-1 border-violet-500 hover:bg-violet-200 transition sm:w-auto"
          onClick={toggle}
        >
          {isSignIn ? "Sign Up" : "Sign In"}
        </button>
      </div>
    </div>
  );
}
