import { ReactNode } from 'react';
import { toast } from 'sonner';

import { Toaster } from '@/components/ui/sonner';

/**
 * Alert surface for the editor. sonner handles the queueing and rendering; the
 * hook exists so host apps can swap in their own notification system.
 */

export const useSnackbar = () => ({
  sendErrorAlert: (message: string) => toast.error(message),
  sendSuccessAlert: (message: string) => toast.success(message),
});

export const SnackbarProvider = ({ children }: { children: ReactNode }) => (
  <>
    {children}
    <Toaster position="bottom-center" richColors />
  </>
);
