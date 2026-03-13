import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ImagePreviewProps {
  images: { file: File; preview: string }[];
  onRemove: (index: number) => void;
}

export function ImagePreview({ images, onRemove }: ImagePreviewProps) {
  if (images.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      <AnimatePresence>
        {images.map((img, idx) => (
          <motion.div
            key={img.preview}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative group aspect-[3/2] rounded-xl overflow-hidden bg-secondary shadow-soft"
          >
            {img.file.type === "application/pdf" ? (
              <div className="flex items-center justify-center h-full text-muted-foreground text-xs font-medium">
                PDF — {img.file.name}
              </div>
            ) : (
              <img
                src={img.preview}
                alt={`Card ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            )}
            <button
              onClick={() => onRemove(idx)}
              className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-foreground/70 text-background flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-3 w-3" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
