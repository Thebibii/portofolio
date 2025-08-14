import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { Icons } from "../icons";
import { NavList } from "@/lib/constant";

export default function Navbar() {
  return (
    <header className="w-full font-mono">
      <div className="@container">
        <nav className="flex items-center justify-between p-6 lg:px-12">
          <div className="group flex items-center space-x-4">
            <Avatar className="size-10">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <h2>Habibie Bayezid Wildan</h2>
          </div>
          <ul className="hidden lg:flex lg:space-x-12">
            {NavList.map((item, _) => (
              <li key={_ + 1} className="capitalize">
                <Link href={item.href}>{item.name}</Link>{" "}
              </li>
            ))}
          </ul>
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="lg:hidden">
              <Button variant="outline" size={"icon"}>
                <Icons.Menu />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-fit font-mono" align="end">
              <DropdownMenuGroup>
                {NavList.map((item, _) => (
                  <DropdownMenuItem
                    key={_ + 1}
                    className="capitalize justify-end"
                  >
                    <Link href={item.href}>{item.name}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </div>
    </header>
  );
}
