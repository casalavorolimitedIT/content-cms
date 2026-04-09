"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { HugeiconsIcon } from "@hugeicons/react";
import { logout } from "@/app/(auth)/actions/auth-actions";
import {
  MoreVerticalCircle01Icon,
  UserCircle02Icon,
  CreditCardIcon,
  Notification03Icon,
  Logout01Icon,
  HelpCircleIcon,
} from "@hugeicons/core-free-icons";
import { useState } from "react";
import { ActionModal } from "@/app/custom/action-modal";
import Link from "next/link";
import { useUser } from "@/contexts/userContext";

export function NavUser() {
  const { isMobile } = useSidebar();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { setOpenMobile } = useSidebar();
  const { user } = useUser();

  const handleLinkClick = () => {
    setOpenMobile(false);
  };
  const handleLogout = async () => {
    await logout();
    setIsLoggingOut(false);
  };
  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <SidebarMenuButton
                  size="lg"
                  className="aria-expanded:bg-muted"
                />
              }
            >
              <Avatar className="size-8 rounded-lg grayscale">
                <AvatarImage
                  src={user.avatar}
                  alt={user.user.user_metadata.name}
                />
                <AvatarFallback className="rounded-lg">
                  {user.user.user_metadata.name[0]}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {user.user.user_metadata.name}
                </span>
                <span className="truncate text-xs text-foreground/70">
                  {user.user.email}
                </span>
              </div>
              <HugeiconsIcon
                icon={MoreVerticalCircle01Icon}
                strokeWidth={2}
                className="ml-auto size-4"
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="min-w-56"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuGroup>
                <Link
                  href="/dashboard/help"
                  onClick={handleLinkClick}
                  className="w-full"
                >
                  <DropdownMenuItem>
                    <HugeiconsIcon icon={HelpCircleIcon} strokeWidth={2} />
                    Need help?
                  </DropdownMenuItem>
                </Link>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <Link
                  href="/dashboard/account"
                  onClick={handleLinkClick}
                  className="w-full"
                >
                  <DropdownMenuItem>
                    <HugeiconsIcon icon={UserCircle02Icon} strokeWidth={2} />
                    My account
                  </DropdownMenuItem>
                </Link>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setIsLoggingOut(true)}
                disabled={isLoggingOut}
              >
                <HugeiconsIcon icon={Logout01Icon} strokeWidth={2} />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
      <ActionModal
        preset="logout"
        open={isLoggingOut}
        onOpenChange={setIsLoggingOut}
        onConfirm={handleLogout}
      />
    </>
  );
}
