import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogCancel,
} from "../../ui/alert-dialog";

import { Button } from "../../ui/button";
import { ImagePlus, SquarePen } from "lucide-react";

import {
  Image,
  VisuallyHidden,
  Input,
  Alert,
  AlertIcon,
  AlertDescription,
  useToast,
  ToastId,
} from "@chakra-ui/react";
import { useRef, useState } from "react";
import { Label } from "../../ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Tooltip from "../../common/Tooltip";

const CreateNewProduct = () => {
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
    <AlertDialog>
      <Tooltip name="Create">
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            className="rounded-full size-9 md:size-10 p-2 flex dim"
          >
            <SquarePen />
          </Button>
        </AlertDialogTrigger>
      </Tooltip>
      <AlertDialogContent className="dark:text-white">
        <form onSubmit={handleOnSubmit} className="space-y-8">
          <AlertDialogHeader className="gap-2">
            <VisuallyHidden>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your
                account and remove your data from our servers.
              </AlertDialogDescription>
            </VisuallyHidden>
            <Label htmlFor="name">Product Name</Label>
            <Input
              isInvalid={isError}
              placeholder="Product Name"
              type="text"
              name="name"
              value={formData.name || ""}
              className="w-full"
              onChange={handleOnChange}
            />
            <Label htmlFor="description">Product Description</Label>
            <Input
              isInvalid={isError}
              placeholder="Product Description"
              type="text"
              name="description"
              value={formData.description || ""}
              className="w-full"
              onChange={handleOnChange}
            />
            <Label htmlFor="price">Product Price</Label>
            <Input
              isInvalid={isError}
              placeholder="Product Price"
              type="number"
              name="price"
              value={formData.price || ""}
              className="w-full"
              onChange={handleOnChange}
            />
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
              className="w-full flex gap-2"
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
              <Alert
                status="error"
                className="text-black font-semibold"
                variant={"left-accent"}
              >
                <AlertIcon />
                <AlertDescription>{createError?.message}</AlertDescription>
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
                  Product created successfully
                </AlertDescription>
              </Alert>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              type="submit"
              disabled={isCreatePending}
              onClick={handleToastUser}
            >
              {isCreatePending ? (
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

export default CreateNewProduct;
