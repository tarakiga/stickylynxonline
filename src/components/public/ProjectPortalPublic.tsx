"use client";
import * as React from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { StepProgress } from "@/components/ui/Progress";
import { Clock, FileText, Send, CheckCircle2, QrCode, Calendar, ExternalLink, ImageIcon, AlignLeft, Link as LinkIcon, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AttachmentCard } from "@/components/ui/AttachmentCard";
import { Modal } from "@/components/ui/Modal";
import { TASK_STATUS_META } from "@/types/editor";
import type { Task, TaskStatus, Deliverable, DeliverableType, MilestoneWithReviews } from "@/types/editor";

function ensureProtocol(url: string): string {
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/")) return url;
  return `https://${url}`;
}

/* ─── Public Task Card ──────────────────────────────────────── */
function PublicTaskCard({ task, pageHandle }: { task: Task & { stageLabel: string }; pageHandle: string }) {
  const [expanded, setExpanded] = React.useState(false);
  const [draft, setDraft] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [approving, setApproving] = React.useState(false);
  const [showApproveConfirm, setShowApproveConfirm] = React.useState(false);
  const [localComments, setLocalComments] = React.useState(task.comments || []);
  const [localStatus, setLocalStatus] = React.useState(task.status);
  const meta = TASK_STATUS_META[localStatus] || TASK_STATUS_META.todo;
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && localStatus !== "done";
  const hasSubmission = !!task.submission;
  const canApprove = hasSubmission && localStatus !== "done";

  async function handleSendComment() {
    if (!draft.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch(`/api/comments/${pageHandle}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId: task.id, stageId: task.stageId, text: draft.trim(), author: "Client" }),
      });
      if (res.ok) {
        setLocalComments((prev) => [...prev, { id: `local-${Date.now()}`, taskId: task.id, author: "Client", text: draft.trim(), timestamp: new Date().toLocaleString() }]);
        setDraft("");
      }
    } finally {
      setSending(false);
    }
  }

  async function handleApprove() {
    setApproving(true);
    try {
      const res = await fetch(`/api/tasks/${pageHandle}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId: task.id, stageId: task.stageId, action: "approve" }),
      });
      if (res.ok) setLocalStatus("done");
    } finally {
      setApproving(false);
      setShowApproveConfirm(false);
    }
  }

  return (
    <>
      <div className="bg-surface border border-divider rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={meta.variant} className="text-[10px]">{meta.label}</Badge>
              <Badge variant="primary" className="text-[9px] px-1.5 py-0">{task.stageLabel}</Badge>
              {task.dueDate && (
                <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md ${isOverdue ? "bg-error/10 text-error" : "bg-divider text-text-secondary"}`}>
                  <Calendar className="w-3 h-3" />
                  {new Date(task.dueDate).toLocaleDateString()}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {hasSubmission && localStatus !== "done" && <Badge variant="success" className="text-[9px]">Submitted</Badge>}
              {localStatus === "done" && <Badge variant="success" className="text-[9px]">Approved</Badge>}
              {hasSubmission && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="inline-flex items-center gap-1 text-[10px] text-text-secondary font-semibold bg-transparent border-none cursor-pointer hover:text-primary transition-colors p-0"
                >
                  <MessageSquare className="w-3 h-3" />
                  {localComments?.length > 0 ? localComments.length : "Comment"}
                </button>
              )}
            </div>
          </div>
          <h4 className={`font-bold text-sm text-text-primary ${localStatus === "done" ? "line-through opacity-60" : ""}`}>{task.title}</h4>
          {task.description && <p className="text-xs text-text-secondary mt-1 leading-relaxed">{task.description}</p>}

          {/* Submission display using AttachmentCard from design library */}
          {hasSubmission && (
            <AttachmentCard type={task.submission!.type} value={task.submission!.value} className="mt-3" />
          )}

          {/* Approve button */}
          {canApprove && (
            <div className="mt-3">
              <Button
                variant="primary"
                onClick={() => setShowApproveConfirm(true)}
                className="text-[10px] py-1.5 px-3 rounded-lg h-auto cursor-pointer border-none text-white shadow-sm"
              >
                <CheckCircle2 className="w-3 h-3 mr-1" /> Approve Task
              </Button>
            </div>
          )}
        </div>

        {/* Expandable: comments + compose */}
        {expanded && hasSubmission && (
          <div className="border-t border-divider bg-background/50 p-4 space-y-3 animate-in fade-in slide-in-from-top-1 duration-150">
            {localComments.length > 0 && (
              <div className="space-y-2">
                {localComments.map((c) => (
                  <div key={c.id} className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-divider flex items-center justify-center text-text-primary font-bold text-[8px] shrink-0 mt-0.5">
                      {c.author.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-text-primary">{c.author}</span>
                        <span className="text-[9px] text-text-secondary">{c.timestamp}</span>
                      </div>
                      <p className="text-xs text-text-secondary leading-relaxed">{c.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                className="flex-1 input-base px-3 py-2 text-xs rounded-lg bg-background placeholder:text-text-secondary/50"
                placeholder={`Leave a comment on “${task.title}”…`}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleSendComment(); } }}
              />
              <Button
                variant="primary"
                disabled={!draft.trim() || sending}
                onClick={handleSendComment}
                className="text-[10px] py-2 px-3 rounded-lg h-auto cursor-pointer border-none text-white shrink-0"
              >
                <Send size={12} />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Approve confirmation modal */}
      <Modal isOpen={showApproveConfirm} onClose={() => setShowApproveConfirm(false)} title="Approve Task" description={`Mark "${task.title}" as complete? This confirms the work meets your expectations.`} icon="success">
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={() => setShowApproveConfirm(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleApprove} disabled={approving}>
            {approving ? "Approving…" : "Approve"}
          </Button>
        </div>
      </Modal>
    </>
  );
}

export function ProjectPortalPublic({ page }: { page: any }) {
  const blocks = page.blocks || [];
  const headerContent = blocks.find((b: any) => b.type === "PROJECT_HEADER")?.content || {};
  const statusContent = blocks.find((b: any) => b.type === "STATUS_SUMMARY")?.content || {};
  const timelineContent = blocks.find((b: any) => b.type === "TIMELINE")?.content || {};
  const deliverablesContent = blocks.find((b: any) => b.type === "DELIVERABLES")?.content || {};

  const milestones: MilestoneWithReviews[] = (timelineContent.milestones || []).map((m: MilestoneWithReviews) => ({
    ...m, reviews: m.reviews || [], comments: m.comments || [], tasks: m.tasks || [],
  }));
  const currentStep: number = timelineContent.currentStep || 1;
  const deliverables: Deliverable[] = deliverablesContent.items || [];
  const allTasks: (Task & { stageLabel: string })[] = milestones.flatMap((m) =>
    m.tasks.map((t) => ({ ...t, stageLabel: m.label }))
  );

  return (
    <div className="max-w-screen-md mx-auto min-h-screen bg-background text-text-primary px-4 py-8 pb-32 flex flex-col gap-6 animate-in fade-in duration-700">
      
      {/* 1. Brand / Identity Header */}
      <header className="flex flex-col items-center text-center gap-2 mb-4">
         <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-2xl border border-primary/20 shadow-sm">
            {(headerContent.title || page.title || "P").substring(0,1).toUpperCase()}
         </div>
         <h1 className="text-2xl font-bold tracking-tight text-text-primary mt-2">{headerContent.title || page.title || "Project Portal"}</h1>
         <p className="text-text-secondary text-sm font-semibold tracking-wide uppercase">Client Portal • <span className="text-primary">{headerContent.clientName || "Protected Account"}</span></p>
      </header>

      {/* 2. Hero Status Card (Section 5.1 in PRD) */}
      <Card className="rounded-[2.5rem] border border-divider shadow-premium p-8 bg-surface space-y-6 overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <QrCode size={80} />
          </div>
          <div>
            <div className="inline-flex items-center gap-2 bg-success/10 text-success text-xs font-bold px-3 py-1.5 rounded-full border border-success/20 mb-4 whitespace-nowrap shadow-sm">
               <div className="w-2 h-2 rounded-full bg-current animate-pulse"></div>
               Live Updates
            </div>
            <h2 className="text-2xl font-bold leading-tight text-text-primary">Project Roadmap</h2>
            <p className="text-text-secondary text-sm font-semibold mt-1 flex items-center gap-2"><Clock size={14} className="text-primary"/> Last updated: Just now</p>
          </div>

          <div className="bg-background/80 backdrop-blur-sm border border-divider rounded-3xl p-6 shadow-small">
              <p className="text-lg font-bold text-text-primary leading-relaxed opacity-90 italic">
                "{statusContent.text || "Currently preparing the project vision and discovery documents."}"
              </p>
          </div>

          <div className="pt-4 overflow-x-auto pb-2 scrollbar-hide">
              <StepProgress steps={milestones.map((m) => ({ ...m, badgeCount: m.tasks.filter((t) => t.status === "review").length }))} currentStep={currentStep} />
          </div>
      </Card>

      {/* Tasks by Stage */}
      {allTasks.length > 0 && (
        <section className="space-y-4">
          <h3 className="font-bold text-lg px-2 flex items-center justify-between">
            <span>Project Tasks</span>
            <span className="text-xs text-text-secondary font-semibold">{allTasks.filter((t) => t.status === "done").length}/{allTasks.length} Complete</span>
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {allTasks.map((task) => (
              <PublicTaskCard key={task.id} task={task} pageHandle={page.handle} />
            ))}
          </div>
        </section>
      )}

      {/* 3. Deliverables / Action Center */}
      {deliverables.length > 0 && (
        <section className="space-y-4">
          <h3 className="font-bold text-lg px-2 flex items-center justify-between">
            <span>Key Deliverables</span>
            <span className="text-xs text-text-secondary font-semibold">{deliverables.length} Items</span>
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {deliverables.map((item, i) => {
              const dtype: DeliverableType = (item.type && ["file","image","url","text"].includes(item.type)) ? item.type : "file";
              const iconMap: Record<DeliverableType, React.ReactNode> = {
                file: <FileText size={18} />, image: <ImageIcon size={18} />,
                url: <LinkIcon size={18} />, text: <AlignLeft size={18} />,
              };
              const colorMap: Record<DeliverableType, string> = {
                file: "bg-info/10 text-info", image: "bg-secondary/10 text-secondary",
                url: "bg-primary/10 text-primary", text: "bg-warning/10 text-warning",
              };
              return (
                <div key={item.id || i} className="bg-surface border border-divider p-4 rounded-2xl flex items-center justify-between group hover:border-primary/50 transition-colors shadow-sm">
                   <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ring-1 ring-divider shrink-0 ${colorMap[dtype]}`}>
                          {iconMap[dtype]}
                      </div>
                      <div className="flex-1 min-w-0">
                         <h4 className="font-bold text-sm text-text-primary truncate">{item.title}</h4>
                         <p className="text-xs text-text-secondary font-medium truncate">{item.description || ""}</p>
                      </div>
                   </div>
                   {dtype === "url" && item.value && (
                     <a href={ensureProtocol(item.value)} target="_blank" rel="noopener noreferrer" className="bg-background p-2 rounded-lg text-text-secondary hover:text-primary transition-colors shrink-0">
                       <ExternalLink size={16} />
                     </a>
                   )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Commercials Tip / Secure Area */}
      <div className="bg-secondary/5 border border-secondary/10 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 group">
          <div className="flex items-center gap-4 text-center sm:text-left">
             <div className="w-12 h-12 rounded-full bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                <CheckCircle2 size={24} />
             </div>
             <div>
                <h4 className="font-bold text-sm text-text-primary mb-0.5">Commercials & Billing</h4>
                <p className="text-xs text-text-secondary">Project deposit has been securely cleared via Paystack.</p>
             </div>
          </div>
          <Button variant="outline" className="text-xs py-2 px-6 rounded-xl font-bold h-auto shadow-sm cursor-pointer hover:bg-secondary hover:text-white transition-all">View Invoices</Button>
      </div>

      {/* 4. Feedback Fly-in (Section 5.2 in PRD) */}
      <section className="mt-4">
          <div className="bg-surface border border-divider p-8 rounded-[2.5rem] shadow-premium space-y-6">
              <div className="space-y-1">
                 <h3 className="font-bold text-xl text-text-primary">Share Feedback</h3>
                 <p className="text-sm text-text-secondary font-medium leading-relaxed">Leave comments, request changes, or simply say hi. All feedback is logged immediately.</p>
              </div>

              <div className="space-y-4">
                 <textarea 
                   className="w-full bg-background border border-divider rounded-3xl p-6 min-h-[140px] resize-none outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/5 transition-all text-text-primary text-base placeholder:opacity-50"
                   placeholder="Your feedback or questions..."
                 />
                 <div className="flex justify-end">
                    <Button variant="primary" className="py-3 px-8 rounded-2xl flex items-center gap-2 font-bold shadow-premium bg-primary text-white hover:opacity-90 active:scale-95 transition-all cursor-pointer border-none">
                       <Send size={18} />
                       Submit Feedback
                    </Button>
                 </div>
              </div>
          </div>
      </section>

      {/* Public Footer */}
      <footer className="text-center pt-8 pb-4">
         <p className="text-xs text-text-secondary font-bold tracking-[0.2em] uppercase opacity-50">Powered by Stickylynx</p>
      </footer>

      {/* Sticky Bottom Action Bar (Section 5.3 in PRD) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-sm z-50 animate-in slide-in-from-bottom-8 duration-500 delay-300">
         <div className="bg-surface/90 backdrop-blur-xl border border-white/20 rounded-3xl p-3 flex items-center justify-between shadow-premium ring-1 ring-black/5">
            <div className="flex items-center gap-3 pl-2">
               <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-lg shadow-sm">L</div>
               <div>
                  <h4 className="font-bold text-xs text-text-primary leading-tight">Stickylynx</h4>
                  <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest leading-none">Create yours free</p>
               </div>
            </div>
            <Button variant="primary" className="py-2 px-5 rounded-2xl text-xs font-bold shadow-sm cursor-pointer border-none text-white whitespace-nowrap">Join Waitlist</Button>
         </div>
      </div>

    </div>
  );
}
