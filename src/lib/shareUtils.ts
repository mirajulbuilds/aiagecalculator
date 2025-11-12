import { toast } from "sonner";

interface ShareOptions {
  title?: string;
  text: string;
  url: string;
}

/**
 * Native Share function using Web Share API with clipboard fallback
 * Works across all browsers - uses native sharing on mobile/supported browsers,
 * falls back to clipboard copy on unsupported browsers
 */
export const triggerNativeShare = async ({ title, text, url }: ShareOptions): Promise<void> => {
  try {
    // Try Web Share API first (works on mobile and some desktop browsers)
    if (navigator.share) {
      await navigator.share({
        title: title || "AiAgeCalc.com",
        text,
        url,
      });
      toast.success("Shared successfully!");
    } else {
      // Fallback: Copy to clipboard
      const shareContent = title ? `${title}\n${text} ${url}` : `${text} ${url}`;
      await navigator.clipboard.writeText(shareContent);
      toast.success("Link copied to clipboard!");
    }
  } catch (error) {
    // If share was cancelled or failed, try clipboard as final fallback
    if (error instanceof Error && error.name !== "AbortError") {
      try {
        const shareContent = title ? `${title}\n${text} ${url}` : `${text} ${url}`;
        await navigator.clipboard.writeText(shareContent);
        toast.success("Link copied to clipboard!");
      } catch (clipboardError) {
        console.error("Share error:", error);
        toast.error("Failed to share");
      }
    }
  }
};
