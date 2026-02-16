"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";

import { IoIosNotificationsOutline } from "react-icons/io";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronDown } from "lucide-react";
import { deleteCookie, getCookie } from "@/utils/cookies";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { LogOutIcon } from "lucide-react";
import { socket } from "@/socket/socket";
import { useEffect, useState } from "react";
import { useGetMyProfileQuery } from "@/redux/Apis/profileApi/profileApi";
import useToast from "@/hooks/useToast";
export default function Header() {
  const router = useRouter();
  const userRole = getCookie("userRole");
  const [showBadge, setShowBadge] = useState(false);
  const { success } = useToast();
  const { data: myProfile } = useGetMyProfileQuery();
  const [currentUserId, setCurrentUserId] = useState("");
  const [userRoleState, setUserRoleState] = useState("");

  // Read cookies once on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentUserId(getCookie("user_id") || "");
      setUserRoleState(getCookie("userRole") || "");
    }
  }, []);

  useEffect(() => {
    if (!currentUserId && !userRoleState) return;
    if (typeof window === "undefined") return;

    socket.connect();

    const eventName =
      userRoleState === "admin" || userRoleState === "super_admin"
        ? "notification"
        : `notification::${currentUserId}`;

    socket.on(eventName, (notification) => {
      // Show badge when notification arrives
      if (notification) {
        setShowBadge(true);
      }

      // show message
      if (notification?.message) {
        success(notification.message);
      }

      // log correct data
      console.log("notification object:", notification);
    });

    return () => {
      socket.off(eventName);
    };
  }, [currentUserId, userRoleState, success]);

  const handleProfileRedirect = () => {
    if (userRole === "admin" || userRole === "super_admin") {
      router.push("/admin/my-profile");
    } else if (userRole === "doctor") {
      router.push("/bha/my-profile");
    } else if (userRole === "assistant") {
      router.push("/bhaa/my-profile");
    } else {
      router.push("/auth/login");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    deleteCookie("accessToken");
    deleteCookie("refreshToken");
    deleteCookie("userRole");
    deleteCookie("user_id");
    deleteCookie("userData");
    router.push("/auth/login");
  };
  return (
    <div className="w-full mx-auto px-4 bg-sidebar border-b">
      <header className="flex h-20 w-full shrink-0 items-center ">
        <SidebarTrigger />

        <div className="ml-auto flex gap-2">
          {/* <Input type="text" placeholder="Search" className="w-full max-w-sm h-10" /> */}
          <Button
            variant="ghost"
            className="p-0 h-10 border bg-transparent relative"
            onClick={() => {
              // Hide badge when user clicks on notifications
              setShowBadge(false);
              router.push(
                userRole === "admin" || userRole === "super_admin"
                  ? "/admin/notifications"
                  : userRole === "doctor"
                    ? "/bha/notifications"
                    : userRole === "assistant"
                      ? "/bhaa/notifications"
                      : "/auth/login",
              );
            }}
          >
            <IoIosNotificationsOutline size={28} className="text-black" />
            {showBadge && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-3 h-3 flex items-center justify-center">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              </span>
            )}
          </Button>

          {/* Shadcn Dropdown Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="flex h-10 w-[180px] items-center justify-between px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage
                      src={
                        myProfile?.data?.profile ||
                        "https://github.com/shadcn.png"
                      }
                      alt={myProfile?.data?.fullName || "User"}
                    />
                    <AvatarFallback>
                      {myProfile?.data?.fullName?.charAt(0) || "CN"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">Profile</span>
                </div>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[180px]" align="end">
              <DropdownMenuItem onClick={handleProfileRedirect}>
                My Profile
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href={
                    userRole === "admin" || userRole === "super_admin"
                      ? "/admin/change-password"
                      : userRole === "doctor"
                        ? "/bha/change-password"
                        : userRole === "assistant"
                          ? "/bhaa/change-password"
                          : "/auth/login"
                  }
                  className="cursor-pointer"
                >
                  Change Password
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-500 focus:text-red-500">
                <Button
                  className="w-full justify-start bg-red-500 text-white hover:bg-red-600 cursor-pointer"
                  onClick={handleLogout}
                >
                  <LogOutIcon className="w-4 h-4 mr-2" />
                  Log Out
                </Button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
    </div>
  );
}
