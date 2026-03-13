import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ExtractionProgressProps {
  currentStep: string;
  progress: number;
}

export function ExtractionProgress({ currentStep, progress }: ExtractionProgressProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="max-w-md mx-auto space-y-3 py-6"
    >
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin text-accent" />
        <span>{currentStep}</span>
      </div>
      <Progress value={progress} className="h-2" />
      <p className="text-xs text-center text-muted-foreground">{Math.round(progress)}%</p>
    </motion.div>
  );
}
