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
import {
  Brain,
  Eye,
  EyeOff,
  ImagePlus,
  LockKeyhole,
  MailPlus,
  PencilLine,
} from "lucide-react";
import { useRef, useState } from "react";
import { Link } from "react-router-dom";

interface SignUpData {
  username: string;
  email: string;
  password: string;
}
const SignUpPage = () => {
  const toast = useToast();
  const [show, setShow] = useState(false);
  const [image, setImg] = useState("");
  const [userData, setUserData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const imageRef = useRef<HTMLInputElement>(null);

  const handleClick = () => setShow(!show);

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserData({
      ...userData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImg(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  //^ refetch window
  const queryClient = useQueryClient();

  //^ create post here
  const {
    mutate: signup,
    isPending,
    isError,
    isSuccess,
    error: signupError,
  } = useMutation({
    mutationFn: async (args: { userData: SignUpData; image: string }) => {
      const { userData, image } = args;
      try {
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ...userData, image }),
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
          description: "User created successfully",
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
  const handleOnSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    signup({ userData, image });
  };

  //^ toast logic

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
    <main className="flex flex-col md:flex-row items-center justify-center h-screen w-full gap-10 md:gap-20 lg:gap-40 bg-stone-200 dark:bg-stone-900 p-5 ">
      <section className="md:flex-1 flex items-center justify-end gap-2">
        <Brain className="size-12 lg:size-16 xl:size-20" />
        <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold pointer-events-none select-none">
          Brainily
        </h1>
      </section>
      <form
        className="md:flex-1 flex items-center justify-center md:justify-start"
        onSubmit={handleOnSubmit}
      >
        <div className="flex flex-col gap-4 md:w-4/5 xl:w-3/5 w-full h-auto bg-white dark:bg-black rounded-lg p-5 shadow-lg">
          <div className="flex flex-col gap-2 items-center justify-center">
            <Text className="font-bold text-base lg:text-xl">
              Profile Image
            </Text>
            <Button
              variant="outline"
              className="flex rounded-full size-20 md:size-24 lg:size-28 p-0 hover:bg-stone-400 hover:opacity-70 dark:hover:bg-stone-700 transition duration-200"
              type="button"
              onClick={() => imageRef.current?.click()}
            >
              {image ? (
                <img
                  src={image}
                  className="w-full h-full object-cover rounded-full hover:brightness-75 transition duration-200"
                />
              ) : (
                <span className="flex flex-col gap-1 lg:gap-2 items-center justify-center text-[0.6rem] lg:text-xs xl:text-sm font-semibold">
                  <ImagePlus className="size-4 lg:size-6" />
                  Select Image
                </span>
              )}
            </Button>
            <input
              type="file"
              accept="image/*"
              hidden
              ref={imageRef}
              className="w-full"
              onChange={handleImgChange}
            />
          </div>
          <Text className="text-xl md:text-2xl font-bold">
            SignUp In Brainily
          </Text>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <PencilLine />
            </InputLeftElement>
            <Input
              type="text"
              placeholder="Enter name"
              name="username"
              value={userData.username || ""}
              onChange={handleOnChange}
              isInvalid={isError}
            />
          </InputGroup>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <MailPlus />
            </InputLeftElement>
            <Input
              type="email"
              placeholder="Enter email"
              name="email"
              value={userData.email || ""}
              onChange={handleOnChange}
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
              value={userData.password || ""}
              onChange={handleOnChange}
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
              <AlertDescription>{signupError?.message}</AlertDescription>
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
              type="submit"
              onClick={handleToastUser}
            >
              {isPending ? (
                <span className="loading loading-bars loading-md" />
              ) : (
                "Sign Up"
              )}
            </Button>
            <Text className="text-start text-sm font-semibold">
              Already have an account?
            </Text>
            <Link to="/login">
              <Button
                variant={"outline"}
                className="w-full hover:bg-stone-400 hover:opacity-70 dark:hover:bg-stone-700 border-2 transition duration-200"
              >
                Login
              </Button>
            </Link>
          </div>
        </div>
      </form>
    </main>
  );
};

export default SignUpPage;
