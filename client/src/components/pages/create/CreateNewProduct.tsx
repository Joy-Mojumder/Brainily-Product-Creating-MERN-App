import { ImagePlus, Loader, SquarePen } from "lucide-react";

import {
  Image,
  Input,
  useToast,
  ToastId,
  IconButton,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  FormLabel,
  Button,
  AlertDialogFooter,
  useDisclosure,
  Tooltip,
  FormControl,
  FormErrorMessage,
  AlertDialogBody,
  Text,
} from "@chakra-ui/react";
import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTheme } from "../../theme-provider";

const CreateNewProduct = () => {
  const { theme } = useTheme();

  const toast = useToast();
  interface FormData {
    name: string;
    description: string;
    price: string;
  }

  const [image, setImage] = useState("");

  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    price: "",
  });

  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
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

  // create product

  const queryClient = useQueryClient();

  const {
    mutate: createProduct,
    isPending: isCreatePending,
    isError,
    isSuccess,
    error: createError,
  } = useMutation({
    mutationFn: async (args: { formData: FormData; image: string }) => {
      const { formData, image } = args;
      const response = await fetch("/api/user/product/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...formData, image }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      return data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["searchData"] });

      if (toastRef.current) {
        toast.update(toastRef.current, {
          title: "Your request is being processed",
          description: "Product created successfully",
          status: "success",
          duration: 4000,
          isClosable: true,
        });
      }
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

    createProduct({ formData, image });
  };

  const toastRef = useRef<ToastId>();

  const handleToastUser = () => {
    toastRef.current = toast({
      title: "Please wait...",
      description: "Creating product",
      status: "loading",
      duration: 20000,
      isClosable: true,
    });
  };
  return (
    <>
      <Tooltip label="Create">
        <IconButton
          isRound={true}
          variant="solid"
          aria-label="Done"
          fontSize="20px"
          icon={<SquarePen className="invert" />}
          onClick={onOpen}
          bgColor={theme === "light" ? "#3f3f46" : "white"}
          _hover={{
            bg: `${theme !== "dark" ? "#3f3f46" : "#f7f7f7"}`,
            opacity: "0.8",
          }}
          color={theme === "light" ? "black" : "white"}
        />
      </Tooltip>

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent className="dark:text-white text-black dark:bg-stone-800 bg-stone-200">
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Create New Product
            </AlertDialogHeader>
            <form onSubmit={handleOnSubmit}>
              <AlertDialogBody>
                <FormControl isInvalid={isError} className="space-y-3">
                  <div>
                    <FormLabel htmlFor="name">Product Name</FormLabel>
                    <Input
                      placeholder="Product Name"
                      type="text"
                      name="name"
                      value={formData.name || ""}
                      onChange={handleOnChange}
                    />
                  </div>
                  <div>
                    <FormLabel htmlFor="description">
                      Product Description
                    </FormLabel>
                    <Input
                      placeholder="Product Description"
                      type="text"
                      name="description"
                      value={formData.description || ""}
                      onChange={handleOnChange}
                    />
                  </div>
                  <div>
                    <FormLabel htmlFor="price">Product Price</FormLabel>
                    <Input
                      placeholder="Product Price"
                      type="number"
                      name="price"
                      value={formData.price || ""}
                      onChange={handleOnChange}
                    />
                  </div>
                  {image !== "" && (
                    <Image
                      src={image}
                      alt={formData?.name || ""}
                      boxSize={"30%"}
                      mx="auto"
                    />
                  )}
                  <Button
                    variant="outline"
                    className="w-full flex gap-2 text-black dark:text-white"
                    type="button"
                    onClick={() => imageRef.current?.click()}
                  >
                    <ImagePlus />
                    Select Image
                  </Button>
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    ref={imageRef}
                    className="w-full"
                    onChange={handleImgChange}
                  />
                  {isError && (
                    <FormErrorMessage>
                      {(createError as Error).message}
                    </FormErrorMessage>
                  )}
                  {isSuccess && (
                    <Text color="green.500">Product created successfully</Text>
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
                  disabled={isCreatePending}
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
                  {isCreatePending ? (
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

export default CreateNewProduct;
