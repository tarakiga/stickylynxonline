"use client"
import * as React from "react"
import { Modal } from "@/components/ui/Modal"
import { Button } from "@/components/ui/Button"

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Delete Item",
  description = "This action cannot be undone. Are you sure you want to continue?",
  confirmLabel = "Delete",
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} description={description} icon="danger">
      <div className="flex gap-3 justify-end">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button
          variant="primary"
          onClick={() => { onConfirm(); onClose(); }}
          className="bg-error hover:bg-error/90 border-none text-white shadow-sm"
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}
