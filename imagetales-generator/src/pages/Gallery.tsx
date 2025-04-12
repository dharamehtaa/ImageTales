import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Image as ImageIcon, Heart, Download, Share, Sparkles, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import api from '../api/client';

interface ImageData {
  id: string;
  title: string;
  category: string;
  url: string;
  likes: number;
  prompt?: string;
  created_at: string;
  is_generated: boolean;
  views: number;
  liked?: boolean;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.3,
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 }
  }
};

const Gallery = () => {
  const [images, setImages] = useState<ImageData[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await api.get('/gallery/all');
        setImages(response.data.map((img: any) => ({
          ...img,
          liked: img.liked_by?.includes(localStorage.getItem('userId'))
        })));
      } catch (error) {
        console.error('Failed to fetch gallery:', error);
        toast({
          title: "Error",
          description: "Failed to load gallery images",
        });
      }
    };
    fetchImages();
  }, []);

  const handleLikeImage = async (id: string) => {
    try {
      const response = await api.post(`/gallery/like/${id}`);
      setImages(prev =>
        prev.map(img =>
          img.id === id ? { 
            ...img, 
            likes: response.data.likes,
            liked: response.data.liked 
          } : img
        )
      );
      toast({
        title: response.data.liked ? "Image liked!" : "Like removed",
        description: response.data.liked 
          ? "Added to your favorites" 
          : "Removed from favorites",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to toggle like",
      });
    }
  };

  const handleDownload = async (url: string, title: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${title.replace(/\s+/g, '-')}-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({
        title: "Download started",
        description: "Your image is being downloaded",
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Could not download the image",
      });
    }
  };

  const filteredImages = (category: string) => {
    let filtered = images;
    if (category !== 'all') {
      filtered = filtered.filter(img => img.category === category);
    }
    return filtered.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  };

  // const getTimeAgo = (dateString: string) => {
  //   const date = new Date(dateString);
  //   const now = new Date();
  //   const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
  //   if (diffInSeconds < 60) return 'just now';
  //   if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  //   if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  //   return `${Math.floor(diffInSeconds / 86400)}d ago`;
  // };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background/90"
    >
      <div className="container mx-auto px-4 py-12">
        <motion.div 
          variants={itemVariants}
          className="flex flex-col items-center text-center mb-12"
        >
          <Badge variant="outline" className="mb-4 p-1 px-3 border-primary/30 bg-primary/5">
            <ImageIcon className="h-3.5 w-3.5 mr-2 text-primary" />
            Community Gallery
          </Badge>
          <motion.h1 
            className="text-4xl md:text-5xl font-bold tracking-tight mb-4 bg-gradient-to-r from-primary via-purple-500 to-indigo-400 bg-clip-text text-transparent"
            animate={{ 
              backgroundPosition: ["0% center", "100% center", "0% center"], 
            }}
            transition={{ 
              duration: 8, 
              repeat: Infinity, 
              repeatType: "mirror" 
            }}
          >
            Creative Collection
          </motion.h1>
          <motion.p 
            variants={itemVariants}
            className="text-xl text-muted-foreground max-w-2xl mb-8"
          >
            Browse through our collection of AI-generated images created by our community.
          </motion.p>
        </motion.div>

        <Tabs 
          defaultValue="all" 
          className="w-full max-w-6xl mx-auto"
          onValueChange={setActiveTab}
        >
          <motion.div variants={itemVariants}>
            <TabsList className="grid grid-cols-5 mb-8 w-full md:w-auto rounded-full p-1 bg-muted/50">
              <TabsTrigger value="all" className="rounded-full">All</TabsTrigger>
              <TabsTrigger value="nature" className="rounded-full">Nature</TabsTrigger>
              <TabsTrigger value="urban" className="rounded-full">Urban</TabsTrigger>
              <TabsTrigger value="art" className="rounded-full">Art</TabsTrigger>
              <TabsTrigger value="ai" className="rounded-full flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5" /> AI
              </TabsTrigger>
            </TabsList>
          </motion.div>

          {['all', 'nature', 'urban', 'art', 'ai'].map(category => (
            <TabsContent key={category} value={category} className="mt-6">
              {filteredImages(category).length === 0 ? (
                <motion.div
                  variants={itemVariants}
                  className="flex flex-col items-center justify-center py-12 text-center"
                >
                  <div className="bg-primary/5 rounded-full p-6 mb-4">
                    {category === 'ai' ? (
                      <Sparkles className="h-10 w-10 text-primary" />
                    ) : (
                      <ImageIcon className="h-10 w-10 text-primary" />
                    )}
                  </div>
                  <h3 className="text-xl font-medium mb-2">
                    No {category === 'all' ? '' : category} images yet
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {category === 'ai' 
                      ? "Be the first to generate an AI image!" 
                      : "Be the first to upload an image in this category!"}
                  </p>
                  <Button 
                    onClick={() => navigate(category === 'ai' ? '/' : '/upload')}
                    className="gap-2"
                  >
                    {category === 'ai' ? (
                      <>
                        <Sparkles className="h-4 w-4" /> Generate AI Image
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" /> Upload Image
                      </>
                    )}
                  </Button>
                </motion.div>
              ) : (
                <motion.div 
                  variants={containerVariants}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {filteredImages(category).map((image) => (
                    <motion.div 
                      key={image.id}
                      variants={itemVariants}
                      whileHover={{ y: -10 }}
                      transition={{ type: "spring", stiffness: 300, damping: 24 }}
                    >
                      <Card className="overflow-hidden transition-all hover:shadow-lg border-none rounded-xl group">
                        <CardHeader className="p-0 relative">
                          <div className="aspect-video w-full overflow-hidden relative">
                            <motion.img 
                              src={image.url.startsWith('http') ? image.url : `http://localhost:5000${image.url}`}
                              alt={image.title} 
                              className="w-full h-full object-cover transition-transform group-hover:scale-105" 
                              whileHover={{ scale: 1.05 }}
                              transition={{ duration: 0.3 }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                              {image.prompt && (
                                <p className="text-white text-sm line-clamp-2">
                                  {image.prompt}
                                </p>
                              )}
                            </div>
                            <div className="absolute top-2 left-2 flex gap-2">
                              {image.is_generated && (
                                <Badge className="flex items-center gap-1 bg-primary/90 hover:bg-primary">
                                  <Sparkles className="h-3 w-3" /> AI
                                </Badge>
                              )}
                              <Badge variant="secondary">
                                {image.views} views
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="p-5">
                          <CardTitle className="text-lg mb-2 line-clamp-1">
                            {image.title}
                          </CardTitle>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/10">
                              {image.category}
                            </Badge>
                            {/* <span className="text-sm text-muted-foreground">
                              {getTimeAgo(image.created_at)}
                            </span> */}
                          </div>
                        </CardContent>
                        <CardFooter className="p-5 pt-0 flex justify-between">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleLikeImage(image.id)}
                            className={image.liked ? "text-red-500" : ""}
                          >
                            <Heart className={`h-4 w-4 mr-2 ${image.liked ? "fill-current" : ""}`} />
                            {image.likes}
                          </Button>
                          <div className="flex gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => handleDownload(
                                image.url.startsWith('http') ? image.url : `http://localhost:5000${image.url}`,
                                image.title
                              )}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Share className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardFooter>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </motion.div>
  );
};

export default Gallery;