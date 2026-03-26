"use client";
import * as React from "react";
import { Card } from "@/components/ui/Card";
import { StepProgress } from "@/components/ui/Progress";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { TaskCard } from "@/components/editor/TaskCard";
import { DeliverableCard } from "@/components/editor/DeliverableCard";
import type { MilestoneWithReviews, Task, TaskStatus, Deliverable, DeliverableType } from "@/types/editor";
import { DELIVERABLE_TYPE_OPTIONS } from "@/types/editor";
import { Dropzone } from "@/components/ui/Dropzone";
import { CheckCircle2, Clock, FileText, MessageSquare, AlertCircle, Plus, Save, Loader2, Eye, UploadCloud, Link as LinkIcon, AlignLeft } from "lucide-react";

/* ─── ID helper ──────────────────────────────────────────────── */
let _seq = 0;
function uid() { return `item-${Date.now()}-${++_seq}` }

/* ─── Component ──────────────────────────────────────────────── */
export function ProjectPortalEditor({ page }: { page: any }) {
  const blocks = page.blocks || [];

  // Extract data from blocks
  const headerContent = blocks.find((b: any) => b.type === "PROJECT_HEADER")?.content || {};
  const statusContent = blocks.find((b: any) => b.type === "STATUS_SUMMARY")?.content || {};
  const timelineContent = blocks.find((b: any) => b.type === "TIMELINE")?.content || {};
  const taskBoardContent = blocks.find((b: any) => b.type === "TASK_BOARD")?.content || {};
  const deliverablesContent = blocks.find((b: any) => b.type === "DELIVERABLES")?.content || {};

  const [clientName, setClientName] = React.useState<string>(headerContent.clientName || "Your Client");
  const [clientEmail, setClientEmail] = React.useState<string>(page.clientEmail || "");

  /* ── Save state ────────────────────────────────────────────── */
  const [saving, setSaving] = React.useState(false);
  const [lastSaved, setLastSaved] = React.useState<string | null>(null);
  const [dirty, setDirty] = React.useState(false);

  // Mark dirty whenever state changes after initial load
  const markDirty = React.useCallback(() => setDirty(true), []);

  /* ── Milestones state (with reviews + comments + tasks) ──── */
  const [milestones, setMilestones] = React.useState<MilestoneWithReviews[]>(
    (timelineContent.milestones || [
      { id: "1", label: "Discovery" },
      { id: "2", label: "Wireframes" },
      { id: "3", label: "Visual" },
      { id: "4", label: "Development" },
      { id: "5", label: "Launch" },
    ]).map((m: MilestoneWithReviews) => ({
      ...m,
      reviews: m.reviews || [],
      comments: m.comments || [],
      tasks: m.tasks || [],
    }))
  );
  const [currentStep, setCurrentStep] = React.useState<number>(timelineContent.currentStep || 1);
  const [showMilestoneModal, setShowMilestoneModal] = React.useState(false);
  const [newMilestoneLabel, setNewMilestoneLabel] = React.useState("");

  /* ── Status note ─────────────────────────────────────────── */
  const [statusOverride, setStatusOverride] = React.useState<string | null>(statusContent.manualText || null);
  const [editingStatus, setEditingStatus] = React.useState(false);

  /* ── Viewed stage for task section (defaults to current step) ── */
  const [viewedStageIndex, setViewedStageIndex] = React.useState(currentStep - 1);
  // Sync when current step changes
  React.useEffect(() => { setViewedStageIndex(currentStep - 1); }, [currentStep]);
  const viewedMilestone = milestones[viewedStageIndex] || milestones[0];
  const viewedTasks: Task[] = viewedMilestone?.tasks || [];

  /* ── Add Task modal state ─────────────────────────────────── */
  const [showAddTask, setShowAddTask] = React.useState(false);
  const [newTaskTitle, setNewTaskTitle] = React.useState("");
  const [newTaskDesc, setNewTaskDesc] = React.useState("");
  const [newTaskDueDate, setNewTaskDueDate] = React.useState("");

  /* ── Submit Work modal state ──────────────────────────────── */
  const [submitTaskId, setSubmitTaskId] = React.useState<string | null>(null);
  const [submitType, setSubmitType] = React.useState<DeliverableType>("url");
  const [submitValue, setSubmitValue] = React.useState("");
  const [submitFile, setSubmitFile] = React.useState<File | null>(null);

  /* ── Deliverables state ──────────────────────────────────── */
  const [deliverables, setDeliverables] = React.useState<Deliverable[]>(deliverablesContent.items || []);
  const [showAddDeliverable, setShowAddDeliverable] = React.useState(false);
  const [newDelType, setNewDelType] = React.useState<DeliverableType>("file");
  const [newDelTitle, setNewDelTitle] = React.useState("");
  const [newDelDesc, setNewDelDesc] = React.useState("");
  const [newDelValue, setNewDelValue] = React.useState("");
  const SHOW_INVOICING = process.env.NEXT_PUBLIC_SHOW_INVOICING === "true";

  /* ── Edit Task modal state ────────────────────────────────── */
  const [editingTask, setEditingTask] = React.useState<Task | null>(null);
  const [editTaskTitle, setEditTaskTitle] = React.useState("");
  const [editTaskDesc, setEditTaskDesc] = React.useState("");
  const [editTaskDueDate, setEditTaskDueDate] = React.useState("");

  /* ── Delete confirm state (milestones) ────────────────────── */
  const [milestoneToDelete, setMilestoneToDelete] = React.useState<string | null>(null);

  


  /* SAVE */
  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = [
        { type: "PROJECT_HEADER", content: { ...headerContent, clientName }, order: 0 },
        { type: "STATUS_SUMMARY", content: { text: statusNote, manualText: statusOverride }, order: 1 },
        { type: "TIMELINE", content: { milestones, currentStep }, order: 2 },
        { type: "DELIVERABLES", content: { items: deliverables }, order: 3 },
      ];
      const res = await fetch(`/api/editor/${page.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blocks: payload, clientEmail }),
      });
      if (res.ok) {
        setLastSaved(new Date().toLocaleTimeString());
        setDirty(false);
      }
    } finally {
      setSaving(false);
    }
  };

  /* ── Handlers: View Public ───────────────────────────────── */
  const handleViewPublic = () => window.open(`/${page.handle}`, "_blank");

  /* ── Handlers: Milestones ────────────────────────────────── */
  const handleAddMilestone = () => {
    if (!newMilestoneLabel.trim()) return;
    setMilestones((prev) => [...prev, { id: uid(), label: newMilestoneLabel.trim(), reviews: [], comments: [], tasks: [] }]);
    setNewMilestoneLabel("");
    markDirty();
  };
  const handleRemoveMilestone = (id: string) => {
    setMilestones((prev) => prev.filter((m) => m.id !== id));
    if (currentStep > milestones.length - 1) setCurrentStep(Math.max(1, milestones.length - 1));
    markDirty();
  };
  const handleAdvanceStep = () => { setCurrentStep((s) => Math.min(s + 1, milestones.length)); markDirty(); };
  const handleRegressStep = () => { setCurrentStep((s) => Math.max(s - 1, 1)); markDirty(); };

  const handleStageUpdate = (updated: MilestoneWithReviews) => {
    setMilestones((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
    markDirty();
  };

  /* ── Helpers: update tasks within a milestone ───────────── */
  const updateStageTasks = (stageId: string, updater: (tasks: Task[]) => Task[]) => {
    setMilestones((prev) => prev.map((m) => m.id === stageId ? { ...m, tasks: updater(m.tasks) } : m));
    markDirty();
  };

  /* ── Handlers: Tasks (stage-scoped) ─────────────────────── */
  const handleAddTask = () => {
    if (!newTaskTitle.trim() || !viewedMilestone) return;
    const task: Task = {
      id: uid(), stageId: viewedMilestone.id, title: newTaskTitle.trim(),
      description: newTaskDesc.trim(), dueDate: newTaskDueDate || null,
      status: "todo", submission: null, comments: [],
    };
    updateStageTasks(viewedMilestone.id, (prev) => [...prev, task]);
    setNewTaskTitle(""); setNewTaskDesc(""); setNewTaskDueDate(""); setShowAddTask(false);
  };
  const handleDeleteTask = (id: string) => {
    if (!viewedMilestone) return;
    updateStageTasks(viewedMilestone.id, (prev) => prev.filter((t) => t.id !== id));
  };
  const handleTaskStatusChange = (id: string, status: TaskStatus) => {
    if (!viewedMilestone) return;
    updateStageTasks(viewedMilestone.id, (prev) => prev.map((t) => t.id === id ? { ...t, status } : t));
  };
  const handleTaskAddComment = (id: string, text: string) => {
    if (!viewedMilestone) return;
    updateStageTasks(viewedMilestone.id, (prev) => prev.map((t) =>
      t.id === id ? { ...t, comments: [...t.comments, { id: uid(), taskId: id, author: "You", text, timestamp: new Date().toLocaleString() }] } : t
    ));
  };
  const handleSubmitWork = async () => {
    if (!submitTaskId || !viewedMilestone) return;
    setSaving(true);
    let value: string;
    if ((submitType === "file" || submitType === "image") && submitFile) {
      // Convert file to data URL so it's viewable/downloadable on the frontend
      value = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(submitFile);
      });
    } else {
      value = submitValue.trim();
    }
    if (!value) { setSaving(false); return; }

    const submission = { type: submitType, value, submittedAt: new Date().toISOString() };

    try {
      const res = await fetch(`/api/tasks/${page.handle}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId: submitTaskId, stageId: viewedMilestone.id, submission }),
      });

      if (res.ok) {
        updateStageTasks(viewedMilestone.id, (prev) => prev.map((t) =>
          t.id === submitTaskId
            ? { ...t, submission, status: "review" as TaskStatus }
            : t
        ));
        setLastSaved(new Date().toLocaleTimeString());
        setDirty(false);
      } else {
        alert("Failed to notify client and save submission.");
      }
    } finally {
      setSubmitTaskId(null); setSubmitValue(""); setSubmitFile(null); setSubmitType("url");
      setSaving(false);
    }
  };
  const handleEditTask = (id: string) => {
    const t = viewedTasks.find((t) => t.id === id);
    if (!t) return;
    setEditingTask(t); setEditTaskTitle(t.title); setEditTaskDesc(t.description); setEditTaskDueDate(t.dueDate || "");
  };
  const handleSaveEditTask = () => {
    if (!editingTask || !viewedMilestone) return;
    updateStageTasks(viewedMilestone.id, (prev) => prev.map((t) =>
      t.id === editingTask.id ? { ...t, title: editTaskTitle.trim() || t.title, description: editTaskDesc.trim(), dueDate: editTaskDueDate || null } : t
    ));
    setEditingTask(null);
  };

  /* ── Handlers: Deliverables (typed) ─────────────────────── */
  const handleAddDeliverable = () => {
    if (!newDelTitle.trim()) return;
    const d: Deliverable = { id: uid(), type: newDelType, title: newDelTitle.trim(), description: newDelDesc.trim(), value: newDelValue.trim() };
    setDeliverables((prev) => [...prev, d]);
    setNewDelType("file"); setNewDelTitle(""); setNewDelDesc(""); setNewDelValue(""); setShowAddDeliverable(false); markDirty();
  };
  const handleDeleteDeliverable = (id: string) => { setDeliverables((prev) => prev.filter((d) => d.id !== id)); markDirty(); };

  /* ── Derived ────────────────────────────────────────────── */
  type FeedComment = { id: string; taskId: string; author: string; text: string; timestamp: string; stageId: string; stageLabel: string };
  const taskComments: FeedComment[] = milestones.flatMap((m) =>
    (m.tasks || []).flatMap((t) =>
      (t.comments || []).map((c) => ({ ...c, stageId: m.id, stageLabel: m.label, taskId: t.id }))
    )
  );
  const pendingCommentCount = taskComments.length;
  const totalReviewCount = milestones.flatMap((m) => m.tasks || []).filter((t) => t.status === "review").length;

  // Badge counts for StepProgress (include task counts)
  const stepsWithBadges = milestones.map((m) => {
    const commentCount = (m.tasks || []).reduce((sum, t) => sum + ((t.comments || []).length), 0);
    const inReview = (m.tasks || []).filter((t) => t.status === "review").length;
    return { ...m, badgeCount: commentCount + inReview };
  });
  const totalTaskCount = milestones.reduce((sum, m) => sum + m.tasks.length, 0);

  // Auto-generated status note from project state
  const autoStatusNote = React.useMemo(() => {
    const stage = milestones[currentStep - 1];
    if (!stage) return "Setting up the project.";
    const allTasks = milestones.flatMap((m) => m.tasks);
    const done = allTasks.filter((t) => t.status === "done").length;
    const inReview = allTasks.filter((t) => t.status === "review").length;
    const inProgress = allTasks.filter((t) => t.status === "in_progress").length;
    const pending = allTasks.filter((t) => t.status === "todo").length;
    const unresolvedComments = milestones.flatMap((m) => m.comments).filter((c) => !c.resolved).length;

    const parts: string[] = [];
    parts.push(`Currently in the ${stage.label} stage.`);
    if (totalTaskCount > 0) {
      const pcs: string[] = [];
      if (done > 0) pcs.push(`${done} done`);
      if (inProgress > 0) pcs.push(`${inProgress} in progress`);
      if (inReview > 0) pcs.push(`${inReview} awaiting review`);
      if (pending > 0) pcs.push(`${pending} to do`);
      parts.push(`Tasks: ${pcs.join(", ")}.`);
    }
    if (unresolvedComments > 0) parts.push(`${unresolvedComments} unresolved comment${unresolvedComments > 1 ? "s" : ""}.`);
    return parts.join(" ");
  }, [milestones, currentStep, totalTaskCount]);

  const statusNote = statusOverride ?? autoStatusNote;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-16">

       {/* Editor Workspace Controls */}
       <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
         <div className="flex items-center gap-2 text-primary text-sm font-semibold">
           <AlertCircle size={18} />
           <span>Edit Mode</span>
           {lastSaved && <span className="text-text-secondary font-normal">· Saved at {lastSaved}</span>}
           {dirty && !saving && <span className="text-warning font-normal">· Unsaved changes</span>}
         </div>
         <div className="flex items-center gap-2">
           <Button variant="secondary" onClick={handleViewPublic} className="py-2 px-4 shadow-sm text-xs rounded-xl cursor-pointer whitespace-nowrap">
             <Eye size={14} className="mr-1.5" /> Preview
           </Button>
           <Button variant="primary" onClick={handleSave} disabled={saving || !dirty} className="py-2 px-5 shadow-sm text-sm rounded-xl cursor-pointer border-none text-white whitespace-nowrap">
             {saving ? <><Loader2 size={14} className="mr-1.5 animate-spin" /> Saving…</> : <><Save size={14} className="mr-1.5" /> Save Changes</>}
           </Button>
         </div>
       </div>

       {/* 1. Project Header & Status */}
       <Card className="rounded-3xl border border-divider shadow-premium bg-surface p-0 overflow-hidden relative">
         <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-secondary to-accent"></div>
         <div className="p-6 sm:p-8">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 pt-2">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">{headerContent.title || page.title || "Project Portal"}</h2>
                  <p className="text-text-secondary font-semibold mt-1">For <span className="text-primary">{clientName}</span></p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="success" pulse className="shadow-sm text-sm py-2 px-4">In Progress</Badge>
                  {totalReviewCount > 0 && <Badge variant="primary">{totalReviewCount} Review{totalReviewCount !== 1 ? "s" : ""}</Badge>}
                </div>
             </div>

             <div className="bg-background border border-divider rounded-2xl p-4 sm:p-6 mb-10 shadow-sm group hover:border-primary/30 transition-colors">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 gap-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-xs tracking-widest text-text-secondary uppercase">Current Status</h4>
                      {!statusOverride && <Badge variant="primary" className="text-[9px] px-1.5 py-0">Auto</Badge>}
                    </div>
                    <div className="flex items-center gap-2">
                      {statusOverride && (
                        <Button variant="ghost" onClick={() => { setStatusOverride(null); setEditingStatus(false); markDirty(); }} className="text-[10px] py-1 px-2 rounded-md h-auto cursor-pointer">
                          Reset to Auto
                        </Button>
                      )}
                      {!editingStatus && (
                        <Button variant="ghost" onClick={() => setEditingStatus(true)} className="text-[10px] py-1 px-2 rounded-md h-auto cursor-pointer">
                          Edit
                        </Button>
                      )}
                    </div>
                </div>
                {editingStatus ? (
                  <div className="space-y-2">
                    <Textarea
                       className="bg-transparent border border-divider shadow-none text-text-primary text-lg sm:text-xl font-bold leading-relaxed placeholder:text-text-secondary/50 focus:text-primary focus:ring-primary-light"
                       rows={2}
                       placeholder="Write a custom status update..."
                       defaultValue={statusNote}
                       onBlur={(e) => {
                         const val = e.target.value.trim();
                         if (val && val !== autoStatusNote) { setStatusOverride(val); markDirty(); }
                         else { setStatusOverride(null); }
                         setEditingStatus(false);
                       }}
                       autoFocus
                    />
                    <p className="text-[10px] text-text-secondary">Press Tab or click away to save. Leave empty to revert to auto-generated status.</p>
                  </div>
                ) : (
                  <p className="text-text-primary text-lg sm:text-xl font-bold leading-relaxed cursor-pointer" onClick={() => setEditingStatus(true)}>
                    {statusNote}
                  </p>
                )}
             </div>

             {/* Timeline & Milestones — click a stage to open the review drawer */}
             <div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
                   <div>
                     <h3 className="font-bold text-xl text-text-primary tracking-tight">Timeline & Milestones</h3>
                     <p className="text-xs text-text-secondary mt-0.5">Click a stage to submit work or view feedback</p>
                   </div>
                   <div className="flex items-center gap-2">
                     <Button variant="ghost" onClick={handleRegressStep} disabled={currentStep <= 1} className="text-xs py-1.5 px-3 rounded-lg h-auto cursor-pointer">← Back</Button>
                     <Button variant="outline" onClick={() => setShowMilestoneModal(true)} className="text-xs py-1.5 px-3 rounded-lg h-auto shadow-sm cursor-pointer">Edit Stages</Button>
                     <Button variant="ghost" onClick={handleAdvanceStep} disabled={currentStep >= milestones.length} className="text-xs py-1.5 px-3 rounded-lg h-auto cursor-pointer">Next →</Button>
                   </div>
                </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <span className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">Client Name</span>
                  <Input
                    placeholder="Client or Company"
                    value={clientName}
                    onChange={(e) => { setClientName(e.target.value); markDirty(); }}
                    className="mt-1"
                  />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">Client Email</span>
                  <Input
                    type="email"
                    placeholder="client@company.com"
                    value={clientEmail}
                    onChange={(e) => { setClientEmail(e.target.value); setDirty(true); }}
                    className="mt-1"
                  />
                </div>
              </div>
                <div className="mb-4">
                    <StepProgress
                      steps={stepsWithBadges}
                      currentStep={currentStep}
                      onStepClick={(index) => setViewedStageIndex(index)}
                    />
                </div>
             </div>
         </div>
       </Card>

       {/* ── Stage-scoped Tasks ── */}
       <div className="space-y-4">
         <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-surface border border-divider p-4 rounded-2xl shadow-sm gap-3">
            <div className="flex items-center gap-3">
              <h3 className="font-bold text-lg text-text-primary tracking-tight">Tasks & Action Items</h3>
              <Badge variant="primary" className="text-[10px]">{viewedMilestone?.label}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Select
                options={milestones.map((m, i) => ({ label: `${i+1}. ${m.label}`, value: String(i) }))}
                value={String(viewedStageIndex)}
                onChange={(e) => setViewedStageIndex(Number(e.target.value))}
                className="text-xs"
              />
              <Button variant="ghost" onClick={() => setShowAddTask(true)} className="text-primary text-xs font-bold py-1.5 px-3 rounded-lg h-auto hover:bg-primary/5 transition-colors cursor-pointer border border-primary/20 whitespace-nowrap">
                <Plus size={14} className="mr-1" /> Add Task
              </Button>
            </div>
         </div>

         {viewedTasks.length === 0 ? (
           <div className="bg-surface border-2 border-dashed border-divider rounded-xl p-8 text-center">
             <FileText size={32} className="text-text-secondary mx-auto mb-3 opacity-30" />
             <p className="text-sm text-text-secondary font-semibold">No tasks in &ldquo;{viewedMilestone?.label}&rdquo; yet.</p>
             <p className="text-xs text-text-secondary mt-1">Add a task to start tracking work for this stage.</p>
           </div>
         ) : (
           <div className="space-y-3">
             {viewedTasks.map((task) => (
               <TaskCard
                 key={task.id}
                 task={task}
                 onStatusChange={handleTaskStatusChange}
                 onDelete={handleDeleteTask}
                 onSubmit={(id) => { setSubmitTaskId(id); setSubmitType("url"); setSubmitValue(""); }}
                 onEdit={handleEditTask}
               />
             ))}
           </div>
         )}
       </div>

       {/* ── Typed Deliverables ── */}
       <div className="space-y-4">
         <div className="flex items-center justify-between bg-surface border border-divider p-4 rounded-2xl shadow-sm">
            <h3 className="font-bold text-lg text-text-primary tracking-tight">Key Deliverables</h3>
            <Button variant="ghost" onClick={() => setShowAddDeliverable(true)} className="text-primary text-xs font-bold py-1.5 px-3 rounded-lg h-auto hover:bg-primary/5 transition-colors cursor-pointer border border-primary/20">
              <Plus size={14} className="mr-1" /> Add Deliverable
            </Button>
         </div>

         {deliverables.length === 0 ? (
           <div className="bg-surface border-2 border-dashed border-divider rounded-xl p-8 text-center">
             <UploadCloud size={32} className="text-text-secondary mx-auto mb-3 opacity-30" />
             <p className="text-sm text-text-secondary font-semibold">No deliverables defined yet.</p>
             <p className="text-xs text-text-secondary mt-1">Define what you expect from the client (files, images, URLs, or text).</p>
           </div>
         ) : (
           <div className="space-y-3">
             {deliverables.map((d) => (
               <DeliverableCard key={d.id} deliverable={d} onDelete={handleDeleteDeliverable} />
             ))}
           </div>
         )}

        {SHOW_INVOICING && (
          <div className="bg-surface border border-divider rounded-xl p-5 shadow-sm flex items-center justify-between group hover:border-primary/30 transition-colors">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-info/10 text-info flex items-center justify-center shrink-0"><FileText size={20} /></div>
                <div>
                   <h4 className="font-bold text-sm text-text-primary mb-0.5">Deposit Invoice</h4>
                   <Badge variant="success" className="text-[10px] px-2 py-0.5 rounded-md">PAID</Badge>
                </div>
             </div>
             <Button variant="secondary" onClick={() => window.alert("Invoice management coming soon.")} className="text-xs py-2 px-4 rounded-xl shadow-sm cursor-pointer outline-none">Manage</Button>
          </div>
        )}
       </div>

       {/* ── Activity Timeline (stage-linked feedback) ───────── */}
       <Card className="rounded-3xl border border-divider shadow-sm bg-surface p-0 flex flex-col md:flex-row overflow-hidden">
          <div className="p-6 sm:p-8 md:w-1/3 border-b md:border-b-0 md:border-r border-divider bg-background/50 flex flex-col justify-between">
             <div>
                 <div className="flex items-center gap-3 mb-4">
                     <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center"><MessageSquare size={20} /></div>
                     <h3 className="font-bold text-xl text-text-primary tracking-tight">Activity Feed</h3>
                 </div>
                 <p className="text-sm text-text-secondary leading-relaxed">All comments and reviews across every stage. Each item is automatically linked to its milestone.</p>
             </div>
             <div className="mt-8 hidden md:block space-y-3">
                 <div className="bg-surface border border-divider p-4 rounded-xl text-center shadow-sm">
                   <p className="text-3xl font-bold text-text-primary">{pendingCommentCount}</p>
                   <p className="text-xs font-bold tracking-widest text-text-secondary uppercase mt-1">Comments</p>
                 </div>
                 <div className="bg-surface border border-divider p-4 rounded-xl text-center shadow-sm">
                   <p className="text-3xl font-bold text-primary">{totalReviewCount}</p>
                   <p className="text-xs font-bold tracking-widest text-text-secondary uppercase mt-1">Awaiting Review</p>
                 </div>
             </div>
          </div>

          <div className="p-6 sm:p-8 md:w-2/3 flex flex-col justify-between">
             <div className="space-y-3 mb-8 max-h-[420px] overflow-y-auto custom-scrollbar pr-2">
                 {taskComments.length === 0 && (
                   <div className="text-center py-8">
                     <MessageSquare size={32} className="text-text-secondary mx-auto mb-3 opacity-30" />
                     <p className="text-sm text-text-secondary font-semibold">No activity yet.</p>
                     <p className="text-xs text-text-secondary mt-1">Click a milestone stage to add comments or submit work for review.</p>
                   </div>
                 )}
                 {taskComments.map((c) => (
                   <div key={c.id} className="bg-background border border-divider rounded-xl p-4 relative overflow-hidden transition-all hover:border-primary/20">
                     <div className="flex items-center justify-between mb-2">
                       <div className="flex items-center gap-2">
                         <div className="w-6 h-6 rounded-full bg-divider flex items-center justify-center text-text-primary font-bold text-[9px]">{c.author.substring(0,2).toUpperCase()}</div>
                         <span className="text-xs font-bold text-text-primary">{c.author}</span>
                         <Badge variant="primary" className="text-[9px] px-1.5 py-0">{c.stageLabel}</Badge>
                       </div>
                       <div className="flex items-center gap-2">
                         <span className="text-[10px] text-text-secondary">{c.timestamp}</span>
                       </div>
                     </div>
                     <p className="text-sm text-text-secondary leading-relaxed ml-8">{c.text}</p>
                     <div className="mt-2 ml-8 flex gap-2">
                       <Button variant="ghost" onClick={() => {
                         const idx = milestones.findIndex((m) => m.id === c.stageId);
                         if (idx !== -1) setViewedStageIndex(idx);
                       }} className="text-[10px] py-1 px-2 rounded-md h-auto cursor-pointer hover:bg-primary/10 hover:text-primary">
                         View Stage
                       </Button>
                     </div>
                   </div>
                 ))}
             </div>
          </div>
       </Card>

       {/* ─── Modals ─────────────────────────────────────────── */}

       {/* Add Task */}
       <Modal isOpen={showAddTask} onClose={() => setShowAddTask(false)} title={`Add Task to “${viewedMilestone?.label}”`} description="This task will appear under the selected stage." icon="info">
         <div className="w-full space-y-3 !mt-4">
           <Input placeholder="Task title" value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} />
           <Textarea placeholder="Description (optional)" rows={2} value={newTaskDesc} onChange={(e) => setNewTaskDesc(e.target.value)} />
           <div className="w-full">
             <span className="text-sm font-semibold text-text-secondary mb-1 block">Due date (optional)</span>
             <input type="date" className="w-full input-base px-4 py-3 text-text-primary bg-background cursor-pointer" value={newTaskDueDate} onChange={(e) => setNewTaskDueDate(e.target.value)} />
           </div>
           <div className="flex gap-2 justify-end pt-2">
             <Button variant="ghost" onClick={() => setShowAddTask(false)}>Cancel</Button>
             <Button variant="primary" onClick={handleAddTask} disabled={!newTaskTitle.trim()}>Add Task</Button>
           </div>
         </div>
       </Modal>

       {/* Submit Work for Task */}
       <Modal isOpen={!!submitTaskId} onClose={() => setSubmitTaskId(null)} title="Submit Work" description="Choose a format and provide your deliverable." icon="progress">
         <div className="w-full space-y-4 !mt-4">
           <Select label="Submission type" options={DELIVERABLE_TYPE_OPTIONS} value={submitType} onChange={(e) => { setSubmitType(e.target.value as DeliverableType); setSubmitValue(""); }} />
           {submitType === "url" && <Input icon={<LinkIcon className="w-4 h-4" />} placeholder="https://..." value={submitValue} onChange={(e) => setSubmitValue(e.target.value)} />}
           {submitType === "text" && <Textarea placeholder="Paste or write your text content…" rows={4} value={submitValue} onChange={(e) => setSubmitValue(e.target.value)} />}
           {(submitType === "file" || submitType === "image") && (
             <Dropzone
               hint={submitType === "image" ? "PNG, JPG, SVG up to 10MB" : "Any file type up to 50MB"}
               accept={submitType === "image" ? "image/*" : undefined}
               value={submitFile}
               onChange={(file) => setSubmitFile(file)}
             />
           )}
           <div className="flex gap-2 justify-end pt-2">
             <Button variant="ghost" onClick={() => { setSubmitTaskId(null); setSubmitFile(null); }}>Cancel</Button>
             <Button variant="primary" onClick={handleSubmitWork} disabled={(submitType === "file" || submitType === "image") ? !submitFile : !submitValue.trim()}>Submit for Review</Button>
           </div>
         </div>
       </Modal>

       {/* Add Deliverable */}
       <Modal isOpen={showAddDeliverable} onClose={() => setShowAddDeliverable(false)} title="Add Deliverable" description="Define what you expect from the client." icon="info">
         <div className="w-full space-y-3 !mt-4">
           <Select label="Deliverable type" options={DELIVERABLE_TYPE_OPTIONS} value={newDelType} onChange={(e) => { setNewDelType(e.target.value as DeliverableType); setNewDelValue(""); }} />
           <Input placeholder="Deliverable name (e.g. ‘Brand Guidelines PDF’)" value={newDelTitle} onChange={(e) => setNewDelTitle(e.target.value)} />
           <Textarea placeholder="Description — what exactly do you need?" rows={2} value={newDelDesc} onChange={(e) => setNewDelDesc(e.target.value)} />
           {newDelType === "url" && <Input icon={<LinkIcon className="w-4 h-4" />} placeholder="https://... (optional — client can fill later)" value={newDelValue} onChange={(e) => setNewDelValue(e.target.value)} />}
           {newDelType === "text" && <Textarea placeholder="Pre-fill text content (optional)" rows={3} value={newDelValue} onChange={(e) => setNewDelValue(e.target.value)} />}
           <div className="flex gap-2 justify-end pt-2">
             <Button variant="ghost" onClick={() => setShowAddDeliverable(false)}>Cancel</Button>
             <Button variant="primary" onClick={handleAddDeliverable} disabled={!newDelTitle.trim()}>Add Deliverable</Button>
           </div>
         </div>
       </Modal>

       <Modal isOpen={showMilestoneModal} onClose={() => setShowMilestoneModal(false)} title="Edit Milestones" description="Add, remove, or reorder your project stages.">
         <div className="w-full space-y-3 !mt-4">
           {milestones.map((m, i) => (
             <div key={m.id} className="flex items-center gap-2">
               <span className="text-xs font-bold text-text-secondary w-6 text-center">{i + 1}</span>
               <span className="flex-1 text-sm font-semibold text-text-primary truncate">{m.label}</span>
               <Button variant="ghost" onClick={() => setMilestoneToDelete(m.id)} className="text-xs text-error py-1 px-2 h-auto rounded-lg cursor-pointer">Remove</Button>
            </div>
           ))}
           <div className="flex items-center gap-2 pt-2 border-t border-divider">
             <Input placeholder="New stage name" value={newMilestoneLabel} onChange={(e) => setNewMilestoneLabel(e.target.value)} className="flex-1" />
             <Button variant="primary" onClick={handleAddMilestone} disabled={!newMilestoneLabel.trim()} className="whitespace-nowrap">Add Stage</Button>
           </div>
           <div className="flex justify-end pt-2">
             <Button variant="secondary" onClick={() => setShowMilestoneModal(false)}>Done</Button>
           </div>
         </div>
       </Modal>

       {/* Edit Task */}
       <Modal isOpen={!!editingTask} onClose={() => setEditingTask(null)} title="Edit Task" description="Update task details.">
         <div className="w-full space-y-3 !mt-4">
           <Input placeholder="Task title" value={editTaskTitle} onChange={(e) => setEditTaskTitle(e.target.value)} />
           <Textarea placeholder="Description" rows={2} value={editTaskDesc} onChange={(e) => setEditTaskDesc(e.target.value)} />
           <div className="w-full">
             <span className="text-sm font-semibold text-text-secondary mb-1 block">Due date</span>
             <input type="date" className="w-full input-base px-4 py-3 text-text-primary bg-background cursor-pointer" value={editTaskDueDate} onChange={(e) => setEditTaskDueDate(e.target.value)} />
           </div>
           <div className="flex gap-2 justify-end pt-2">
             <Button variant="ghost" onClick={() => setEditingTask(null)}>Cancel</Button>
             <Button variant="primary" onClick={handleSaveEditTask}>Save Changes</Button>
           </div>
         </div>
       </Modal>

       {/* Milestone delete confirm */}
       <ConfirmDialog
         isOpen={!!milestoneToDelete}
         onClose={() => setMilestoneToDelete(null)}
         onConfirm={() => { if (milestoneToDelete) handleRemoveMilestone(milestoneToDelete); }}
         title="Delete Stage"
         description="Deleting this stage will also remove all its tasks, reviews, and comments. This cannot be undone."
       />
    </div>
  );
}
