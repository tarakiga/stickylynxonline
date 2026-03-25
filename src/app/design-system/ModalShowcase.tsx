"use client"
import * as React from "react"
import { Modal } from "@/components/ui/Modal"

export function ModalShowcase() {
  const [activeModal, setActiveModal] = React.useState<"none" | "delete" | "success" | "error" | "progress">("none")

  const close = () => setActiveModal("none")

  return (
    <div className="flex flex-wrap gap-4">
      <button onClick={() => setActiveModal("delete")} className="px-4 py-2 bg-error/10 text-error font-bold text-sm rounded-xl hover:bg-error/20 transition-colors border-none cursor-pointer">
        Delete Warning
      </button>
      <button onClick={() => setActiveModal("success")} className="px-4 py-2 bg-success/10 text-success font-bold text-sm rounded-xl hover:bg-success/20 transition-colors border-none cursor-pointer">
        Success Action
      </button>
      <button onClick={() => setActiveModal("error")} className="px-4 py-2 bg-surface flex items-center border border-divider text-text-primary font-bold text-sm rounded-xl hover:bg-divider transition-colors cursor-pointer">
        Error Action
      </button>
      <button onClick={() => {
        setActiveModal("progress")
        setTimeout(() => setActiveModal("success"), 3000) // Mock completion
      }} className="px-4 py-2 bg-primary/10 text-primary font-bold text-sm rounded-xl hover:bg-primary/20 transition-colors border-none cursor-pointer relative overflow-hidden group">
        Async Progress
        <span className="absolute bottom-0 left-0 h-0.5 bg-primary w-full origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></span>
      </button>

      {/* Delete Confirmation */}
      <Modal 
        isOpen={activeModal === "delete"} 
        onClose={close}
        icon="danger"
        title="Delete 'the restaurant'?"
        description="This action is irreversible. All data, internal links, and associated assets for this page will be permanently removed from our servers."
      >
         <button onClick={close} className="px-5 py-2.5 bg-surface border border-divider font-bold text-sm text-text-primary rounded-xl hover:bg-divider transition-colors cursor-pointer">Cancel</button>
         <button onClick={close} className="px-5 py-2.5 bg-error font-bold text-sm text-white rounded-xl hover:bg-red-600 transition-colors border-none cursor-pointer shadow-sm shadow-error/30">Yes, delete page</button>
      </Modal>

      {/* Success Confirmation */}
      <Modal 
        isOpen={activeModal === "success"} 
        onClose={close}
        icon="success"
        title="Menu successfully updated"
        description="The changes to your menu have been saved and are now live on your public profile. It may take a few minutes to reflect on all edge networks."
      >
         <button onClick={close} className="px-5 py-2.5 bg-primary font-bold text-sm text-white rounded-xl hover:bg-primary-hover transition-colors border-none cursor-pointer shadow-sm">Got it</button>
      </Modal>

      {/* Error Confirmation */}
      <Modal 
        isOpen={activeModal === "error"} 
        onClose={close}
        icon="error"
        title="Failed to update subscription"
        description="We couldn't process your payment. Please ensure your card details are correct or try a different payment method."
      >
         <button onClick={close} className="px-5 py-2.5 bg-surface text-text-secondary font-bold text-sm rounded-xl hover:bg-divider transition-colors border-none cursor-pointer">Cancel</button>
         <button onClick={close} className="px-5 py-2.5 bg-surface border border-divider font-bold text-sm text-text-primary rounded-xl hover:bg-divider transition-colors cursor-pointer shadow-sm">Update Payment Details</button>
      </Modal>

      {/* Progress Confirmation */}
      <Modal 
        isOpen={activeModal === "progress"} 
        title="Publishing your profile..."
        description="We are currently generating your static pages and pushing them to our edge network. Please do not close this tab."
        icon="progress"
      >
        {/* No buttons for progress state since it completes asynchronously natively */}
      </Modal>
    </div>
  )
}
