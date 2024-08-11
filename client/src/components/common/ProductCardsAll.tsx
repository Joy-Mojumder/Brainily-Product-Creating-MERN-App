import { useQuery } from "@tanstack/react-query";
import CardProduct from "./CardProduct";
import { useEffect } from "react";
// import OnNoProductCreate from "../pages/create/OnNoProductCreate";
import { ChevronsDown } from "lucide-react";

interface ProductType {
  _id: string;
  name: string;
  description: string;
  image: string;
  price: string;
  createdAt: string;
  updatedAt: string;
}

const ProductCardsAll = ({
  sortBy,
  searchVal,
}: {
  sortBy: string;
  searchVal: string;
}) => {
  // getting the products

  const { data: searchData, refetch } = useQuery({
    queryKey: ["searchData"],
    queryFn: async () => {
      try {
        const res = await fetch(
          `/api/user/search?sort=${sortBy}&name=${searchVal}&description=${searchVal}`
        );
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

  useEffect(() => {
    refetch();
  }, [searchVal, sortBy, refetch]);

  const products = searchData?.data || [];

  return (
    <ul className="flex flex-wrap gap-8 items-center justify-center">
      {products.length === 0 && (
        <div className="flex flex-col mt-20 md:mt-16 gap-16 items-center justify-center text-black dark:text-white text-center">
          <div className="flex flex-col items-center justify-center gap-4">
            <p className="text-xs md:text-sm font-medium">
              Create your first product
            </p>
            <ChevronsDown className="animate-bounce" />
            {/* <OnNoProductCreate /> */}
          </div>
          <p className="text-xl md:text-2xl font-semibold ">
            No products found
          </p>
        </div>
      )}
      {products.map((product: ProductType) => (
        <li key={product._id}>
          <CardProduct product={product} />
        </li>
      ))}
    </ul>
  );
};

export default ProductCardsAll;
