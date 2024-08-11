import {
  Alert,
  AlertDescription,
  AlertIcon,
  Avatar,
  Image,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Text,
  ToastId,
  useToast,
  VisuallyHidden,
} from "@chakra-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, ImagePlus, LockKeyhole } from "lucide-react";
import { useRef, useState } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../ui/alert-dialog";
import { Button } from "../../ui/button";
import { Label } from "../../ui/label";

const UpdateUser = () => {
  const toast = useToast();
  const [show, setShow] = useState(false);
  const [image, setImage] = useState("");

  const [userData, setUserData] = useState({
    username: "",
    email: "",
    newPassword: "",
    currentPassword: "",
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
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          className="gap-2 w-full text-md"
          onClick={() => {
            setUserData({
              username: user.username,
              email: user.email,
              newPassword: "",
              currentPassword: "",
            });
            setImage(user.image);
          }}
        >
          <Avatar
            src={user.image}
            name={user.username}
            size="sm"
            className="hover:brightness-75 transition duration-200"
          />
          <Text>{user.username}</Text>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="dark:text-white">
        <form onSubmit={handleOnSubmit} className="space-y-4">
          <AlertDialogHeader className="gap-2">
            <VisuallyHidden>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your
                account and remove your data from our servers.
              </AlertDialogDescription>
            </VisuallyHidden>

            <div className="flex flex-col gap-2 items-center justify-center">
              <Text className="font-bold text-base lg:text-xl">
                Profile Image
              </Text>
              <Button
                variant="outline"
                className="flex rounded-full size-20 md:size-24 lg:size-28 p-0"
                type="button"
                onClick={() => {
                  imageRef.current?.click();
                  user.image = "";
                }}
              >
                {(user.image !== "" || image !== "") && (
                  <Image
                    src={user.image || image}
                    alt={user?.username || ""}
                    className="w-full h-full object-cover rounded-full hover:brightness-75 transition duration-200"
                  />
                )}
                {user.image === "" && image === "" && (
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
            <Label htmlFor="username">Username</Label>
            <Input
              placeholder="Enter username"
              type="text"
              name="username"
              value={userData.username || ""}
              className="w-full"
              onChange={handleOnChange}
            />
            <Label htmlFor="email">Email</Label>
            <Input
              placeholder="Enter email"
              type="text"
              name="email"
              value={userData.email || ""}
              className="w-full"
              onChange={handleOnChange}
            />
            <Label htmlFor="currentPassword">Current Password</Label>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <LockKeyhole />
              </InputLeftElement>
              <Input
                isInvalid={isError}
                type={show ? "text" : "password"}
                placeholder="Enter current password"
                name="currentPassword"
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
            <Label htmlFor="newPassword">New Password</Label>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <LockKeyhole />
              </InputLeftElement>
              <Input
                isInvalid={isError}
                type={show ? "text" : "password"}
                placeholder="Enter new password"
                name="newPassword"
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
            {isError && (
              <Alert
                status="error"
                className="text-black font-semibold"
                variant={"left-accent"}
              >
                <AlertIcon />
                <AlertDescription>{updateError?.message}</AlertDescription>
              </Alert>
            )}
            {isSuccess && (
              <Alert
                status="success"
                className="text-black font-semibold"
                variant={"left-accent"}
              >
                <AlertIcon />
                <AlertDescription>User updated successfully</AlertDescription>
              </Alert>
            )}
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              type="submit"
              disabled={isUpdatePending}
              onClick={handleToastUser}
            >
              {isUpdatePending ? (
                <span className="loading loading-bars loading-md"></span>
              ) : (
                "Create"
              )}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default UpdateUser;
