import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sparkles, Wand2, Book, ArrowRight, Image as ImageIcon, Heart, Save, Download } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import api from '../api/client';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.3,
      staggerChildren: 0.2
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

const Index = () => {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [modificationPrompt, setModificationPrompt] = useState('');
  const [storyPrompt, setStoryPrompt] = useState('');
  const [numStoryImages, setNumStoryImages] = useState(3);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('create');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [storyData, setStoryData] = useState<{ introduction: string; scenes: { text: string; image: string; prompt: string; timestamp: string }[] } | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState<string | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [imageTitle, setImageTitle] = useState('');
  const [imageCategory, setImageCategory] = useState('nature');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Missing prompt",
        description: "Please enter a text prompt to generate an image",
      });
      return;
    }
    
    setIsGenerating(true);
    try {
      const response = await api.post('/image/generate', { prompt });
      const imageUrl = `http://localhost:5000${response.data.image}`;
      setGeneratedImage(imageUrl);
      setStoryData(null);
      setCurrentPrompt(response.data.prompt);
      setSelectedImage(imageUrl);
      setSelectedPrompt(response.data.prompt);
      toast({
        title: "Image created!",
        description: "Your image has been successfully generated",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to generate image",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleModify = async () => {
    if (!currentPrompt) {
      toast({
        title: "No original prompt",
        description: "Please generate an image first before modifying",
      });
      return;
    }
    if (!modificationPrompt.trim()) {
      toast({
        title: "Missing modification prompt",
        description: "Please enter a description of how to modify the image",
      });
      return;
    }
    
    setIsGenerating(true);
    try {
      const response = await api.post('/image/modify', {
        original_prompt: currentPrompt,
        modification_prompt: modificationPrompt
      });
      const modifiedUrl = `http://localhost:5000${response.data.image}`;
      setGeneratedImage(modifiedUrl);
      setStoryData(null);
      setCurrentPrompt(response.data.prompt);
      setSelectedImage(modifiedUrl);
      setSelectedPrompt(response.data.prompt);
      toast({
        title: "Image modified!",
        description: "Your image has been successfully modified",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to modify image",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateStory = async () => {
    if (!storyPrompt.trim()) {
      toast({
        title: "Missing story prompt",
        description: "Please enter a story description",
      });
      return;
    }
    if (numStoryImages < 1 || numStoryImages > 10) {
      toast({
        title: "Invalid number of scenes",
        description: "Please select between 1 and 10 scenes",
      });
      return;
    }
    
    setIsGenerating(true);
    try {
      const response = await api.post('/image/story', {
        story_prompt: storyPrompt,
        num_images: numStoryImages
      });
      setStoryData({
        introduction: response.data.introduction,
        scenes: response.data.scenes.map((scene: any) => ({
          text: scene.text,
          image: `http://localhost:5000${scene.image}`,
          prompt: scene.prompt,
          timestamp: scene.timestamp
        }))
      });
      setGeneratedImage(null);
      setCurrentPrompt(null);
      toast({
        title: "Story created!",
        description: "Your story with images has been generated",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to generate story",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToGallery = async () => {
    if (!imageTitle.trim()) {
      toast({
        title: "Title required",
        description: "Please provide a title for your image",
      });
      return;
    }
    if (!selectedImage || !selectedPrompt) {
      toast({
        title: "No image selected",
        description: "Please generate or modify an image first",
      });
      return;
    }
    
    try {
      const response = await api.post('/image/save', {
        title: imageTitle,
        category: imageCategory,
        url: selectedImage,
        prompt: selectedPrompt
      });
      toast({
        title: "Image saved!",
        description: "Your image has been added to your gallery",
      });
      setShowSaveDialog(false);
      setImageTitle('');
      setImageCategory('nature');
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to save image",
      });
    }
  };

  const handleDownload = async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `story_image_${Date.now()}.jpeg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
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

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background/90"
    >
      <div className="container mx-auto px-4 py-12 lg:py-16">
        <motion.div 
          variants={itemVariants}
          className="flex flex-col items-center text-center mb-12 lg:mb-16"
        >
          <Badge variant="outline" className="mb-4 p-1 px-3 border-primary/30 bg-primary/5">
            <Sparkles className="h-3.5 w-3.5 mr-2 text-primary" />
            AI-Powered Image Generation
          </Badge>
          <motion.h1 
            className="text-4xl md:text-6xl font-bold tracking-tight mb-4 bg-gradient-to-r from-primary via-purple-500 to-indigo-400 bg-clip-text text-transparent"
            animate={{ 
              backgroundPosition: ["0% center", "100% center", "0% center"], 
            }}
            transition={{ 
              duration: 8, 
              repeat: Infinity, 
              repeatType: "mirror" 
            }}
          >
            ImageTales
          </motion.h1>
          <motion.p 
            variants={itemVariants} 
            className="text-xl text-muted-foreground max-w-2xl mb-8"
          >
            Transform your ideas into stunning visuals with our AI magic. Create, edit, and share beautiful images in seconds.
          </motion.p>
        </motion.div>

        <Tabs 
          defaultValue="create" 
          className="w-full max-w-4xl mx-auto"
          onValueChange={setActiveTab}
        >
          <motion.div variants={itemVariants}>
            <TabsList className="grid grid-cols-3 mb-8">
              <TabsTrigger value="create" className="flex items-center gap-2">
                <Wand2 className="h-4 w-4" />
                <span className="hidden sm:inline">Create</span>
              </TabsTrigger>
              <TabsTrigger value="modify" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                <span className="hidden sm:inline">Modify</span>
              </TabsTrigger>
              <TabsTrigger value="story" className="flex items-center gap-2">
                <Book className="h-4 w-4" />
                <span className="hidden sm:inline">Story</span>
              </TabsTrigger>
            </TabsList>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="mt-8 grid grid-cols-1 md:grid-cols-5 gap-8"
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              className="col-span-1 md:col-span-2"
            >
              <Card className="border-none shadow-md hover:shadow-lg transition-all rounded-xl overflow-hidden">
                <CardHeader className="bg-muted/30 border-b border-border/40">
                  <CardTitle>
                    {activeTab === 'create' && "Text to Image"}
                    {activeTab === 'modify' && "Modify Image"}
                    {activeTab === 'story' && "Image Story"}
                  </CardTitle>
                  <CardDescription>
                    {activeTab === 'create' && "Generate an image from your description"}
                    {activeTab === 'modify' && "Refine and transform existing images"}
                    {activeTab === 'story' && "Create a visual story with AI"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <TabsContent value="create" className="mt-0">
                    <Textarea 
                      placeholder="Describe the image you want to create..." 
                      className="min-h-[150px] resize-none focus:ring-2 focus:ring-primary/50 transition-all rounded-lg" 
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                    />
                  </TabsContent>
                  <TabsContent value="modify" className="mt-0">
                    <div className="space-y-4">
                      <motion.div 
                        whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                        className="bg-muted/50 rounded-lg p-4 flex items-center justify-center border border-dashed border-muted h-[180px]"
                      >
                        {generatedImage ? (
                          <img 
                            src={generatedImage} 
                            alt="Selected image" 
                            className="h-full object-contain rounded-md" 
                          />
                        ) : (
                          <p className="text-muted-foreground">Generate an image first to modify</p>
                        )}
                      </motion.div>
                      <Textarea 
                        placeholder="Describe how you want to modify the image..." 
                        className="min-h-[80px] resize-none focus:ring-2 focus:ring-primary/50 transition-all rounded-lg"
                        value={modificationPrompt}
                        onChange={(e) => setModificationPrompt(e.target.value)}
                      />
                    </div>
                  </TabsContent>
                  <TabsContent value="story" className="mt-0">
                    <div className="space-y-4">
                      <Textarea 
                        placeholder="Describe the story (e.g., 'A white baby goat going on an adventure in a farm in a 3D cartoon animation style')" 
                        className="min-h-[120px] resize-none focus:ring-2 focus:ring-primary/50 transition-all rounded-lg"
                        value={storyPrompt}
                        onChange={(e) => setStoryPrompt(e.target.value)}
                      />
                      <div className="flex items-center gap-2">
                        <div className="flex-grow">
                          <p className="text-sm text-muted-foreground mb-1">Number of scenes</p>
                          <Input 
                            type="number" 
                            placeholder="Number of scenes" 
                            min={1} 
                            max={10} 
                            value={numStoryImages}
                            onChange={(e) => setNumStoryImages(parseInt(e.target.value) || 1)}
                            className="focus:ring-2 focus:ring-primary/50 transition-all"
                          />
                        </div>
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-10 w-10"
                            onClick={handleGenerateStory}
                            disabled={isGenerating}
                          >
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </motion.div>
                      </div>
                    </div>
                  </TabsContent>
                </CardContent>
                <CardFooter className="p-6 pt-2">
                  <motion.div 
                    whileHover={{ scale: 1.03 }} 
                    whileTap={{ scale: 0.97 }}
                    className="w-full"
                  >
                    <Button 
                      className="w-full rounded-lg bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-600 transition-all" 
                      onClick={
                        activeTab === 'modify' ? handleModify :
                        activeTab === 'story' ? handleGenerateStory : 
                        handleGenerate
                      }
                      disabled={isGenerating}
                    >
                      {isGenerating ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          {activeTab === 'modify' ? "Modifying..." : activeTab === 'story' ? "Generating Story..." : "Generating..."}
                        </>
                      ) : (
                        <>
                          <Wand2 className="h-4 w-4 mr-2" />
                          {activeTab === 'create' && "Generate Image"}
                          {activeTab === 'modify' && "Modify Image"}
                          {activeTab === 'story' && "Generate Story"}
                        </>
                      )}
                    </Button>
                  </motion.div>
                </CardFooter>
              </Card>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              className="col-span-1 md:col-span-3 flex flex-col overflow-hidden"
            >
              <Card className="flex-grow shadow-md hover:shadow-lg transition-all rounded-xl border-none h-full">
                <CardHeader className="flex-none bg-muted/30 border-b border-border/40">
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    Result Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-grow p-0 bg-muted/20 relative h-[400px] overflow-y-auto">
                    {storyData ? (
                    <div className="w-full p-4 flex flex-col gap-6">
                      <div className="text-muted-foreground">
                        <p>{storyData.introduction}</p>
                      </div>
                      {storyData.scenes.map((scene, index) => (
                        <div key={index} className="relative group">
                          <h4 className="font-semibold mb-2">Scene {index + 1}:</h4>
                          <p className="text-muted-foreground mb-4">{scene.text}</p>
                          <motion.img 
                            src={scene.image} 
                            alt={`Story scene ${index + 1}`} 
                            className="max-w-full max-h-[300px] object-contain rounded-md shadow-md"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                          />
                          <p className="text-sm text-muted-foreground mt-2">
                            Generated Image {scene.timestamp}.jpeg
                          </p>
                          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                              <Button 
                                onClick={() => {
                                  setSelectedImage(scene.image);
                                  setSelectedPrompt(scene.prompt);
                                  setShowSaveDialog(true);
                                }}
                                variant="secondary" 
                                size="sm" 
                                className="flex items-center gap-1 rounded-full px-4 shadow-md"
                              >
                                <Save className="h-4 w-4" />
                                <span>Save</span>
                              </Button>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                              <Button 
                                onClick={() => handleDownload(scene.image)}
                                variant="secondary" 
                                size="sm" 
                                className="flex items-center gap-1 rounded-full px-3 shadow-md"
                              >
                                <Download className="h-4 w-4" />
                                <span>Download</span>
                              </Button>
                            </motion.div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : generatedImage ? (
                    <div className="w-full h-full flex items-center justify-center p-4 relative group">
                      <motion.img 
                        src={generatedImage} 
                        alt="Generated image" 
                        className="max-w-full max-h-full object-contain rounded-md shadow-md"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        key={generatedImage}
                      />
                      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                          <Button 
                            onClick={() => {
                              setSelectedImage(generatedImage);
                              setSelectedPrompt(currentPrompt);
                              setShowSaveDialog(true);
                            }}
                            variant="secondary" 
                            size="sm" 
                            className="flex items-center gap-1 rounded-full px-4 shadow-md"
                          >
                            <Save className="h-4 w-4" />
                            <span>Save to Gallery</span>
                          </Button>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                          <Button 
                            onClick={() => handleDownload(generatedImage)}
                            variant="secondary" 
                            size="sm" 
                            className="flex items-center gap-1 rounded-full px-3 shadow-md"
                          >
                            <Download className="h-4 w-4" />
                            <span>Download</span>
                          </Button>
                        </motion.div>
                      </div>
                    </div>
                  ) : (
                    <motion.div 
                      className="text-center p-8"
                      animate={{
                        scale: [1, 1.05, 1],
                        opacity: [0.7, 1, 0.7]
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        repeatType: "loop"
                      }}
                    >
                      <div className="bg-primary/5 rounded-full p-8 inline-block mb-6">
                        <Sparkles className="h-16 w-16 text-primary/50" />
                      </div>
                      <h3 className="text-xl font-medium mb-2">Your Creations Will Appear Here</h3>
                      <p className="text-muted-foreground max-w-md mx-auto">Enter a prompt and click Generate to create beautiful AI images</p>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </Tabs>
      </div>

      <motion.div 
        variants={containerVariants}
        className="container mx-auto px-4 py-16 bg-muted/10 rounded-3xl my-8"
      >
        <motion.h2 
          variants={itemVariants} 
          className="text-3xl font-bold text-center mb-12"
        >
          Create with AI Magic
        </motion.h2>
        <motion.div 
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <FeatureCard 
            icon={<Wand2 className="h-8 w-8" />}
            title="Text to Image"
            description="Transform your descriptions into stunning visuals with our powerful AI"
          />
          <FeatureCard 
            icon={<Sparkles className="h-8 w-8" />}
            title="Image Modification"
            description="Refine and transform existing images with simple text prompts"
          />
          <FeatureCard 
            icon={<Book className="h-8 w-8" />}
            title="Image Stories"
            description="Create visual narratives with a sequence of AI-generated images"
          />
        </motion.div>
      </motion.div>

      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Save to Gallery</DialogTitle>
            <DialogDescription>
              Add this image to your personal gallery to access it later.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex justify-center mb-4">
              {selectedImage && (
                <img 
                  src={selectedImage} 
                  alt="Selected image" 
                  className="max-w-full max-h-[200px] object-contain rounded-md shadow-sm" 
                />
              )}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="title" className="text-right text-sm font-medium col-span-1">
                Title
              </label>
              <Input
                id="title"
                value={imageTitle}
                onChange={(e) => setImageTitle(e.target.value)}
                placeholder="My awesome image"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="category" className="text-right text-sm font-medium col-span-1">
                Category
              </label>
              <select
                id="category"
                value={imageCategory}
                onChange={(e) => setImageCategory(e.target.value)}
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="nature">Nature</option>
                <option value="art">Art</option>
                <option value="urban">Urban</option>
                <option value="abstract">Abstract</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <DialogFooter className="flex items-center justify-between sm:justify-between">
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSaveToGallery}>
              <Heart className="mr-2 h-4 w-4" /> Save to Gallery
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

const FeatureCard = ({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
}) => {
  return (
    <motion.div 
      variants={itemVariants}
      whileHover={{ 
        y: -10,
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
      }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
    >
      <Card className="border-none shadow-md transition-all h-full rounded-xl overflow-hidden">
        <CardContent className="pt-6">
          <motion.div 
            className="p-3 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4"
            whileHover={{ rotate: 5, scale: 1.1 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            {icon}
          </motion.div>
          <h3 className="text-xl font-semibold mb-2">{title}</h3>
          <p className="text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default Index;