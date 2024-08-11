import {
  Alert,
  AlertDescription,
  AlertIcon,
  Avatar,
  Button,
  FormControl,
  FormLabel,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Text,
  ToastId,
  Tooltip,
  useToast,
} from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Brain,
  ChevronsDown,
  Eye,
  EyeOff,
  ImagePlus,
  Loader,
  LockKeyhole,
  MailPlus,
  PencilLine,
} from "lucide-react";
import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../../../theme-provider";

interface SignUpData {
  username: string;
  email: string;
  password: string;
}
const SignUpPage = () => {
  const { theme } = useTheme();
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
        <div className="flex flex-col gap-3 md:w-4/5 xl:w-3/5 w-full h-auto dark:text-white text-black dark:bg-stone-800 bg-white rounded-lg p-5 shadow-lg">
          <Text className="text-xl md:text-2xl font-bold mx-auto">
            SignUp In Brainily
          </Text>
          <FormControl isInvalid={isError} className="space-y-2">
            <div className="flex flex-col gap-6 items-center justify-center">
              <ChevronsDown className="animate-bounce" />

              <IconButton
                isRound={true}
                variant="solid"
                aria-label="Profile Image"
                icon={
                  <Tooltip label="Profile Image">
                    {image !== "" ? (
                      <Avatar
                        size="xl"
                        src={image}
                        className="hover:brightness-75 transition duration-200"
                      />
                    ) : (
                      <Avatar
                        size="xl"
                        icon={<ImagePlus />}
                        className="hover:brightness-75 transition duration-200"
                      />
                    )}
                  </Tooltip>
                }
                onClick={() => imageRef.current?.click()}
              />
              <input
                type="file"
                accept="image/*"
                hidden
                ref={imageRef}
                onChange={handleImgChange}
              />
            </div>

            <div>
              <FormLabel htmlFor="SignUpUsername">Username</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <PencilLine />
                </InputLeftElement>
                <Input
                  type="text"
                  placeholder="Enter name"
                  name="username"
                  id="SignUpUsername"
                  value={userData.username || ""}
                  onChange={handleOnChange}
                />
              </InputGroup>
            </div>
            <div>
              <FormLabel htmlFor="SignUpEmail">Email</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <MailPlus />
                </InputLeftElement>
                <Input
                  type="email"
                  placeholder="Enter email"
                  name="email"
                  id="SignUpEmail"
                  value={userData.email || ""}
                  onChange={handleOnChange}
                />
              </InputGroup>
            </div>
            <div>
              <FormLabel htmlFor="SignUpPassword">Password</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <LockKeyhole />
                </InputLeftElement>
                <Input
                  type={show ? "text" : "password"}
                  placeholder="Enter password"
                  name="password"
                  id="SignUpPassword"
                  value={userData.password || ""}
                  onChange={handleOnChange}
                />
                <InputRightElement
                  onClick={handleClick}
                  className="cursor-pointer"
                >
                  {show ? <EyeOff size={20} /> : <Eye size={20} />}
                </InputRightElement>
              </InputGroup>
            </div>
          </FormControl>
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
              <AlertDescription>SignUp Successful</AlertDescription>
            </Alert>
          )}
          <div className="flex flex-col gap-3">
            <Button
              className="w-full hover:opacity-70 transition duration-200"
              type="submit"
              onClick={handleToastUser}
              variant="solid"
              bgColor={"black"}
              color={"white"}
              _hover={{
                bgColor: "#3f3f46",
                color: theme === "light" ? "black" : "white",
                opacity: "0.8",
              }}
            >
              {isPending ? <Loader className="animate-spin" /> : "Sign Up"}
            </Button>
            <Text className="text-start text-sm font-semibold">
              Already have an account?
            </Text>
            <Link to="/login">
              <Button
                variant={"outline"}
                className="dark:hover:text-black dark:text-white w-full"
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
