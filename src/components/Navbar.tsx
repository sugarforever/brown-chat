"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="bg-background border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link href="/" className="text-gray-600 hover:text-gray-900">
                首页
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            {session ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium">{session.user?.name}</span>
                <DropdownMenu>
                  <DropdownMenuTrigger className="focus:outline-none">
                    <Avatar>
                      <AvatarImage src={session.user?.image || undefined} alt={session.user?.name || "User"} />
                      <AvatarFallback>{session.user?.name?.[0] || "U"}</AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem className="justify-end" onClick={() => signOut()}>
                      退出登录
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <Button
                variant="ghost"
                onClick={() => signIn("google")}
              >
                登录
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}