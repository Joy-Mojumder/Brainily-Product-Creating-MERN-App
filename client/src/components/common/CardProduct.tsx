import { FilePenLine, ImagePlus, Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  AlertDescription,
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertIcon,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  FormLabel,
  IconButton,
  Image,
  Input,
  Text,
  ToastId,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";

import { useRef, useState } from "react";
import { formatDate } from "../utils/date";

interface ProductType {
  _id: string;
  name: string;
  description: string;
  image: string;
  price: string;
  createdAt: string;
  updatedAt: string;
}
const CardProduct = ({ product }: { product: ProductType }) => {
  const toast = useToast();
  interface FormData {
    name: string;
    description: string;
    price: string;
  }
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);

  const [image, setImage] = useState("");
  const [productId, setProductId] = useState("");

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

  const queryClient = useQueryClient();
  // delete product
  const { mutate: deleteProduct, isPending: isDeletePending } = useMutation({
    mutationFn: async (id: string) => {
      try {
        const res = await fetch(`/api/user/product/${id}`, {
          method: "DELETE",
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }
      } catch (error) {
        throw new Error(error as string);
      }
    },
    onSuccess: () => {
      if (toastRef.current) {
        toast.update(toastRef.current, {
          title: "Your request is being processed",
          description: "Product deleted successfully",
          status: "success",
          duration: 4000,
          isClosable: true,
        });
      }
      queryClient.invalidateQueries({ queryKey: ["searchData"] });
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
  // update product
  const {
    mutate: updateProduct,
    isPending: isUpdatePending,
    isError,
    isSuccess,
    error: updateError,
  } = useMutation({
    mutationFn: async (args: {
      id: string;
      formData: FormData;
      image: string;
    }) => {
      const { id, formData, image } = args;
      try {
        const res = await fetch(`/api/user/product/update/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ...formData, image }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }
      } catch (error) {
        throw new Error(error as string);
      }
    },
    onSuccess: () => {
      if (toastRef.current) {
        toast.update(toastRef.current, {
          title: "Your request is being processed",
          description: "Product updated successfully",
          status: "success",
          duration: 4000,
          isClosable: true,
        });
      }
      queryClient.invalidateQueries({ queryKey: ["searchData"] });
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
    updateProduct({
      id: productId,
      formData,
      image,
    });
  };

  //^ format date here
  const formatCreatedDate = formatDate(product.createdAt);

  const formatUpdatedDate = formatDate(product.updatedAt);

  const toastRef = useRef<ToastId>();

  const handleToastUser = () => {
    toastRef.current = toast({
      title: "Please wait...",
      description: "Updating product",
      status: "loading",
      duration: 20000,
      isClosable: true,
    });
  };
  return (
    <Card className="w-80 hover:scale-105 transition duration-300">
      <CardHeader>
        <div className="flex justify-between">
          <span className="text-2xl font-semibold capitalize">
            {product.name}
          </span>
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium opacity-80 ">
              {`Created at ${formatCreatedDate}`}
            </span>
            <span className="text-xs font-medium opacity-80 ">
              {`Updated at ${formatUpdatedDate}`}
            </span>
          </div>
        </div>
        <Text>{product.description}</Text>
      </CardHeader>
      <CardBody>
        <Image
          src={product.image}
          alt={`${product.name} image`}
          w={"full"}
          h={200}
          objectFit={"cover"}
        />
      </CardBody>
      <CardFooter className="flex flex-col gap-5">
        <div>
          <p className="text-xl font-semibold">{product.price}</p>
        </div>
        <div className="flex items-center gap-10 justify-center">
          {/* alert dialog for editing */}

          <IconButton
            isRound={true}
            variant="solid"
            aria-label="Done"
            fontSize="20px"
            icon={<FilePenLine />}
            onClick={() => {
              setProductId(product._id);
              setFormData({
                name: product.name,
                description: product.description,
                price: product.price,
              });
              setImage(product.image);
              onOpen();
            }}
          />
          <AlertDialog
            isOpen={isOpen}
            leastDestructiveRef={cancelRef}
            onClose={onClose}
          >
            <AlertDialogOverlay>
              <AlertDialogContent className="dark:text-white ">
                <form onSubmit={handleOnSubmit} className="space-y-8">
                  <AlertDialogHeader className="gap-2">
                    <FormLabel htmlFor="name">Product Name</FormLabel>
                    <Input
                      placeholder="Product Name"
                      type="text"
                      name="name"
                      value={formData.name || ""}
                      className="w-full"
                      onChange={handleOnChange}
                    />
                    <FormLabel htmlFor="description">
                      Product Description
                    </FormLabel>
                    <Input
                      placeholder="Product Description"
                      type="text"
                      name="description"
                      value={formData.description || ""}
                      className="w-full"
                      onChange={handleOnChange}
                    />
                    <FormLabel htmlFor="price">Product Price</FormLabel>
                    <Input
                      placeholder="Product Price"
                      type="number"
                      name="price"
                      value={formData.price || ""}
                      className="w-full"
                      onChange={handleOnChange}
                    />
                    {(product.image !== "" || image !== "") && (
                      <Image
                        src={product.image || image}
                        alt={product?.name || ""}
                        boxSize={"30%"}
                        mx={"auto"}
                        my={"5"}
                      />
                    )}
                    <Button
                      variant="solid"
                      className="w-full flex gap-2"
                      onClick={() => {
                        imageRef.current?.click();
                        product.image = "";
                      }}
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
                          Product updated successfully
                        </AlertDescription>
                      </Alert>
                    )}
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <Button ref={cancelRef} onClick={onClose} variant="outline">
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isUpdatePending}
                      onClick={handleToastUser}
                    >
                      {isUpdatePending ? (
                        <span className="loading loading-bars loading-md"></span>
                      ) : (
                        "Update"
                      )}
                    </Button>
                  </AlertDialogFooter>
                </form>
              </AlertDialogContent>
            </AlertDialogOverlay>
          </AlertDialog>
          <IconButton
            variant={"ghost"}
            onClick={() => {
              deleteProduct(product._id);
              handleToastUser();
            }}
            aria-label="Delete"
            className="dim"
            disabled={isDeletePending}
            icon={
              isDeletePending ? (
                <span className="loading loading-bars loading-md"></span>
              ) : (
                <Trash2 />
              )
            }
          />
        </div>
      </CardFooter>
    </Card>
  );
};

export default CardProduct;
