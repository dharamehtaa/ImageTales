import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User, Settings, ImageIcon, Heart, Clock, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import api from "../api/client";
import { useNavigate } from "react-router-dom";

interface UserData {
  _id: string;
  email: string;
  username: string;
  credits?: number;
  plan?: string;
}

interface ImageData {
  id: string;
  title: string;
  category: string;
  url: string;
  created_at: string;
  likes: number;
  prompt?: string; // Add this line
}

const ProfilePage = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [images, setImages] = useState<ImageData[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userResponse = await api.get("/auth/profile");
        const imagesResponse = await api.get("/gallery/user");
        setUser(userResponse.data);
        setImages(imagesResponse.data);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        navigate("/login"); // Redirect to login if not authenticated
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col items-center text-center mb-12">
        <Badge variant="secondary" className="mb-4">
          <User className="h-3.5 w-3.5 mr-1" />
          Profile
        </Badge>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
          Your Account
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mb-8">
          Manage your account settings and view your creations
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="col-span-1"
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Your personal information</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center pt-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarFallback>{user?.username?.[0] || "U"}</AvatarFallback>
                </Avatar>
              </motion.div>
              <h3 className="text-xl font-medium mb-1">{user?.username}</h3>
              <p className="text-muted-foreground mb-4">{user?.email}</p>
              <div className="flex gap-2 mb-2">
                <Badge variant="outline">{user?.plan || "Free"} Plan</Badge>
                <Badge variant="secondary">{user?.credits || 0} Credits</Badge>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button
                variant="outline"
                className="w-full flex justify-between items-center"
              >
                <Settings className="h-4 w-4" />
                <span className="flex-grow text-center">Account Settings</span>
              </Button>
              <Button
                variant="ghost"
                className="w-full flex justify-between items-center text-muted-foreground"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                <span className="flex-grow text-center">Sign Out</span>
              </Button>
            </CardFooter>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="col-span-1 lg:col-span-2"
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Your Activity</CardTitle>
              <CardDescription>
                Recent generations and saved images
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <motion.div
                  whileHover={{ y: -5 }}
                  className="flex flex-col gap-1"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <ImageIcon className="h-4 w-4 text-primary" />
                    <h4 className="font-medium">Total Creations</h4>
                  </div>
                  <p className="text-3xl font-bold">{images.length}</p>
                  <p className="text-sm text-muted-foreground">
                    Images in your gallery
                  </p>
                </motion.div>
              </div>

              <h3 className="text-lg font-medium mb-3 mt-6">Recent Activity</h3>
              <div className="space-y-3">
                {images.slice(0, 3).map((image) => {
                  console.log("created_at:", image.created_at); // ✅ move here

                  return (
                    <motion.div
                      key={image.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 + images.indexOf(image) * 0.1 }}
                      whileHover={{ x: 5 }}
                      className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                    >
                      <div className="w-12 h-12 rounded overflow-hidden">
                        <img
                          // src={image.url}
                          src={`http://localhost:5000${image.url}`}
                          alt={image.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.error("Failed to load image:", image.url);
                            (e.target as HTMLImageElement).style.display =
                              "none";
                          }}
                        />
                      </div>
                      <div className="flex-grow">
                        <h4 className="font-medium">{image.title}</h4>

                        {image.prompt && (
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {image.prompt}
                          </p>
                        )}

                        <div className="flex items-center gap-2 mt-1">
                          {/* <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {new Date(image.created_at).toLocaleString()}
                          </span> */}
                          <Badge variant="outline" className="text-xs">
                            {image.category}
                          </Badge>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate("/gallery")}
              >
                View All Activity
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;
