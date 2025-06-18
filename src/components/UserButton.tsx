"use client";

import { useSession, signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut } from "lucide-react";

export default function UserButton() {
  const { data: session } = useSession();

  if (!session?.user) return null;

  const initials =
    session.user.name
      ?.split(" ")
      .map((n) => n[0])
      .join("") || "U";

  return (
    <div className="fixed top-5 right-5">
      <DropdownMenu>
        <DropdownMenuTrigger className="cursor-pointer ">
          <Avatar className="w-10 h-10">
            <AvatarImage src={session.user.image || ""} />
            <AvatarFallback className="font-bold hover:bg-gray-800 transition-all duration-75 ease-in-out">
              {initials.toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-40" align="center">
          <div className="flex flex-col justify-center items-center">
            <h3 className="text-center text-sm ">
              Connecter en tant qu&apos;{session.user.name}
            </h3>

            <Button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="mt-2 w-full font-bold cursor-pointer"
            >
              Se déconnecter
              <LogOut />
            </Button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
