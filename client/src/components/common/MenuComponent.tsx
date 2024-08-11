import {
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  IconButton,
  MenuDivider,
  Text,
} from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { AlignRight, LogOut, X } from "lucide-react";
import { useTheme } from "../theme-provider";
import toast from "react-hot-toast";
import Tooltip from "./Tooltip";
// import UpdateUser from "../pages/create/UpdateUser";
const MenuForMobileTab = () => {
  const { theme } = useTheme();
  const bgDrop = "#1b2021";
  const bgDrop2 = "#f7f7f7";
  const bgHover = "#3f3f46 ";
  const bgHover2 = "#d9d9d9";

  //logout logic

  const queryClient = useQueryClient();

  const { mutate: logout } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch("/api/auth/logout", {
          method: "POST",
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
      toast.success("User logged out successfully");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: () => {
      toast.error("Something went wrong");
    },
  });

  return (
    <Menu>
      {({ isOpen }) => (
        <>
          <Tooltip name="Menu">
            <MenuButton
              as={IconButton}
              isActive={isOpen}
              rounded={"full"}
              icon={isOpen ? <X /> : <AlignRight />}
              color={theme === "dark" ? "white" : "black"}
              bg={"transparent"}
              variant={"ghost"}
              _hover={{
                bg: `${theme !== "dark" ? "#3f3f46" : "#f7f7f7"}`,
                opacity: "0.8",
                color: `${theme !== "dark" ? "white" : "black"}`,
              }}
              _active={{
                bg: `${theme !== "dark" ? "#3f3f46" : "#f7f7f7"}`,
                color: `${theme !== "dark" ? "white" : "black"}`,
              }}
            />
          </Tooltip>
          <MenuList
            shadow="lg"
            className="text-black dark:text-white bg-white dark:bg-stone-900 p-2"
            borderColor={"transparent"}
            borderRadius={"0.5rem"}
          >
            {/* <UpdateUser /> */}

            <MenuDivider
              h={"1px"}
              bgColor={theme === "dark" ? bgDrop2 : bgDrop}
            />

            <MenuItem
              icon={<LogOut />}
              as={"div"}
              cursor={"pointer"}
              bgColor={"transparent"}
              _hover={{
                bgColor: `${theme === "dark" ? bgHover : bgHover2}`,
                opacity: "0.8",
              }}
              borderRadius={"0.5rem"}
              p={"0.8rem"}
              onClick={() => logout()}
              className="font-bold"
            >
              Logout
            </MenuItem>
            <MenuItem as={"div"} bg={"transparent"}>
              <Text className="text-xs font-light mt-2 opacity-80">
                All rights reserved & &copy; copyright by Brainily
              </Text>
            </MenuItem>
          </MenuList>
        </>
      )}
    </Menu>
  );
};

export default MenuForMobileTab;
