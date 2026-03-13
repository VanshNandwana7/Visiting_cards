import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Loader2, CreditCard, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UploadZone } from "@/components/UploadZone";
import { ImagePreview } from "@/components/ImagePreview";
import { CardTable } from "@/components/CardTable";
import { ExtractionProgress } from "@/components/ExtractionProgress";
import { CardHistory } from "@/components/CardHistory";
import { CardData } from "@/types/card";
import { exportToExcel } from "@/lib/exportExcel";
import { extractCards, saveCards } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const Index = () => {
  const [images, setImages] = useState<{ file: File; preview: string }[]>([]);
  const [cards, setCards] = useState<CardData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressStep, setProgressStep] = useState("");
  const [progressValue, setProgressValue] = useState(0);
  const historyRef = useRef<{ refresh: () => void }>(null);
  const { toast } = useToast();
  const { admin, logout } = useAuth();

  const handleFilesSelected = useCallback((files: File[]) => {
    const newImages = files.map((file) => ({
      file,
      preview: file.type === "application/pdf" ? "" : URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...newImages]);
  }, []);

  const handleRemoveImage = useCallback((index: number) => {
    setImages((prev) => {
      const removed = prev[index];
      if (removed.preview) URL.revokeObjectURL(removed.preview);
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const handleExtract = useCallback(async () => {
    if (images.length === 0) return;
    setIsProcessing(true);
    setProgressStep("Preparing images…");
    setProgressValue(10);

    try {
      setProgressStep("Converting images to base64…");
      setProgressValue(20);
      const base64Images = await Promise.all(
        images
          .filter((img) => img.file.type !== "application/pdf")
          .map((img) => fileToBase64(img.file))
      );

      setProgressStep("Sending to AI for extraction…");
      setProgressValue(40);

      const data = await extractCards(base64Images);

      setProgressStep("Processing AI response…");
      setProgressValue(70);

      const newCards: CardData[] = (data.cards || []).map((c: any, i: number) => ({
        serial_number: cards.length + i + 1,
        company_name: c.company_name || "",
        owner_name: c.owner_name || "",
        designation: c.designation || "",
        address: c.address || "",
        city: c.city || "",
        state: c.state || "",
        pin_code: c.pin_code || "",
        phone_numbers: c.phone_numbers || [],
        email: c.email || "",
        website: c.website || "",
        category: c.category || "manufacturer",
      }));

      setProgressStep("Saving to history…");
      setProgressValue(85);

      // Save to database via backend API
      const rows = newCards.map((c) => ({
        serial_number: c.serial_number,
        company_name: c.company_name,
        owner_name: c.owner_name,
        designation: c.designation,
        address: c.address,
        city: c.city,
        state: c.state,
        pin_code: c.pin_code,
        phone_numbers: c.phone_numbers,
        email: c.email,
        website: c.website,
        category: c.category,
      }));

      try {
        await saveCards(rows);
      } catch (saveErr) {
        console.error("Failed to save history:", saveErr);
      }

      setProgressValue(100);
      setProgressStep("Done!");

      setCards((prev) => [...prev, ...newCards]);
      setImages([]);
      historyRef.current?.refresh();
      toast({
        title: "Extraction complete",
        description: `${newCards.length} card(s) extracted and saved.`,
      });
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Extraction failed",
        description: err.message || "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setProgressValue(0);
      setProgressStep("");
    }
  }, [images, cards.length, toast]);

  const handleUpdateCard = useCallback(
    (index: number, field: keyof CardData, value: any) => {
      setCards((prev) =>
        prev.map((c, i) => (i === index ? { ...c, [field]: value } : c))
      );
    },
    []
  );

  const handleDeleteCard = useCallback((index: number) => {
    setCards((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((c, i) => ({ ...c, serial_number: i + 1 }))
    );
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 glass-surface border-b border-border">
        <div className="container mx-auto flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-foreground" />
            <span className="font-semibold text-foreground tracking-tight">Smart Visita</span>
          </div>
          <div className="flex items-center gap-3">
            {cards.length > 0 && (
              <Button
                variant="accent"
                size="sm"
                className="rounded-full"
                onClick={() => exportToExcel(cards)}
              >
                <Download className="h-4 w-4" />
                Export Excel
              </Button>
            )}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground hidden sm:block">
                {admin?.username}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-full"
                onClick={logout}
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 md:py-16 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-center space-y-3 max-w-2xl mx-auto"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gradient leading-tight">
            Extract Visiting Cards
          </h1>
          <p className="text-muted-foreground text-lg">
            Upload photos of business cards. AI extracts all details instantly.
          </p>
        </motion.div>

        <div className="max-w-2xl mx-auto">
          <UploadZone onFilesSelected={handleFilesSelected} isProcessing={isProcessing} />
        </div>

        {/* Progress Indicator */}
        <AnimatePresence>
          {isProcessing && (
            <ExtractionProgress currentStep={progressStep} progress={progressValue} />
          )}
        </AnimatePresence>

        {images.length > 0 && !isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-4xl mx-auto space-y-4"
          >
            <ImagePreview images={images} onRemove={handleRemoveImage} />
            <div className="flex justify-center">
              <Button variant="hero" onClick={handleExtract} disabled={isProcessing}>
                {`Extract ${images.length} Card${images.length > 1 ? "s" : ""}`}
              </Button>
            </div>
          </motion.div>
        )}

        {cards.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">
                Extracted Cards ({cards.length})
              </h2>
              <Button variant="hero" onClick={() => exportToExcel(cards)}>
                <Download className="h-4 w-4" />
                Download Excel
              </Button>
            </div>
            <CardTable
              cards={cards}
              onUpdateCard={handleUpdateCard}
              onDeleteCard={handleDeleteCard}
            />
            <p className="text-xs text-muted-foreground text-center">
              Click any cell to edit • Change categories before exporting • Each category becomes a separate sheet
            </p>
          </div>
        )}

        {/* History Section */}
        <CardHistory ref={historyRef} />
      </main>
    </div>
  );
};

export default Index;
