
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Code, Lightbulb, Sparkles, Wand2 } from "lucide-react";

const Docs = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col items-center text-center mb-12">
        <Badge variant="secondary" className="mb-4">
          <BookOpen className="h-3.5 w-3.5 mr-1" />
          Documentation
        </Badge>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
          ImageTales Documentation
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mb-8">
          Learn how to make the most of our AI image generation tools.
        </p>
      </div>

      <Tabs defaultValue="guides" className="w-full max-w-4xl mx-auto">
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="guides">
            <Lightbulb className="h-4 w-4 mr-2 hidden sm:inline" />
            Guides
          </TabsTrigger>
          <TabsTrigger value="api">
            <Code className="h-4 w-4 mr-2 hidden sm:inline" />
            API
          </TabsTrigger>
          <TabsTrigger value="examples">
            <Sparkles className="h-4 w-4 mr-2 hidden sm:inline" />
            Examples
          </TabsTrigger>
          <TabsTrigger value="faq">
            <BookOpen className="h-4 w-4 mr-2 hidden sm:inline" />
            FAQ
          </TabsTrigger>
        </TabsList>

        <TabsContent value="guides" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Getting Started with ImageTales</CardTitle>
              <CardDescription>Learn the basics of using our AI image generation platform</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-l-4 border-primary pl-4 py-2">
                <h3 className="text-lg font-medium">Create your first AI image</h3>
                <p className="text-muted-foreground">
                  Simply enter a detailed text prompt describing the image you want to create,
                  then click the "Generate Image" button to see your idea come to life.
                </p>
              </div>
              
              <div className="border-l-4 border-primary pl-4 py-2">
                <h3 className="text-lg font-medium">Modify existing images</h3>
                <p className="text-muted-foreground">
                  Upload an image you'd like to modify, then describe the changes you want to make.
                  Our AI will apply your requested modifications while maintaining the core elements of the original.
                </p>
              </div>
              
              <div className="border-l-4 border-primary pl-4 py-2">
                <h3 className="text-lg font-medium">Create image stories</h3>
                <p className="text-muted-foreground">
                  Describe a narrative or story, and our AI will generate a series of connected images that
                  tell your story visually. Perfect for presentations, storyboarding, or creative projects.
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Writing Effective Prompts</CardTitle>
              <CardDescription>Tips for crafting prompts that generate the best results</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-muted p-4">
                <h3 className="text-lg font-medium mb-2">Prompt Structure Tips</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Be specific about subject, setting, lighting, style, and mood</li>
                  <li>Use descriptive adjectives to clarify your vision</li>
                  <li>Reference specific art styles for more directed results</li>
                  <li>Specify camera angles or perspectives for more control</li>
                  <li>Include color palettes or time of day for atmosphere</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="api" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API Documentation</CardTitle>
              <CardDescription>Integrate ImageTales into your applications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg bg-muted p-4 overflow-x-auto">
                <pre className="text-sm">
                  <code>{`// Example API call to generate an image
fetch('https://api.imagetales.com/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    prompt: 'A serene mountain landscape at sunset with a lake reflecting the sky',
    size: '1024x1024',
    style: 'realistic'
  })
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));`}</code>
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="examples" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Example Prompts</CardTitle>
              <CardDescription>Examples of effective prompts and their results</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-medium">Fantasy Landscape</h3>
                <p className="text-muted-foreground mb-2">
                  "A magical floating island with waterfalls cascading from its edges, 
                  lush gardens and a crystal castle at its center, golden sunset lighting, fantasy art style"
                </p>
              </div>
              
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-medium">Character Portrait</h3>
                <p className="text-muted-foreground mb-2">
                  "Portrait of a wise elderly alchemist with piercing blue eyes and long white beard, 
                  surrounded by glass vials of colorful potions, detailed digital art"
                </p>
              </div>
              
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-medium">Abstract Concept</h3>
                <p className="text-muted-foreground mb-2">
                  "Abstract representation of the concept of time, flowing clock faces melting
                  like in Dali's paintings, cosmic background with nebulas, surrealist style"
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="faq" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>Common questions about using ImageTales</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-b pb-4">
                <h3 className="text-lg font-medium">What image formats are supported?</h3>
                <p className="text-muted-foreground">
                  ImageTales supports PNG, JPG, and WebP formats for both input and output images.
                </p>
              </div>
              
              <div className="border-b pb-4">
                <h3 className="text-lg font-medium">Is there a limit to how many images I can generate?</h3>
                <p className="text-muted-foreground">
                  Free accounts can generate up to 50 images per month. Premium subscribers have higher or unlimited quotas
                  depending on their subscription tier.
                </p>
              </div>
              
              <div className="border-b pb-4">
                <h3 className="text-lg font-medium">Who owns the images I create?</h3>
                <p className="text-muted-foreground">
                  You retain full ownership of all images you generate using ImageTales. You're free to use them
                  for personal or commercial purposes according to our terms of service.
                </p>
              </div>
              
              <div className="pb-4">
                <h3 className="text-lg font-medium">Can I use these images commercially?</h3>
                <p className="text-muted-foreground">
                  Yes, all images generated with your account are available for commercial use without attribution.
                  However, please review our terms regarding specific use cases.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Docs;
