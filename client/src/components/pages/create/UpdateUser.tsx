import {
  Alert,
  AlertDescription,
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
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
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, ImagePlus, Loader, LockKeyhole } from "lucide-react";
import { useRef, useState } from "react";
import { useTheme } from "../../theme-provider";

const UpdateUser = () => {
  const { theme } = useTheme();
  const toast = useToast();
  const [show, setShow] = useState(false);
  const [image, setImage] = useState("");

  const [userData, setUserData] = useState({
    username: "",
    email: "",
    newPassword: "",
    currentPassword: "",
  });

  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);
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
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  interface AuthUser {
    data: {
      image: string;
      username: string;
    };
  }

  interface User {
    username: string;
    email: string;
    image: string;
  }

  const { data: authUser } = useQuery<AuthUser>({
    queryKey: ["authUser"],
  });

  const user = authUser?.data as User;

  interface UserData {
    username: string;
    email: string;
    newPassword: string;
    currentPassword: string;
  }

  //update profile logic

  const queryClient = useQueryClient();
  const {
    mutate: updateProfile,
    isPending: isUpdatePending,
    isError,
    isSuccess,
    error: updateError,
  } = useMutation({
    mutationFn: async (args: { userData: UserData; image: string }) => {
      const { userData, image } = args;
      try {
        const res = await fetch("/api/user/update", {
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
          description: "User updated successfully",
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

    updateProfile({
      userData,
      image,
    });
  };

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
    <>
      <Button
        variant="ghost"
        className="gap-2 w-full text-md "
        color={theme === "dark" ? "white" : "black"}
        bgColor={"transparent"}
        _hover={{
          bgColor: `${theme === "dark" ? "#3f3f46" : "#d9d9d9"}`,
          opacity: "0.8",
        }}
        fontWeight={"bold"}
        borderRadius={"0.5rem"}
        onClick={() => {
          setUserData({
            username: user.username,
            email: user.email,
            newPassword: "",
            currentPassword: "",
          });
          setImage(user.image);
          onOpen();
        }}
      >
        <Avatar
          src={user?.image || ""}
          name={user.username}
          size="sm"
          className="hover:brightness-75 transition duration-200"
        />
        <Text>{user.username}</Text>
      </Button>
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent className="dark:text-white text-black dark:bg-stone-800 bg-stone-200">
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Update Profile
            </AlertDialogHeader>
            <form onSubmit={handleOnSubmit}>
              <AlertDialogBody className="gap-2">
                <FormControl isInvalid={isError} className="space-y-3">
                  <div className="flex items-center justify-center">
                    <IconButton
                      isRound={true}
                      variant="solid"
                      aria-label="Profile Image"
                      icon={
                        <Tooltip label="Profile Image">
                          {user.image !== "" || image !== "" ? (
                            <Avatar
                              size="xl"
                              src={user.image || image}
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
                      onClick={() => {
                        imageRef.current?.click();
                        user.image = "";
                      }}
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
                    <FormLabel htmlFor="UpdateUsername">Username</FormLabel>
                    <Input
                      placeholder="Enter username"
                      type="text"
                      name="username"
                      id="UpdateUsername"
                      value={userData.username || ""}
                      className="w-full"
                      onChange={handleOnChange}
                    />
                  </div>
                  <div>
                    <FormLabel htmlFor="UpdateEmail">Email</FormLabel>
                    <Input
                      placeholder="Enter email"
                      type="text"
                      name="email"
                      id="UpdateEmail"
                      value={userData.email || ""}
                      className="w-full"
                      onChange={handleOnChange}
                    />
                  </div>
                  <div>
                    <FormLabel htmlFor="currentPassword">
                      Current Password
                    </FormLabel>
                    <InputGroup>
                      <InputLeftElement pointerEvents="none">
                        <LockKeyhole />
                      </InputLeftElement>
                      <Input
                        isInvalid={isError}
                        type={show ? "text" : "password"}
                        placeholder="Enter current password"
                        name="currentPassword"
                        id="currentPassword"
                        value={userData.currentPassword || ""}
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
                  <div>
                    <FormLabel htmlFor="newPassword">New Password</FormLabel>
                    <InputGroup>
                      <InputLeftElement pointerEvents="none">
                        <LockKeyhole />
                      </InputLeftElement>
                      <Input
                        isInvalid={isError}
                        type={show ? "text" : "password"}
                        placeholder="Enter new password"
                        name="newPassword"
                        id="newPassword"
                        value={userData.newPassword || ""}
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
                  {isError && (
                    <Alert
                      status="error"
                      className="text-black font-semibold"
                      variant={"left-accent"}
                    >
                      <AlertIcon />
                      <AlertDescription>
                        {updateError?.message}
                      </AlertDescription>
                    </Alert>
                  )}
                  {isSuccess && (
                    <Alert
                      status="success"
                      className="text-black font-semibold"
                      variant={"left-accent"}
                    >
                      <AlertIcon />
                      <AlertDescription>
                        User updated successfully
                      </AlertDescription>
                    </Alert>
                  )}
                </FormControl>
              </AlertDialogBody>

              <AlertDialogFooter className="space-x-4">
                <Button
                  ref={cancelRef}
                  onClick={onClose}
                  variant="outline"
                  className="dark:hover:text-black dark:text-white"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isUpdatePending}
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
                  {isUpdatePending ? (
                    <Loader className="animate-spin" />
                  ) : (
                    "Create"
                  )}
                </Button>
              </AlertDialogFooter>
            </form>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

export default UpdateUser;
