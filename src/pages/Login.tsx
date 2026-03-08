import { useGoogleLogin } from "@react-oauth/google";
import { useLogin } from "../hooks/useLogin";
import toast from "react-hot-toast";
import { FcGoogle } from "react-icons/fc";

const Login = () => {
  const { login, isLoading } = useLogin();
  const googleLogin = useGoogleLogin({
    flow: "auth-code",
    onSuccess: (codeResponse) => {
      if (!codeResponse.code) {
        toast.error("No authorization code received");
        return;
      }

      login(codeResponse.code);
    },
    onError: () => {
      toast.error("Google login failed");
    },
  });
  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-red-50 to-white px-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="text-center">
          <img
            src="/logo1.png"
            alt="Mealzoid"
            className="mx-auto h-40 w-auto drop-shadow-md"
          />
          <p className="mt-2 text-sm text-gray-500">
            Order food from the best restaurants near you
          </p>
        </div>

        {/* Login card */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-1 text-center text-lg font-semibold text-gray-900">Welcome!</h2>
          <p className="mb-6 text-center text-sm text-gray-500">Sign in to continue</p>
          <button
            onClick={googleLogin}
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 hover:shadow-md disabled:opacity-60"
          >
            <FcGoogle size={22} />
            {isLoading ? "Signing in..." : "Continue with Google"}
          </button>
        </div>

        <p className="text-center text-xs text-gray-400">
          By signing in, you agree to our{" "}
          <span className="cursor-pointer text-[#E23774] hover:underline">Terms of Service</span>{" "}
          &amp;{" "}
          <span className="cursor-pointer text-[#E23774] hover:underline">Privacy Policy</span>
        </p>
      </div>
    </div>
  );
};

export default Login;
