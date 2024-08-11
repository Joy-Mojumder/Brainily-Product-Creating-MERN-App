import { useState } from "react";
import ProductCardsAll from "../../common/ProductCardsAll";
import { Radio, RadioGroup } from "@chakra-ui/react";

const HomePage = ({ searchVal }: { searchVal: string }) => {
  const [value, setValue] = useState("-createdAt");

  console.log(searchVal);

  return (
    <main className="w-full h-full px-5 lg:px-10 py-2 lg:py-5 space-y-5">
      <div className="flex items-center justify-between px-5 lg:px-10">
        <div>
          <h1 className="text-xl lg:text-3xl font-bold">All Products :</h1>
          <p className="text-xs lg:text-sm font-medium opacity-80">
            Welcome to our store
          </p>
        </div>
        <div>
          <p className="text-xs lg:text-md font-medium opacity-80">Sort By :</p>
          <RadioGroup onChange={setValue} value={value}>
            <div className="flex flex-col md:flex-row gap-1 md:gap-3">
              <Radio
                value="-createdAt"
                colorScheme="orange"
                size={{ base: "sm", md: "md" }}
              >
                latest
              </Radio>
              <Radio
                value="name"
                colorScheme="orange"
                size={{ base: "sm", md: "md" }}
              >
                name
              </Radio>
              <Radio
                value="price"
                colorScheme="orange"
                size={{ base: "sm", md: "md" }}
              >
                price
              </Radio>
            </div>
          </RadioGroup>
        </div>
      </div>
      <ProductCardsAll sortBy={value} searchVal={searchVal} />
    </main>
  );
};

export default HomePage;
