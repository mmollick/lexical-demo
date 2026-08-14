import { Loader2 } from 'lucide-react';

/** Shown in place of an image while its upload is in flight. */
export const LoadingContent = () => (
  <div className="flex w-full flex-col items-center justify-center gap-4 text-center">
    <p className="text-lg font-semibold">Processing...</p>
    <Loader2 className="size-8 animate-spin text-muted-foreground" />
  </div>
);
