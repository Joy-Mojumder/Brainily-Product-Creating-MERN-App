import {
  InputGroup,
  Input,
  InputRightElement,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverFooter,
  PopoverHeader,
  PopoverTrigger,
  Portal,
  Text,
  Avatar,
  IconButton,
  Tooltip,
} from "@chakra-ui/react";
import { useTheme } from "../theme-provider";
import { Moon, Sun, Brain, Search } from "lucide-react";

import CreateNewProduct from "../pages/create/CreateNewProduct";
import MenuComponent from "./MenuComponent";
import { useQuery } from "@tanstack/react-query";
import { formatUserDate } from "../utils/date";

const Navbar = ({
  handleOnChangeSearch,
}: {
  handleOnChangeSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
  const { theme, setTheme } = useTheme();

  interface AuthUser {
    data: {
      image: string;
      username: string;
      email: string;
      createdAt: string;
    };
  }

  const { data: authUser } = useQuery<AuthUser>({
    queryKey: ["authUser"],
  });

  const { image, username, createdAt, email } = authUser?.data ?? {};

  //^ format date
  const formatterDate = formatUserDate(createdAt as string);

  return (
    <nav className="md:flex md:items-center md:justify-evenly grid grid-cols-2 grid-rows-2 gap-6 md:gap-0 lg:gap-4 bg-zinc-200 dark:bg-stone-900 w-full px-5 py-4 shadow-sm rounded-b-3xl border-b-2 border-b-stone-500">
      <div className="flex items-center gap-1 justify-center">
        <Brain className="size-6 md:size-7" />
        <h1 className="text-2xl md:text-3xl font-bold pointer-events-none select-none">
          Brainily
        </h1>
      </div>
      <div className="order-last md:order-none col-span-2 lg:w-1/4">
        <InputGroup>
          <Input
            placeholder="Search Products"
            onChange={handleOnChangeSearch}
            pl={"0.8rem"}
            _placeholder={{
              opacity: 1,
              color: theme !== "light" ? "white" : "black",
            }}
            variant="flushed"
            borderRadius={"full"}
            border={theme !== "light" ? "2px solid white" : "2px solid black"}
            _focusVisible={{
              borderColor: "none",
            }}
          />
          <InputRightElement>
            <Search />
          </InputRightElement>
        </InputGroup>
      </div>

      {/* menu component */}

      <div className="flex gap-3 md:gap-1 lg:gap-5 items-center justify-center">
        <Popover>
          <PopoverTrigger>
            <IconButton
              isRound={true}
              variant="solid"
              bgColor={theme === "light" ? "#3f3f46" : "white"}
              _hover={{
                bg: `${theme !== "dark" ? "#3f3f46" : "#f7f7f7"}`,
                opacity: "0.8",
              }}
              aria-label="Profile"
              fontSize="20px"
              icon={
                <Tooltip label="Profile">
                  <Avatar src={image || ""} name={username} size="sm" />
                </Tooltip>
              }
            />
          </PopoverTrigger>

          <Portal>
            <PopoverContent
              className="bg-white dark:bg-stone-950 text-black dark:text-white p-2"
              borderColor={"transparent"}
              shadow="lg"
            >
              <PopoverArrow bg={theme === "light" ? "white" : "black"} />
              <PopoverHeader className="flex flex-col gap-2">
                <Avatar
                  src={image || ""}
                  name={username}
                  size={{ base: "lg", lg: "xl" }}
                  className="hover:brightness-75 transition duration-200"
                />
                <Text className="text-lg font-semibold">{username}</Text>
                <Text className="text-sm font-semibold opacity-75 py-2">
                  <span className="text-purple-500">Joined At :</span>
                  {` ${formatterDate}`}
                </Text>
              </PopoverHeader>
              <PopoverCloseButton
                className="dark:text-white text-black"
                size={"md"}
                bg={"transparent"}
              />
              <PopoverBody>
                <Text className="text-sm font-semibold opacity-75 py-2">
                  <span className="text-purple-500">Email :</span>
                  {` ${email}`}
                </Text>
              </PopoverBody>
              <PopoverFooter>
                <Text className="text-xs font-light mt-2 opacity-80">
                  All rights reserved & &copy; copyright by Brainily
                </Text>
              </PopoverFooter>
            </PopoverContent>
          </Portal>
        </Popover>

        {/* theme switcher */}
        <Tooltip label="Theme">
          <IconButton
            isRound={true}
            variant="solid"
            className="active:rotate-90 transition duration-200"
            bgColor={theme === "light" ? "#3f3f46" : "white"}
            _hover={{
              bg: `${theme !== "dark" ? "#3f3f46" : "#f7f7f7"}`,
              opacity: "0.8",
            }}
            color={theme === "light" ? "black" : "white"}
            aria-label="Done"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            fontSize="20px"
            icon={
              theme === "dark" ? (
                <Sun className="invert" />
              ) : (
                <Moon className="invert" />
              )
            }
          />
        </Tooltip>
        {/* create new product */}
        <CreateNewProduct />
        {/* navigation menu for mobile & pc */}
        <MenuComponent />
      </div>
    </nav>
  );
};

export default Navbar;
