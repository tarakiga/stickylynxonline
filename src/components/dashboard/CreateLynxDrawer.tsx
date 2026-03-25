"use client";
import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { X, ChevronRight, Loader2, ArrowLeft, Layers } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { StepProgress } from "@/components/ui/Progress";

import { createLynxPage } from "@/app/actions";

export function CreateLynxDrawer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryStr = searchParams.get("drawer");

  const isOpen = !!categoryStr;
  const [step, setStep] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(false);

  // Form states
  const [handle, setHandle] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [clientName, setClientName] = React.useState(""); // Specific to Project Portal
  const [clientEmail, setClientEmail] = React.useState(""); // Specific to Project Portal

  // Reset steps if we change categories or close
  React.useEffect(() => {
    if (isOpen) setStep(1);
  }, [isOpen]);

  if (!isOpen) return null;

  const close = () => {
    router.push("/dashboard");
  };

  const isProjectPortal = categoryStr === "PROJECT_PORTAL";
  const isEpk = categoryStr === "EPK";

  const handleNext = () => setStep(2);
  const handleBack = () => setStep(1);
  
  const handleCreate = async () => {
    setIsLoading(true);
    try {
      const result = await createLynxPage({
        title,
        handle,
        category: categoryStr as string,
        clientEmail: isProjectPortal ? clientEmail : undefined,
        config: isProjectPortal ? { clientName } : isEpk ? { artistName: title, genre: "" } : undefined
      });

      if (result.error) {
        alert(result.error);
        setIsLoading(false);
        return;
      }
      
      router.push(`/dashboard/editor/${result.pageId}`);
    } catch (e: any) {
      console.error(e);
      alert("Something went wrong while communicating with the database.");
      setIsLoading(false);
    }
  };

  const activeCategoryTitle = categoryStr?.replace(/_/g, " ").toLowerCase() || "";
  const processSteps = [
    { id: "basic", label: "Basic Info" },
    { id: "config", label: "Configuration" }
  ];

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      {/* Backdrop */}
      <div 
         className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
         onClick={close} 
      />
      
      {/* Drawer Panel */}
      <div className="relative w-full max-w-md h-full bg-surface border-l border-divider shadow-premium flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-6 border-b border-divider bg-background">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-primary/10 text-primary flex items-center justify-center rounded-xl shadow-sm">
                <Layers size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-text-primary leading-tight">
                 Template Setup
              </h2>
              <p className="text-sm text-text-secondary capitalize font-semibold tracking-wide mt-0.5">
                 {activeCategoryTitle}
              </p>
            </div>
          </div>
          <button onClick={close} className="p-2 rounded-full hover:bg-divider transition-colors text-text-secondary hover:text-text-primary bg-surface border border-divider shadow-sm cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
           {/* Step Progress Indicators */}
           <div className="mb-12">
              <StepProgress steps={processSteps} currentStep={step} />
           </div>

           {/* Step 1: Core details */}
           {step === 1 && (
             <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
               <div>
                 <h3 className="font-bold text-2xl text-text-primary tracking-tight mb-2">Basic Information</h3>
                 <p className="text-sm text-text-secondary">Let's give your new Lynx a name and a recognizable URL so people can visit you.</p>
               </div>
               
               <Input 
                 labelInside="Lynx Title" 
                 placeholder={isProjectPortal ? "e.g. Acme Corp Redesign" : "e.g. My Awesome Page"}
                 value={title}
                 onChange={(e) => setTitle(e.target.value)}
                 autoFocus
               />
               
               <div className="flex flex-col">
                  <span className="text-sm font-semibold text-text-secondary mb-1 block">URL Handle</span>
                  <div className="flex items-stretch bg-background border border-divider rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary focus-within:border-primary transition-all shadow-sm">
                    <span className="px-4 flex items-center bg-surface border-r border-divider text-text-secondary font-semibold text-sm">
                      lynx.com/
                    </span>
                    <input 
                      type="text"
                      className="flex-1 px-4 py-3 placeholder:text-text-secondary/50 outline-none border-none bg-transparent w-full text-text-primary"
                      placeholder="your-unique-handle"
                      value={handle}
                      onChange={(e) => setHandle(e.target.value)}
                    />
                  </div>
               </div>
             </div>
           )}

           {/* Step 2: Category specific options */}
           {step === 2 && (
             <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
               <div>
                 <h3 className="font-bold text-2xl text-text-primary tracking-tight mb-2">Configure Details</h3>
                 <p className="text-sm text-text-secondary">Set up the initial variables for your selected layout so we can auto-generate sections.</p>
               </div>
               
               {isProjectPortal ? (
                 <>
                   <Input 
                     labelInside="Client or Company Name" 
                     placeholder="e.g. Acme Corp"
                     value={clientName}
                     onChange={(e) => setClientName(e.target.value)}
                     autoFocus
                   />
                    <Input 
                      labelInside="Client Email" 
                      type="email"
                      placeholder="e.g. client@company.com"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                    />
                    <Input 
                      labelInside="Target Launch Date" 
                      type="date"
                      placeholder="Select deadline"
                    />
                 </>
               ) : isEpk ? (
                 <>
                   <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 text-text-primary text-sm flex gap-3 shadow-sm">
                     <Layers className="text-primary mt-1 shrink-0" size={18} />
                     <p>Your EPK will be pre-configured with sections for <strong>music, videos, press photos, bio, and contact info</strong>. You can customize everything in the editor.</p>
                   </div>
                 </>
               ) : (
                 <>
                   <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 text-text-primary text-sm flex gap-3 shadow-sm">
                     <Layers className="text-primary mt-1 shrink-0" size={18} />
                     <p>No extra configuration is needed for the <strong>{activeCategoryTitle}</strong> template! We will auto-prepare your layout scaffolding.</p>
                   </div>
                 </>
               )}
             </div>
           )}
        </div>

        {/* Drawer Footer (Actions) */}
        <div className="p-6 md:p-8 border-t border-divider bg-background flex gap-4">
           {step > 1 && (
              <Button variant="secondary" onClick={handleBack} className="flex-[0.4] cursor-pointer flex items-center justify-center gap-2 px-0 shadow-sm" disabled={isLoading}>
                 <ArrowLeft size={18} />
                 Back
              </Button>
           )}
           
           {step === 1 && (
             <Button variant="primary" onClick={handleNext} className="flex-1 py-3.5 text-base cursor-pointer flex items-center justify-center gap-2 shadow-premium" disabled={!title || !handle}>
                Continue
                <ChevronRight size={20} />
             </Button>
           )}

           {step === 2 && (
             <Button variant="primary" onClick={handleCreate} className="flex-1 py-3.5 text-base cursor-pointer flex items-center justify-center shadow-premium" disabled={isLoading || (isProjectPortal && (!clientName || !clientEmail))}>
               {isLoading ? <Loader2 className="animate-spin" size={20} /> : "Finalize & Launch Editor"}
             </Button>
           )}
        </div>
      </div>
    </div>
  );
}
