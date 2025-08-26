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
import { createOrderAction } from "@/app/actions/create-order-action";
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
import { useRouter } from "next/navigation";

const colors = ["White", "Black", "Navy", "Heather Grey", "Red"];
const sizes = ["S", "M", "L", "XL", "XXL"];
const finalPrice = 18.49;

export default function DesignStudio() {
  const [design, setDesign] = useState<string | null>(null);
  const [displayedDesign, setDisplayedDesign] = useState<string | null>(null);
  const [enhancedDesign, setEnhancedDesign] = useState<string | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isCheckoutOpen, setCheckoutOpen] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const [currentColor, setCurrentColor] = useState("White");
  const [currentSize, setCurrentSize] = useState("M");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const router = useRouter();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        toast({
          title: "File is too large",
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
        setCustomPrompt("");
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
    setCustomPrompt(suggestion);
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

  const handleCheckout = () => {
     if (!design) return;
     startTransition(async () => {
        const result = await createOrderAction({
            // For now, we'll use a hardcoded product ID.
            // In a real app, this would come from the selected product.
            productId: "tshirt-regular", 
            designDataUri: enhancedDesign || design,
            color: currentColor,
            size: currentSize,
            price: finalPrice,
        });

        if (result.success) {
            toast({
                title: "Order Created!",
                description: "Thank you for your purchase.",
            });
            router.push('/orders');
        } else {
            toast({
                title: "Order Failed",
                description: result.error || "There was a problem creating your order.",
                variant: "destructive",
            });
        }
        setCheckoutOpen(false);
     });
  };
  
  const getProductMockup = () => {
    switch(currentColor) {
      case "Black":
        return "https://picsum.photos/id/1074/800/800";
      case "Navy":
        return "https://picsum.photos/id/1025/800/800";
      case "Heather Grey":
        return "https://picsum.photos/id/1011/800/800";
      case "Red":
        return "https://picsum.photos/id/1015/800/800";
      default:
        return "https://picsum.photos/id/1063/800/800";
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 h-fit sticky top-24">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Customize Your Product</CardTitle>
            <CardDescription>Upload a design and select your options.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="design-upload">
                <Upload className="inline-block mr-2 h-4 w-4" />
                Upload Your Design
              </Label>
              <Input
                id="design-upload"
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/png, image/jpeg, image/svg+xml"
                className="file:text-primary file:font-semibold"
              />
              {design && (
                <div className="p-2 border rounded-md mt-2 w-fit bg-slate-50">
                  <Image
                    src={design}
                    alt="Original design preview"
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
                  T-Shirt Color
                </Label>
                <Select value={currentColor} onValueChange={setCurrentColor}>
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
                <Select value={currentSize} onValueChange={setCurrentSize}>
                  <SelectTrigger id="size-select">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    {sizes.map(size => (
                       <SelectItem key={size} value={size}>{size}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="font-semibold text-md">AI Enhancement</h3>
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
                Enhance Quality (AI)
              </Button>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
               <div className="space-y-2">
                  <Label htmlFor="custom-prompt">Or, try your own custom prompt:</Label>
                  <Textarea
                    id="custom-prompt"
                    placeholder="e.g., 'make it look like a 90s cartoon'"
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    disabled={isPending || !design}
                  />
                  <Button onClick={handleCustomPromptEnhance} disabled={isPending || !design || !customPrompt} className="w-full">
                    Enhance with Prompt
                  </Button>
                </div>

              {isPending && !aiSuggestions.length && (
                <div className="flex items-center space-x-2 p-4 rounded-md bg-muted/50">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <span className="text-muted-foreground text-sm">AI is thinking... This may take a moment.</span>
                </div>
              )}

              {!isPending && aiSuggestions.length > 0 && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>AI Enhancement Suggestions</AlertTitle>
                  <AlertDescription>
                    <p className="mb-3">Click a suggestion below to apply it:</p>
                    <div className="flex flex-col space-y-2">
                      {aiSuggestions.map((suggestion, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="text-left justify-start h-auto whitespace-normal"
                          disabled={isPending}
                        >
                          <Wand2 className="mr-2 h-4 w-4 flex-shrink-0" />
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex-col items-start space-y-4">
            <Separator />
            <div className="w-full flex justify-between items-center text-lg font-bold">
              <span>Total Price:</span>
              <span>${finalPrice.toFixed(2)}</span>
            </div>
            <Button size="lg" className="w-full" onClick={() => setCheckoutOpen(true)} disabled={!design || isPending}>
              Continue to Checkout
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
              <div className="product-preview bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                <Image
                  src={getProductMockup()}
                  alt="Product mockup"
                  width={800}
                  height={800}
                  className="product-mockup object-cover transition-all duration-300"
                  data-ai-hint="t-shirt blank"
                  priority
                  key={currentColor}
                />
                {displayedDesign && (
                  <Image
                    src={displayedDesign}
                    alt="Design overlay"
                    width={280}
                    height={280}
                    className="design-overlay"
                    unoptimized // Because we are using data URIs
                  />
                )}
                 {isPending && (
                  <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  </div>
                )}
              </div>
              <div className="mt-4 flex items-center gap-2">
              {enhancedDesign ? (
                <Badge className="bg-green-100 text-green-800 border-green-300 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-200 dark:border-green-700">
                  <CheckCircle className="h-4 w-4 mr-1"/>
                  AI Enhanced
                </Badge>
              ) : design && (
                 <Badge variant="secondary">
                   Original Design
                 </Badge>
               )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <AlertDialog open={isCheckoutOpen} onOpenChange={setCheckoutOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Your Order</AlertDialogTitle>
            <AlertDialogDescription>
              This is a demo application. Clicking "Confirm Order" will create a real order and work order in the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleCheckout} disabled={isPending}>
               {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
               {isPending ? "Submitting..." : "Confirm Order"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
