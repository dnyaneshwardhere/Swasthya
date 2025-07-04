
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Logo from './Logo';
import { Button } from '@/components/ui/button';
import {
  Bell,
  Home,
  FileText,
  Settings,
  User,
  Menu,
  X,
  LogOut,
  AlertTriangle,
  Calendar
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose
} from '@/components/ui/sheet';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const NavBar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', icon: <Home className="h-5 w-5" />, path: '/' },
    { name: 'Medical Reports', icon: <FileText className="h-5 w-5" />, path: '/reports' },
    { name: 'Appointments', icon: <Calendar className="h-5 w-5" />, path: '/appointments' },
    { name: 'Emergency Info', icon: <AlertTriangle className="h-5 w-5" />, path: '/emergency' },
    { name: 'Profile', icon: <User className="h-5 w-5" />, path: '/profile' },
    { name: 'Settings', icon: <Settings className="h-5 w-5" />, path: '/settings' },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  if (!user) {
    return null;
  }

  const userInitials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <nav className="sticky top-0 z-10 flex w-full items-center justify-between border-b bg-background px-4 py-3 shadow-sm md:px-6">
      <div className="flex items-center gap-4">
        <div className="block md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="flex h-full flex-col">
                <div className="flex items-center justify-between border-b p-4">
                  <Logo />
                  <SheetClose asChild>
                    <Button variant="ghost" size="icon">
                      <X className="h-5 w-5" />
                      <span className="sr-only">Close</span>
                    </Button>
                  </SheetClose>
                </div>
                <div className="flex-1 overflow-auto py-2">
                  <div className="flex flex-col space-y-1">
                    {navItems.map((item) => (
                      <SheetClose key={item.name} asChild>
                        <Link
                          to={item.path}
                          className={`flex items-center gap-2 px-4 py-2 ${
                            isActive(item.path)
                              ? 'bg-accent text-accent-foreground'
                              : 'hover:bg-accent hover:text-accent-foreground'
                          }`}
                          onClick={() => setOpen(false)}
                        >
                          {item.icon}
                          {item.name}
                        </Link>
                      </SheetClose>
                    ))}
                  </div>
                </div>
                <div className="border-t p-4">
                  <SheetClose asChild>
                    <Button variant="ghost" className="w-full justify-start" onClick={logout}>
                      <LogOut className="mr-2 h-5 w-5" />
                      Logout
                    </Button>
                  </SheetClose>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
        <Link to="/">
          <Logo />
        </Link>
        <div className="hidden items-center space-x-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive(item.path)
                  ? 'bg-accent text-accent-foreground'
                  : 'text-foreground/70 hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              {item.icon}
              <span className="hidden xl:inline">{item.name}</span>
            </Link>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notifications</span>
        </Button>
        <Link to="/profile">
          <Avatar>
            <AvatarFallback className="bg-primary text-primary-foreground">
              {userInitials}
            </AvatarFallback>
          </Avatar>
        </Link>
      </div>
    </nav>
  );
};

export default NavBar;
