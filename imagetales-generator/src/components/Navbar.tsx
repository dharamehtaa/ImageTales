import React from 'react';
import { Moon, Sun, Home, Image as ImageIcon, BookOpen, User, ScanEye } from 'lucide-react';
import { useTheme } from "@/components/theme-provider";
import { Button } from '@/components/ui/button';
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuLink, navigationMenuTriggerStyle } from '@/components/ui/navigation-menu';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const Navbar = () => {
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('token');
  
  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <motion.header 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <motion.div 
            whileHover={{ rotate: 10, scale: 1.1 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <ImageIcon className="h-6 w-6 text-primary" />
          </motion.div>
          <span className="font-bold text-xl bg-gradient-to-r from-primary via-purple-500 to-indigo-400 bg-clip-text text-transparent">ImageTales</span>
        </Link>
        
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link to="/">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <NavigationMenuLink className={navigationMenuTriggerStyle({
                    className: isActive('/') ? 'bg-muted' : ''
                  })}>
                    <Home className="h-4 w-4 mr-2" />
                    Home
                  </NavigationMenuLink>
                </motion.div>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to="/gallery">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <NavigationMenuLink className={navigationMenuTriggerStyle({
                    className: isActive('/gallery') ? 'bg-muted' : ''
                  })}>
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Gallery
                  </NavigationMenuLink>
                </motion.div>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to="/docs">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <NavigationMenuLink className={navigationMenuTriggerStyle({
                    className: isActive('/docs') ? 'bg-muted' : ''
                  })}>
                    <BookOpen className="h-4 w-4 mr-2" />
                    Docs
                  </NavigationMenuLink>
                </motion.div>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to="/ai-detection">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <NavigationMenuLink className={navigationMenuTriggerStyle({
                    className: isActive('/ai-detection') ? 'bg-muted' : ''
                  })}>
                    <ScanEye className="h-4 w-4 mr-2" />
                    AI Detection
                  </NavigationMenuLink>
                </motion.div>
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex items-center gap-3">
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
              className="rounded-full"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </motion.div>
          {isLoggedIn ? (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <div className="flex items-center gap-2">
                <Link to="/profile">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className={`flex items-center gap-2 rounded-full px-4 ${isActive('/profile') ? 'bg-primary/10 border-primary/20' : ''}`}
                  >
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">U</AvatarFallback>
                    </Avatar>
                    <span>Profile</span>
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            </motion.div>
          ) : (
            <Button asChild>
              <Link to="/login">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </motion.header>
  );
};

export default Navbar;