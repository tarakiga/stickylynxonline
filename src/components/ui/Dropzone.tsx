"use client"
import * as React from "react"
import { UploadCloud, FileText, X } from "lucide-react"
import { cn } from "@/lib/utils"

export interface DropzoneProps {
  label?: string;
  hint: string;
  accept?: string;
  className?: string;
  onChange?: (file: File) => void;
  onMultiple?: (files: File[]) => void;
  multiple?: boolean;
  value?: File | null;
  disabled?: boolean;
}

export function Dropzone({ label, hint, accept, className, onChange, onMultiple, multiple, value, disabled = false }: DropzoneProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = React.useState(false)
  const [selectedFile, setSelectedFile] = React.useState<File | null>(value || null)

  React.useEffect(() => { setSelectedFile(value || null) }, [value])

  function handleFile(file: File) {
    setSelectedFile(file)
    onChange?.(file)
  }

  function handleFiles(files: FileList) {
    if (multiple && onMultiple) {
      onMultiple(Array.from(files))
    } else if (files[0]) {
      handleFile(files[0])
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (disabled) return
    if (e.target.files) handleFiles(e.target.files)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    if (disabled) return
    if (e.dataTransfer.files) handleFiles(e.dataTransfer.files)
  }

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation()
    setSelectedFile(null)
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <div className={cn("w-full", className)}>
      {label && <h4 className="font-bold text-sm mb-2 text-text-primary">{label}</h4>}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="sr-only"
        onChange={handleInputChange}
        disabled={disabled}
      />
      <div
        onClick={() => { if (!disabled) inputRef.current?.click() }}
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          "border-2 border-dashed rounded-xl p-4 sm:p-6 md:p-8 flex flex-col items-center justify-center text-center transition-all group",
          disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
          dragOver
            ? "border-primary bg-primary/10 scale-[1.01]"
            : disabled
            ? "border-divider bg-background"
            : "border-divider hover:border-primary bg-background hover:bg-primary/5"
        )}
      >
        {selectedFile ? (
          <div className="flex items-center gap-2 sm:gap-3 w-full overflow-hidden">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-success/10 text-success flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-[11px] sm:text-sm font-semibold text-text-primary truncate">{selectedFile.name}</p>
              <p className="text-[10px] text-text-secondary">{(selectedFile.size / 1024).toFixed(1)} KB</p>
            </div>
            <button
              onClick={handleClear}
              className="w-6 h-6 rounded-full bg-divider hover:bg-error/10 hover:text-error flex items-center justify-center transition-colors border-none cursor-pointer shrink-0"
              aria-label="Remove file"
              disabled={disabled}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-surface shadow-sm flex items-center justify-center mb-2 sm:mb-3 group-hover:scale-110 transition-transform">
              <UploadCloud className="text-text-secondary group-hover:text-primary w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <p className="text-xs sm:text-sm font-semibold text-text-primary">Click or drag to upload</p>
            <p className="text-[10px] sm:text-xs text-text-secondary mt-1">{hint}</p>
          </>
        )}
      </div>
    </div>
  )
}
