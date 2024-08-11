import {
  Alert,
  AlertDescription,
  AlertIcon,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Text,
  ToastId,
  useToast,
} from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Brain, Eye, EyeOff, LockKeyhole, PencilLine } from "lucide-react";
import { useRef, useState } from "react";
import { Link } from "react-router-dom";

const LoginPage = () => {
  const toast = useToast();
  const [show, setShow] = useState(false);
  const handleClick = () => setShow(!show);
  const [userData, setUserData] = useState({
    email: "",
    password: "",
  });
  const handleOnChangeLogin = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserData({
      ...userData,
      [e.target.name]: e.target.value,
    });
  };
  interface SignUpData {
    email: string;
    password: string;
  }

  //^ refetch window
  const queryClient = useQueryClient();

  //^ create post here
  const {
    mutate: login,
    isPending,
    isError,
    isSuccess,
    error: loginError,
  } = useMutation({
    mutationFn: async (args: { userData: SignUpData }) => {
      const { userData } = args;
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ...userData }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }
        return data;
      } catch (error) {
        throw new Error(error as string);
      }
    },
    onSuccess: () => {
      if (toastRef.current) {
        toast.update(toastRef.current, {
          title: "Your request is being processed",
          description: "Login successful",
          status: "success",
          duration: 4000,
          isClosable: true,
        });
      }
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: (error) => {
      if (toastRef.current) {
        toast.update(toastRef.current, {
          title: "An error occurred",
          description: (error as Error).message,
          status: "error",
          duration: 4000,
          isClosable: true,
        });
      }
    },
  });
  const handleOnSubmitLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    login({ userData });
  };

  //^ toast login
  const toastRef = useRef<ToastId>();

  const handleToastUser = () => {
    toastRef.current = toast({
      title: "Please wait...",
      description: "Updating user",
      status: "loading",
      duration: 20000,
      isClosable: true,
    });
  };

  return (
    <main className="flex flex-col md:flex-row items-center justify-center h-screen w-full gap-10 md:gap-20 lg:gap-48 bg-stone-200 dark:bg-stone-900">
      <section className="md:flex-1 flex items-center justify-end gap-2">
        <Brain className="size-12 lg:size-16 xl:size-20" />
        <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold pointer-events-none select-none">
          Brainily
        </h1>
      </section>
      <form
        className="md:flex-1 flex items-center justify-center md:justify-start"
        onSubmit={handleOnSubmitLogin}
      >
        <div className="flex flex-col gap-4 md:w-4/5 xl:w-3/5 w-full h-auto bg-white dark:bg-black rounded-lg p-5 shadow-lg">
          <Text className="text-xl md:text-2xl font-bold">
            Logged In As Brainily
          </Text>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <PencilLine />
            </InputLeftElement>
            <Input
              type="email"
              placeholder="Enter email"
              name="email"
              value={userData.email}
              onChange={handleOnChangeLogin}
              isInvalid={isError}
            />
          </InputGroup>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <LockKeyhole />
            </InputLeftElement>
            <Input
              type={show ? "text" : "password"}
              placeholder="Enter password"
              name="password"
              value={userData.password}
              onChange={handleOnChangeLogin}
              isInvalid={isError}
            />
            <InputRightElement onClick={handleClick} className="cursor-pointer">
              {show ? <EyeOff size={20} /> : <Eye size={20} />}
            </InputRightElement>
          </InputGroup>
          {isError && (
            <Alert
              status="error"
              className="text-black font-semibold"
              variant={"left-accent"}
            >
              <AlertIcon />
              <AlertDescription>{loginError?.message}</AlertDescription>
            </Alert>
          )}
          {isSuccess && (
            <Alert
              status="success"
              className="text-black font-semibold"
              variant={"left-accent"}
            >
              <AlertIcon />
              <AlertDescription>Product created successfully</AlertDescription>
            </Alert>
          )}
          <div className="flex flex-col gap-3">
            <Button
              className="w-full hover:opacity-70 transition duration-200"
              onClick={handleToastUser}
              type="submit"
            >
              {isPending ? (
                <span className="loading loading-bars loading-md" />
              ) : (
                "Login"
              )}
            </Button>
            <Text className="text-start text-sm font-semibold">
              Don't have an account?
            </Text>
            <Link to="/signup">
              <Button
                variant={"outline"}
                className="w-full hover:bg-stone-300 dark:hover:bg-stone-700 hover:opacity-70 transition duration-200 border-2"
              >
                SignUp
              </Button>
            </Link>
          </div>
        </div>
      </form>
    </main>
  );
};

export default LoginPage;
