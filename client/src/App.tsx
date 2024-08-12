import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/common/Navbar";
import HomePage from "./components/pages/home/HomePage";
import SignUpPage from "./components/pages/auth/signup/SignUpPage";
import LoginPage from "./components/pages/auth/login/LoginPage";
import { Toaster } from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Loader } from "lucide-react";

const App = () => {
  const { data: authUser, isLoading } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.error) return null;
        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }
        return data;
      } catch (error) {
        throw new Error(error as string);
      }
    },
    retry: false,
  });

  //& search logic

  const [searchVal, setSearchVal] = useState("");

  const handleOnChangeSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchVal(e.target.value);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader className="animate-spin size-16" />
      </div>
    );
  }
  return (
    <div className="bg-zinc-100 text-black dark:text-white dark:bg-stone-900 w-full max-h-auto min-h-screen">
      <Routes>
        <Route
          path="/"
          element={
            authUser ? (
              <>
                <Navbar handleOnChangeSearch={handleOnChangeSearch} />
                <HomePage searchVal={searchVal} />
              </>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/login"
          element={!authUser ? <LoginPage /> : <Navigate to="/" />}
        />
        <Route
          path="/signup"
          element={!authUser ? <SignUpPage /> : <Navigate to="/" />}
        />
      </Routes>
      <Toaster position="top-center" reverseOrder={false} />
    </div>
  );
};

export default App;
