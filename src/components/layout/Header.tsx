import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Droplets } from "lucide-react";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 flex items-center">
          <Droplets className="h-6 w-6 mr-2 text-primary" />
          <h1 className="text-xl font-headline font-bold">PrintStream</h1>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            <Button variant="ghost">Dashboard</Button>
            <Button variant="ghost">Designs</Button>
            <Button variant="ghost">Orders</Button>
            <Avatar>
              <AvatarImage src="https://i.pravatar.cc/150?u=a042581f4e29026704d" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
          </nav>
        </div>
      </div>
    </header>
  );
}
