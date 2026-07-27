import { Button } from "@hezaerd/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@hezaerd/ui/components/dialog";

type FilePreviewDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  previewKind: "image" | "pdf" | "video" | "none";
  url: string;
  fileName: string;
};

export function FilePreviewDialog({
  open,
  onOpenChange,
  previewKind,
  url,
  fileName,
}: FilePreviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-hidden p-0">
        <DialogHeader className="border-border border-b px-6 py-4">
          <DialogTitle className="truncate pr-8">{fileName}</DialogTitle>
        </DialogHeader>
        <div className="bg-muted/20 flex max-h-[calc(90vh-5rem)] min-h-[16rem] items-center justify-center overflow-auto p-4">
          {previewKind === "image" ? (
            <img src={url} alt={fileName} className="max-h-[70vh] max-w-full object-contain" />
          ) : null}
          {previewKind === "pdf" ? (
            <iframe src={url} title={fileName} className="h-[70vh] w-full rounded-lg border" />
          ) : null}
          {previewKind === "video" ? (
            <video src={url} controls className="max-h-[70vh] max-w-full rounded-lg">
              <track kind="captions" />
            </video>
          ) : null}
        </div>
        <div className="border-border flex justify-end border-t px-6 py-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
