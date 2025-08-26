"use client";

import React, { useState, useRef, useTransition, useCallback } from "react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { enhanceDesignAction } from "@/app/actions/enhance-design-action";
import {
  Upload,
  Palette,
  Ruler,
  Sparkles,
  Loader2,
  AlertCircle,
  CheckCircle,
  Info,
  Wand2,
} from "lucide-react";
import { Badge } from "../ui/badge";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "../ui/textarea";

const colors = ["White", "Black", "Navy", "Heather Grey", "Red"];

export default function DesignStudio() {
  const [design, setDesign] = useState<string | null>(null);
  const [displayedDesign, setDisplayedDesign] = useState<string | null>(null);
  const [enhancedDesign, setEnhancedDesign] = useState<string | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isCheckoutOpen, setCheckoutOpen] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 4MB.",
          variant: "destructive",
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setDesign(result);
        setDisplayedDesign(result);
        setEnhancedDesign(null);
        setAiSuggestions([]);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEnhanceDesign = useCallback((prompt?: string) => {
    if (!design) {
      toast({
        title: "No design uploaded",
        description: "Please upload a design first.",
        variant: "destructive",
      });
      return;
    }
    startTransition(() => {
      setError(null);
      setAiSuggestions([]); // Clear old suggestions
      enhanceDesignAction({ designDataUri: design, prompt }).then((result) => {
        if (result.success && result.data) {
          setEnhancedDesign(result.data.enhancedDesignDataUri);
          setDisplayedDesign(result.data.enhancedDesignDataUri);
          setAiSuggestions(result.data.suggestions);
          toast({
            title: "Design Enhanced",
            description: "Your design has been successfully enhanced by AI.",
          });
        } else {
          setError(result.error || "An unknown error occurred.");
          setDisplayedDesign(design); // Revert to original on error
          toast({
            title: "Enhancement Failed",
            description: result.error || "Could not enhance the design.",
            variant: "destructive",
          });
        }
      });
    });
  }, [design, toast]);


  const handleSuggestionClick = (suggestion: string) => {
    handleEnhanceDesign(suggestion);
  };
  
  const handleCustomPromptEnhance = () => {
    if (!customPrompt) {
      toast({
        title: "Empty Prompt",
        description: "Please enter a prompt to enhance your design.",
        variant: "destructive",
      });
      return;
    }
    handleEnhanceDesign(customPrompt);
  };

  const finalPrice = 18.49;

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 h-fit sticky top-24">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Customize Your Product</CardTitle>
            <CardDescription>Upload a design and choose your options.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="design-upload">
                <Upload className="inline-block mr-2 h-4 w-4" />
                Upload Design
              </Label>
              <Input
                id="design-upload"
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/png, image/jpeg, image/svg+xml"
                className="file:text-primary file:font-semibold"
              />
              {design && !enhancedDesign && (
                <div className="p-2 border rounded-md mt-2 w-fit">
                  <Image
                    src={design}
                    alt="Design preview"
                    width={80}
                    height={80}
                    className="rounded-md object-contain"
                  />
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="font-semibold text-md">Product Options</h3>
              <div className="space-y-2">
                <Label htmlFor="color-select">
                  <Palette className="inline-block mr-2 h-4 w-4" />
                  Color
                </Label>
                <Select defaultValue="White">
                  <SelectTrigger id="color-select">
                    <SelectValue placeholder="Select color" />
                  </SelectTrigger>
                  <SelectContent>
                    {colors.map((color) => (
                      <SelectItem key={color} value={color}>
                        {color}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="size-select">
                  <Ruler className="inline-block mr-2 h-4 w-4" />
                  Size
                </Label>
                <Select defaultValue="M">
                  <SelectTrigger id="size-select">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="S">S</SelectItem>
                    <SelectItem value="M">M</SelectItem>
                    <SelectItem value="L">L</SelectItem>
                    <SelectItem value="XL">XL</SelectItem>
                    <SelectItem value="XXL">XXL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="font-semibold text-md">AI Tools</h3>
               <Button
                onClick={() => handleEnhanceDesign()}
                disabled={isPending || !design}
                className="w-full bg-accent hover:bg-accent/90"
              >
                {isPending && !aiSuggestions.length ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Enhance with AI
              </Button>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {isPending && (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="mr-2 h-6 w-6 animate-spin text-primary" />
                  <span className="text-muted-foreground">AI is thinking...</span>
                </div>
              )}

              {!isPending && aiSuggestions.length > 0 && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>AI Suggestions</AlertTitle>
                  <AlertDescription>
                    <p className="mb-2">Click a suggestion to apply it:</p>
                    <div className="flex flex-col space-y-2">
                      {aiSuggestions.map((suggestion, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="text-left justify-start h-auto whitespace-normal"
                        >
                          <Wand2 className="mr-2 h-4 w-4 flex-shrink-0" />
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  </AlertDescription>
                </Alert>
              )}
               <div className="space-y-2">
                  <Label htmlFor="custom-prompt">Or, try your own prompt:</Label>
                  <Textarea
                    id="custom-prompt"
                    placeholder="e.g., 'make it look like a 90s cartoon'"
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    disabled={isPending || !design}
                  />
                  <Button onClick={handleCustomPromptEnhance} disabled={isPending || !design || !customPrompt} className="w-full">
                    Enhance with Custom Prompt
                  </Button>
                </div>
            </div>
          </CardContent>
          <CardFooter className="flex-col items-start space-y-4">
            <Separator />
            <div className="w-full flex justify-between items-center text-lg font-bold">
              <span>Total Price:</span>
              <span>${finalPrice.toFixed(2)}</span>
            </div>
            <Button size="lg" className="w-full" onClick={() => setCheckoutOpen(true)} disabled={!design}>
              Proceed to Checkout
            </Button>
          </CardFooter>
        </Card>

        <div className="lg:col-span-2">
          <Card className="sticky top-24 shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Live Preview</CardTitle>
              <CardDescription>See your creation on a product mockup.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="product-preview bg-gray-100 rounded-lg overflow-hidden">
                <Image
                  src="https://picsum.photos/id/1063/800/800"
                  alt="Product mockup"
                  width={800}
                  height={800}
                  className="product-mockup object-cover"
                  data-ai-hint="t-shirt blank"
                  priority
                />
                {displayedDesign && (
                  <Image
                    src={displayedDesign}
                    alt="Design overlay"
                    width={280}
                    height={280}
                    className="design-overlay"
                    unoptimized // Since we are using data URIs
                  />
                )}
                 {isPending && (
                  <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  </div>
                )}
              </div>
              {enhancedDesign && (
                <Badge className="mt-4 bg-green-100 text-green-800 border-green-300 hover:bg-green-200">
                  <CheckCircle className="h-4 w-4 mr-1"/>
                  AI Enhanced
                </Badge>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <AlertDialog open={isCheckoutOpen} onOpenChange={setCheckoutOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Checkout Simulation</AlertDialogTitle>
            <AlertDialogDescription>
              This is a demo application. Clicking "Confirm Order" will simulate a successful purchase. No real transaction will occur.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              setCheckoutOpen(false);
              toast({
                title: "Order Placed!",
                description: "Thank you for your purchase.",
              });
            }}>
              Confirm Order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
