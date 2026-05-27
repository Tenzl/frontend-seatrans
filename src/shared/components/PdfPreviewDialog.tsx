'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/shared/components/ui/dialog'
import { Button } from '@/shared/components/ui/button'
import { useRef, useState, useEffect } from 'react'
import { Loader2, Printer } from 'lucide-react'
import { toast } from '@/shared/utils/toast'

interface PdfPreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  html: string | null
  fileName: string
  isGenerating?: boolean
}

export function PdfPreviewDialog({
  open,
  onOpenChange,
  html,
  fileName,
  isGenerating = false,
}: PdfPreviewDialogProps) {
  const [iframeKey, setIframeKey] = useState(0)
  const [isExporting, setIsExporting] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement | null>(null)

  useEffect(() => {
    if (open && html) {
      setIframeKey((k) => k + 1)
    }
  }, [open, html])

  const showGenerating = isGenerating || !html

  const handlePrintPdf = async () => {
    if (!html) return
    const frameWin = iframeRef.current?.contentWindow
    if (!frameWin) {
      toast.error('Preview is not ready yet. Please try again.')
      return
    }

    setIsExporting(true)
    try {
      // Give the browser a moment so layout/fonts settle before printing.
      await new Promise<void>((resolve) => window.setTimeout(resolve, 2000))

      frameWin.focus()
      frameWin.print()

      // Close the preview right after triggering print dialog.
      window.setTimeout(() => onOpenChange(false), 150)
    } catch (err) {
      console.error('Failed to print EPDA:', err)
      toast.error(err instanceof Error ? err.message : 'Failed to open print dialog')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-4 border-b flex flex-row items-center justify-between space-y-0 shrink-0">
          <div className="flex flex-col gap-1 min-w-0 flex-1">
            <DialogTitle className="truncate pr-8">{fileName}</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Print will open the browser Save as PDF dialog.
            </DialogDescription>
          </div>
          {!showGenerating && (
            <div className="flex shrink-0 items-center gap-2">
              <Button
                size="sm"
                onClick={handlePrintPdf}
                disabled={!html || isExporting}
                className="gap-2"
              >
                {isExporting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Printer className="h-4 w-4" />
                )}
                Print / Save PDF
              </Button>
            </div>
          )}
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-hidden bg-slate-100 dark:bg-slate-900">
          {showGenerating ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 p-12">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Building EPDA preview…</p>
            </div>
          ) : (
            <iframe
              key={iframeKey}
              ref={iframeRef}
              srcDoc={html ?? ''}
              title={fileName}
              className="h-full w-full border-0 bg-white"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
