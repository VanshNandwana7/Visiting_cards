import { useCallback, useRef } from "react";
import { Camera, Upload, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface UploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  isProcessing: boolean;
}

export function UploadZone({ onFilesSelected, isProcessing }: UploadZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length > 0) onFilesSelected(files);
      e.target.value = "";
    },
    [onFilesSelected]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) onFilesSelected(files);
    },
    [onFilesSelected]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="w-full"
    >
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="relative rounded-2xl border-2 border-dashed border-border bg-card p-8 md:p-16 text-center transition-all hover:border-muted-foreground/40 hover:shadow-card"
      >
        <div className="flex flex-col items-center gap-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary">
            <ImagePlus className="h-8 w-8 text-muted-foreground" />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Drop visiting cards here
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              JPEG, PNG, PDF — multiple files supported
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="hero"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
            >
              <Upload className="h-4 w-4" />
              Upload Files
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="rounded-full h-12 px-8 text-base"
              onClick={() => cameraInputRef.current?.click()}
              disabled={isProcessing}
            >
              <Camera className="h-4 w-4" />
              Take Photo
            </Button>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,application/pdf"
          className="hidden"
          onChange={handleFiles}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFiles}
        />
      </div>
    </motion.div>
  );
}
