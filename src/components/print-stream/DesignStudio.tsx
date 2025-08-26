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
const sizes = ["S", "M", "L", "XL", "XXL"];

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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        toast({
          title: "File terlalu besar",
          description: "Silakan unggah file yang lebih kecil dari 4MB.",
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
        title: "Tidak ada desain yang diunggah",
        description: "Silakan unggah desain terlebih dahulu.",
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
            title: "Desain Berhasil Ditingkatkan",
            description: "Desain Anda telah berhasil disempurnakan oleh AI.",
          });
        } else {
          setError(result.error || "Terjadi kesalahan yang tidak diketahui.");
          setDisplayedDesign(design); // Revert to original on error
          toast({
            title: "Peningkatan Gagal",
            description: result.error || "Tidak dapat meningkatkan desain.",
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
        title: "Prompt Kosong",
        description: "Silakan masukkan prompt untuk menyempurnakan desain Anda.",
        variant: "destructive",
      });
      return;
    }
    handleEnhanceDesign(customPrompt);
  };

  const finalPrice = 18.49;
  
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
            <CardTitle className="font-headline text-2xl">Kustomisasi Produk Anda</CardTitle>
            <CardDescription>Unggah desain dan pilih opsi Anda.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="design-upload">
                <Upload className="inline-block mr-2 h-4 w-4" />
                Unggah Desain Anda
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
                    alt="Pratinjau Desain Asli"
                    width={80}
                    height={80}
                    className="rounded-md object-contain"
                  />
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="font-semibold text-md">Opsi Produk</h3>
              <div className="space-y-2">
                <Label htmlFor="color-select">
                  <Palette className="inline-block mr-2 h-4 w-4" />
                  Warna Kaus
                </Label>
                <Select value={currentColor} onValueChange={setCurrentColor}>
                  <SelectTrigger id="color-select">
                    <SelectValue placeholder="Pilih warna" />
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
                  Ukuran
                </Label>
                <Select defaultValue="M">
                  <SelectTrigger id="size-select">
                    <SelectValue placeholder="Pilih ukuran" />
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
              <h3 className="font-semibold text-md">Penyempurnaan AI</h3>
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
                Tingkatkan Kualitas (AI)
              </Button>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
               <div className="space-y-2">
                  <Label htmlFor="custom-prompt">Atau, coba prompt kustom Anda:</Label>
                  <Textarea
                    id="custom-prompt"
                    placeholder="misalnya, 'jadikan terlihat seperti kartun tahun 90-an'"
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    disabled={isPending || !design}
                  />
                  <Button onClick={handleCustomPromptEnhance} disabled={isPending || !design || !customPrompt} className="w-full">
                    Sempurnakan dengan Prompt
                  </Button>
                </div>

              {isPending && (
                <div className="flex items-center space-x-2 p-4 rounded-md bg-muted/50">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <span className="text-muted-foreground text-sm">AI sedang berpikir... Mohon tunggu.</span>
                </div>
              )}

              {!isPending && aiSuggestions.length > 0 && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Saran Peningkatan dari AI</AlertTitle>
                  <AlertDescription>
                    <p className="mb-3">Klik salah satu saran di bawah untuk menerapkannya:</p>
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
              <span>Total Harga:</span>
              <span>${finalPrice.toFixed(2)}</span>
            </div>
            <Button size="lg" className="w-full" onClick={() => setCheckoutOpen(true)} disabled={!design || isPending}>
              Lanjutkan ke Checkout
            </Button>
          </CardFooter>
        </Card>

        <div className="lg:col-span-2">
          <Card className="sticky top-24 shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Pratinjau Langsung</CardTitle>
              <CardDescription>Lihat kreasi Anda pada maket produk.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="product-preview bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                <Image
                  src={getProductMockup()}
                  alt="Maket produk"
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
                    alt="Lapisan desain"
                    width={280}
                    height={280}
                    className="design-overlay"
                    unoptimized // Karena kita menggunakan data URI
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
                  Ditingkatkan AI
                </Badge>
              ) : design && (
                 <Badge variant="secondary">
                   Desain Asli
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
            <AlertDialogTitle>Simulasi Checkout</AlertDialogTitle>
            <AlertDialogDescription>
              Ini adalah aplikasi demo. Mengklik "Konfirmasi Pesanan" akan mensimulasikan pembelian yang berhasil. Tidak ada transaksi nyata yang akan terjadi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              setCheckoutOpen(false);
              toast({
                title: "Pesanan Dibuat!",
                description: "Terima kasih atas pembelian Anda.",
              });
            }}>
              Konfirmasi Pesanan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
