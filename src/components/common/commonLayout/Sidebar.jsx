"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { socket } from "@/socket/socket";
import { getCookie } from "@/utils/cookies";
import { ChevronDown, ChevronRight, Settings } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AiOutlineMessage } from "react-icons/ai";
import { BiCategory } from "react-icons/bi";
import { CgFileDocument } from "react-icons/cg";
import { FaUsers } from "react-icons/fa";
import { FaQuoteRight } from "react-icons/fa6";
import { GrDiamond, GrTask } from "react-icons/gr";
import { IoIosNotificationsOutline } from "react-icons/io";
import { LuBookOpen, LuCalendarDays, LuFileCheck, LuFileLock2, LuSquareUserRound } from "react-icons/lu";
import { RiAdminLine, RiArticleLine } from "react-icons/ri";
import { RxDashboard } from "react-icons/rx";
import { TbAB2, TbFishHook } from "react-icons/tb";
const sidebars = {
  admin: [
    { name: "Dashboard", path: "/admin/dashboard", icon: RxDashboard },
    {
      name: "BHA Management",
      path: "/admin/bha-management",
      icon: LuSquareUserRound,
    },
    {
      name: "BHAA Management",
      path: "/admin/bhaa-management",
      icon: LuSquareUserRound,
    },

    {
      name: "Client Management",
      path: "/admin/client-management",
      icon: LuSquareUserRound,
    },
    {
      name: "Reassign BHA & BHAA",
      icon: TbAB2,
      subItems: [
        {
          name: "User Requested BHA & BHAA",
          path: "/admin/reassign-bha-bhaa/user-requested",
          icon: TbAB2,
        },
        {
          name: "Admin Assign By BHA & BHAA",
          path: "/admin/reassign-bha-bhaa/admin-assign",
          icon: TbAB2,
        },
      ],
    },
    {
      name: "Admin Management",
      path: "/admin/admin-management",
      icon: RiAdminLine,
    },
    {
      name: "Reports",
      path: "/admin/reports",
      icon: CgFileDocument,
    },

    {
      name: "Community",
      path: "/admin/community",
      icon: FaUsers,
    },
    {
      name: "Learning Management",
      path: "/admin/learning-management",
      icon: LuBookOpen,
    },
    {
      name: "Article Management",
      path: "/admin/article-management",
      icon: RiArticleLine,
    },
    {
      name: "Category Management",
      path: "/admin/category-management",
      icon: BiCategory,
    },
    {
      name: "Target Domain",
      path: "/admin/target-domain",
      icon: TbFishHook,
    },
    {
      name: "Subscriptions",
      path: "/admin/subscription",
      icon: GrDiamond,
    },
    {
      name: "Notifications",
      path: "/admin/notifications",
      icon: IoIosNotificationsOutline,
    },
    {
      name: "Terms and Conditions",
      path: "/admin/terms-and-conditions",
      icon: LuFileCheck,
    },
    {
      name: "Privacy Policy",
      path: "/admin/privacy-policy",
      icon: LuFileLock2,
    },
    {
      name: "Faqs",
      path: "/admin/faqs",
      icon: FaQuoteRight,
    },

    // { name: "Settings", path: "/admin/settings", icon: Settings },
  ],
  bha: [
    { name: "Dashboard", path: "/bha/dashboard", icon: RxDashboard },
    {
      name: "Session Management",
      path: "/bha/clients",
      icon: LuSquareUserRound,
    },
    { name: "Calendar", path: "/bha/calendar", icon: LuCalendarDays },
    { name: "BHA Schedule", path: "/bha/bha-schedule", icon: LuCalendarDays },
    { name: "Tasks and Goals", path: "/bha/tasks-and-goals", icon: GrTask },
    { name: "Reports", path: "/bha/reports", icon: CgFileDocument },
    { name: "Task Messages", path: "/bha/messages", icon: AiOutlineMessage },
    {
      name: "Settings",
      icon: Settings,
      subItems: [
        { name: "Faqs", path: "/bha/faqs", icon: FaQuoteRight },
        {
          name: "Terms and Conditions",
          path: "/bha/terms-and-conditions",
          icon: LuFileCheck,
        },
        {
          name: "Privacy Policy",
          path: "/bha/privacy-policy",
          icon: LuFileLock2,
        },
      ],
    },
  ],
  bhaa: [
    { name: "Dashboard", path: "/bhaa/dashboard", icon: RxDashboard },
    { name: "Clients", path: "/bhaa/client-overview", icon: LuSquareUserRound },
    // { name: "Reports", path: "/bhaa/reports", icon: CgFileDocument }, // this page removed from bhaa app because it is not used
    { name: "Task Monitor", path: "/bhaa/task-monitor", icon: GrTask },
    // {
    //   name: "Reminder Prompts",
    //   path: "/bhaa/task-promts",
    //   icon: LuBotMessageSquare,
    // },
    { name: "Task Messages", path: "/bhaa/messages", icon: AiOutlineMessage },
    {
      name: "Settings",
      path: "/bhaa/settings",
      icon: Settings,
      subItems: [
        { name: "Faqs", path: "/bhaa/faqs", icon: FaQuoteRight },
        {
          name: "Terms and Conditions",
          path: "/bhaa/terms-and-conditions",
          icon: LuFileCheck,
        },
        {
          name: "Privacy Policy",
          path: "/bhaa/privacy-policy",
          icon: LuFileLock2,
        },
      ],
    },
  ],
};
export function AppSidebar() {
  const [showBadge, setShowBadge] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState(new Set());
  const pathname = usePathname();
  const [currentUserId, setCurrentUserId] = useState("");

  // Determine which sidebar to show based on pathname
  const getSidebarRole = () => {
    if (pathname.includes("/admin")) return "admin";
    if (pathname.includes("/bhaa")) return "bhaa";
    if (pathname.includes("/bha")) return "bha";
    return "admin"; // default fallback
  };

  const currentRole = getSidebarRole();
  const currentSidebar = sidebars[currentRole] || [];

  // Read user ID from cookie on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const userId = getCookie("user_id");
      setCurrentUserId(userId || "");
    }
  }, []);

  // Listen for new messages via socket
  useEffect(() => {
    // Guard against SSR and missing userId
    if (typeof window === "undefined" || !currentUserId) return;

    // Connect socket
    socket.connect();

    // Listen for new messages
    const eventName = `new-message::${currentUserId}`;

    const handleNewMessage = (message) => {
      console.log("new message received global 📡", message);
      // Show badge when new message arrives
      setShowBadge(true);
    };

    socket.on(eventName, handleNewMessage);

    // Cleanup
    return () => {
      socket.off(eventName, handleNewMessage);
    };
  }, [currentUserId]);

  // Hide badge when user is on messages page
  useEffect(() => {
    if (pathname.includes("/messages")) {
      setShowBadge(false);
    }
  }, [pathname]);

  // Check if a path is active (exact match or starts with path)
  const isActive = (path) => {
    if (!path) return false;
    // Exact match
    if (pathname === path) return true;
    // For nested routes, check if pathname starts with the menu path
    // But exclude exact parent matches (e.g., /admin/learning-management should not match /admin/learning-management/materials)
    if (pathname.startsWith(path + "/")) return true;
    return false;
  };

  // Check if any subItem is active
  const isSubMenuActive = (subItems) => {
    if (!subItems) return false;
    return subItems.some((subItem) => isActive(subItem.path));
  };

  // Toggle menu expansion
  const toggleMenu = (menuName) => {
    setExpandedMenus((prev) => {
      const next = new Set(prev);
      if (next.has(menuName)) {
        next.delete(menuName);
      } else {
        next.add(menuName);
      }
      return next;
    });
  };

  // Auto-expand menus that have active subItems on mount
  useEffect(() => {
    const newExpanded = new Set();
    currentSidebar.forEach((item) => {
      if (item.subItems && isSubMenuActive(item.subItems)) {
        newExpanded.add(item.name);
      }
    });
    setExpandedMenus(newExpanded);
  }, [currentSidebar, pathname]);

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="flex justify-center items-center my-7 ">
            <Image
              src="/vha/vha.png"
              alt="logo"
              width={200}
              height={200}
              className="w-full h-auto object-contain "
            />
          </SidebarGroupLabel>

          <SidebarGroupContent className="mt-10">
            <SidebarMenu>
              {currentSidebar.map((item) => {
                const hasSubItems = item.subItems && item.subItems.length > 0;
                const itemIsActive = hasSubItems
                  ? isSubMenuActive(item.subItems)
                  : isActive(item.path);
                const isExpanded = expandedMenus.has(item.name);

                return (
                  <SidebarMenuItem key={item.name}>
                    {hasSubItems ? (
                      <>
                        <SidebarMenuButton
                          onClick={() => toggleMenu(item.name)}
                          className={
                            itemIsActive
                              ? "bg-primary/10 text-primary font-medium"
                              : ""
                          }
                        >
                          <item.icon />
                          <span>{item.name}</span>
                          {isExpanded ? (
                            <ChevronDown className="ml-auto size-4" />
                          ) : (
                            <ChevronRight className="ml-auto size-4" />
                          )}
                        </SidebarMenuButton>
                        {isExpanded && (
                          <SidebarMenuSub>
                            {item.subItems.map((subItem) => {
                              const subItemIsActive = isActive(subItem.path);
                              return (
                                <SidebarMenuSubItem key={subItem.name}>
                                  <SidebarMenuButton
                                    asChild
                                    className={
                                      subItemIsActive
                                        ? "bg-primary/10 text-primary font-medium"
                                        : ""
                                    }
                                  >
                                    <Link href={subItem.path}>
                                      <subItem.icon />
                                      <span>{subItem.name}</span>
                                    </Link>
                                  </SidebarMenuButton>
                                </SidebarMenuSubItem>
                              );
                            })}
                          </SidebarMenuSub>
                        )}
                      </>
                    ) : (
                      <SidebarMenuButton
                        asChild
                        className={
                          itemIsActive
                            ? "bg-primary/10 text-primary font-medium"
                            : ""
                        }
                      >
                        <Link href={item.path}>
                          <div className="flex items-center gap-2 relative w-full">
                            <item.icon />
                            <span className="flex-1">{item.name}</span>
                            {showBadge &&
                              item.path &&
                              item.path.includes("messages") && (
                                <span className="absolute right-0 top-1/2 -translate-y-1/2 bg-red-500 text-white rounded-full w-2 h-2 flex items-center justify-center animate-pulse duration-300">
                                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                </span>
                              )}
                          </div>
                        </Link>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarGroupLabel className="mx-auto text-bold text-2xl mb-4">
          {currentRole.toUpperCase()} Dashboard
        </SidebarGroupLabel>
      </SidebarFooter>
    </Sidebar>
  );
}
