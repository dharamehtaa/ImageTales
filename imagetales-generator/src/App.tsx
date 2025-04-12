import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { AnimatePresence } from "framer-motion";
import Index from "./pages/Index";
import Gallery from "./pages/Gallery";
import Docs from "./pages/Docs";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AIDetection from "./pages/AIDetection";
import Navbar from "./components/Navbar";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const AppRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Index />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/docs" element={<Docs />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/ai-detection" element={<AIDetection />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark" storageKey="imagetales-theme">
      <TooltipProvider>
        <Sonner />
        <BrowserRouter>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">
              <AppRoutes />
            </main>
            <footer className="py-6 border-t">
              <div className="container flex flex-col items-center justify-center gap-4 md:flex-row md:justify-between">
                <p className="text-center text-sm text-muted-foreground md:text-left">
                  © {new Date().getFullYear()} ImageTales. All rights reserved.
                </p>
                <div className="flex items-center gap-4 text-muted-foreground">
                  <a href="#" className="text-sm hover:underline hover:text-primary transition-colors duration-200">Privacy Policy</a>
                  <a href="#" className="text-sm hover:underline hover:text-primary transition-colors duration-200">Terms of Service</a>
                  <a href="#" className="text-sm hover:underline hover:text-primary transition-colors duration-200">Contact</a>
                </div>
              </div>
            </footer>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;