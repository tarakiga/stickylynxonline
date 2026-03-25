"use client";
import * as React from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { IconButton } from "@/components/ui/IconButton";
import {
  X,
  Link as LinkIcon,
  ImageIcon,
  FileText,
  Send,
  Copy,
  CheckCircle2,
  Clock,
  ExternalLink,
  Trash2,
  Plus,
  MessageSquare,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

import type {
  Attachment,
  StageReview,
  StageComment,
  MilestoneWithReviews,
} from "@/types/editor";

/* ─── Helpers ────────────────────────────────────────────────── */
let _seq = 0;
function uid() {
  return `sr-${Date.now()}-${++_seq}`;
}

const REVIEW_STATUS_MAP: Record<
  StageReview["status"],
  { label: string; variant: "neutral" | "primary" | "success" | "warning" }
> = {
  draft: { label: "Draft", variant: "neutral" },
  submitted: { label: "Awaiting Review", variant: "primary" },
  approved: { label: "Approved", variant: "success" },
  revision_needed: { label: "Needs Revision", variant: "warning" },
};

const ATTACHMENT_ICONS: Record<Attachment["type"], React.ReactNode> = {
  url: <LinkIcon className="w-4 h-4" />,
  image: <ImageIcon className="w-4 h-4" />,
  document: <FileText className="w-4 h-4" />,
};

/* ─── Component ──────────────────────────────────────────────── */
export function StageReviewDrawer({
  isOpen,
  onClose,
  milestone,
  stageIndex,
  isDone,
  isActive,
  clientName,
  pageHandle,
  onUpdate,
}: {
  isOpen: boolean;
  onClose: () => void;
  milestone: MilestoneWithReviews | null;
  stageIndex: number;
  isDone: boolean;
  isActive: boolean;
  clientName: string;
  pageHandle: string;
  onUpdate: (updated: MilestoneWithReviews) => void;
}) {
  /* ── Local form states ─── */
  const [showAddReview, setShowAddReview] = React.useState(false);
  const [reviewTitle, setReviewTitle] = React.useState("");
  const [reviewDesc, setReviewDesc] = React.useState("");
  const [attachments, setAttachments] = React.useState<Attachment[]>([]);
  const [attachType, setAttachType] = React.useState<Attachment["type"]>("url");
  const [attachValue, setAttachValue] = React.useState("");
  const [attachLabel, setAttachLabel] = React.useState("");
  const [commentText, setCommentText] = React.useState("");
  const [linkCopied, setLinkCopied] = React.useState(false);

  // Reset form when drawer opens on a new stage
  React.useEffect(() => {
    setShowAddReview(false);
    setReviewTitle("");
    setReviewDesc("");
    setAttachments([]);
    setCommentText("");
  }, [milestone?.id]);

  if (!isOpen || !milestone) return null;

  // Alias after null guard so TypeScript narrows for closures
  const ms: MilestoneWithReviews = milestone;

  const reviews = ms.reviews;
  const comments = milestone.comments;
  const pendingComments = comments.filter((c) => !c.resolved).length;

  /* ── Handlers ─── */
  function handleAddAttachment() {
    if (!attachValue.trim()) return;
    setAttachments((prev) => [
      ...prev,
      {
        id: uid(),
        type: attachType,
        value: attachValue.trim(),
        label: attachLabel.trim() || attachValue.trim(),
      },
    ]);
    setAttachValue("");
    setAttachLabel("");
  }

  function handleSubmitReview() {
    if (!reviewTitle.trim()) return;
    const review: StageReview = {
      id: uid(),
      stageId: ms.id,
      title: reviewTitle.trim(),
      description: reviewDesc.trim(),
      attachments,
      submittedAt: new Date().toISOString(),
      status: "submitted",
    };
    onUpdate({
      ...ms,
      reviews: [...ms.reviews, review],
    });
    setShowAddReview(false);
    setReviewTitle("");
    setReviewDesc("");
    setAttachments([]);
  }

  function handleUpdateReviewStatus(
    reviewId: string,
    status: StageReview["status"]
  ) {
    onUpdate({
      ...ms,
      reviews: ms.reviews.map((r) =>
        r.id === reviewId ? { ...r, status } : r
      ),
    });
  }

  function handleAddComment() {
    if (!commentText.trim()) return;
    const comment: StageComment = {
      id: uid(),
      stageId: ms.id,
      author: "You",
      text: commentText.trim(),
      timestamp: new Date().toLocaleString(),
      resolved: false,
    };
    onUpdate({
      ...ms,
      comments: [...ms.comments, comment],
    });
    setCommentText("");
  }

  function handleResolveComment(id: string) {
    onUpdate({
      ...ms,
      comments: ms.comments.map((c) =>
        c.id === id ? { ...c, resolved: true } : c
      ),
    });
  }

  function handleCopyLink() {
    const base =
      typeof window !== "undefined" ? window.location.origin : "";
    const link = `${base}/${pageHandle}?stage=${ms.id}`;
    navigator.clipboard.writeText(link);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2500);
  }

  /* ── Timeline: merge reviews + comments chronologically ─── */
  type TimelineEntry =
    | { kind: "review"; data: StageReview; sortKey: string }
    | { kind: "comment"; data: StageComment; sortKey: string };

  const timeline: TimelineEntry[] = [
    ...reviews.map(
      (r) =>
        ({
          kind: "review",
          data: r,
          sortKey: r.submittedAt,
        }) as TimelineEntry
    ),
    ...comments.map(
      (c) =>
        ({
          kind: "comment",
          data: c,
          sortKey: c.timestamp,
        }) as TimelineEntry
    ),
  ].sort((a, b) => a.sortKey.localeCompare(b.sortKey));

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-xl bg-surface border-l border-divider shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="shrink-0 border-b border-divider p-6 bg-background/50">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ring-4 ring-surface",
                  isDone
                    ? "bg-primary text-white"
                    : isActive
                      ? "bg-primary text-white"
                      : "bg-surface border-2 border-divider text-text-secondary"
                )}
              >
                {isDone ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  stageIndex + 1
                )}
              </div>
              <div>
                <h2 className="text-lg font-bold text-text-primary">
                  {milestone.label}
                </h2>
                <p className="text-xs text-text-secondary">
                  Stage {stageIndex + 1} &middot;{" "}
                  {isDone
                    ? "Completed"
                    : isActive
                      ? "In Progress"
                      : "Upcoming"}
                </p>
              </div>
            </div>
            <IconButton onClick={onClose}>
              <X className="w-5 h-5" />
            </IconButton>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              onClick={handleCopyLink}
              className="text-xs py-2 px-4 rounded-xl shadow-sm cursor-pointer border-none text-white"
            >
              {linkCopied ? (
                <>
                  <CheckCircle2 size={14} className="mr-1.5" /> Copied!
                </>
              ) : (
                <>
                  <Copy size={14} className="mr-1.5" /> Copy Review Link
                </>
              )}
            </Button>
            <Badge
              variant={isDone ? "success" : isActive ? "primary" : "neutral"}
              pulse={isActive}
            >
              {reviews.length} Review{reviews.length !== 1 ? "s" : ""}
            </Badge>
            {pendingComments > 0 && (
              <Badge variant="warning">
                {pendingComments} Pending
              </Badge>
            )}
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
          {/* ── Work Submissions ─── */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm tracking-widest text-text-secondary uppercase">
                Work Submissions
              </h3>
              {!showAddReview && (
                <Button
                  variant="ghost"
                  onClick={() => setShowAddReview(true)}
                  className="text-primary text-xs font-bold py-1.5 px-3 rounded-lg h-auto hover:bg-primary/5 cursor-pointer border border-primary/20"
                >
                  <Plus size={14} className="mr-1" /> Submit Work
                </Button>
              )}
            </div>

            {/* Add review form */}
            {showAddReview && (
              <div className="bg-background border border-divider rounded-2xl p-5 space-y-4 mb-4 animate-in fade-in slide-in-from-top-2 duration-200">
                <Input
                  placeholder="Review title (e.g. 'Homepage Wireframes v2')"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                />
                <Textarea
                  placeholder="Describe what you're submitting for review..."
                  rows={3}
                  value={reviewDesc}
                  onChange={(e) => setReviewDesc(e.target.value)}
                />

                {/* Attachments */}
                <div className="space-y-2">
                  <p className="text-xs font-bold text-text-secondary uppercase tracking-widest">
                    Attachments
                  </p>
                  {attachments.map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center gap-2 bg-surface border border-divider rounded-lg px-3 py-2 text-sm"
                    >
                      <span className="text-text-secondary">
                        {ATTACHMENT_ICONS[a.type]}
                      </span>
                      <span className="flex-1 truncate text-text-primary font-semibold">
                        {a.label}
                      </span>
                      <IconButton
                        variant="danger"
                        size="sm"
                        onClick={() =>
                          setAttachments((p) =>
                            p.filter((x) => x.id !== a.id)
                          )
                        }
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </IconButton>
                    </div>
                  ))}

                  <div className="flex items-center gap-2">
                    <select
                      value={attachType}
                      onChange={(e) =>
                        setAttachType(
                          e.target.value as Attachment["type"]
                        )
                      }
                      className="input-base px-3 py-2 text-xs rounded-lg appearance-none cursor-pointer bg-background text-text-primary w-24"
                    >
                      <option value="url">URL</option>
                      <option value="image">Image</option>
                      <option value="document">Doc</option>
                    </select>
                    <Input
                      placeholder={
                        attachType === "url"
                          ? "https://..."
                          : "File name or URL"
                      }
                      value={attachValue}
                      onChange={(e) => setAttachValue(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      variant="ghost"
                      onClick={handleAddAttachment}
                      disabled={!attachValue.trim()}
                      className="text-xs py-2 px-3 rounded-lg h-auto cursor-pointer shrink-0"
                    >
                      <Plus size={14} />
                    </Button>
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-2 border-t border-divider">
                  <Button
                    variant="ghost"
                    onClick={() => setShowAddReview(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleSubmitReview}
                    disabled={!reviewTitle.trim()}
                    className="border-none text-white"
                  >
                    <Send size={14} className="mr-1.5" /> Submit for Review
                  </Button>
                </div>
              </div>
            )}

            {/* Review cards */}
            {reviews.length === 0 && !showAddReview && (
              <div className="bg-background border-2 border-dashed border-divider rounded-xl p-8 text-center">
                <FileText
                  size={32}
                  className="text-text-secondary mx-auto mb-3 opacity-40"
                />
                <p className="text-sm text-text-secondary font-semibold">
                  No work submitted for this stage yet.
                </p>
                <p className="text-xs text-text-secondary mt-1">
                  Click &ldquo;Submit Work&rdquo; to present deliverables
                  for client review.
                </p>
              </div>
            )}

            {reviews.map((review) => {
              const statusInfo = REVIEW_STATUS_MAP[review.status];
              return (
                <div
                  key={review.id}
                  className="bg-background border border-divider rounded-2xl p-5 mb-3 group hover:border-primary/20 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-bold text-sm text-text-primary">
                        {review.title}
                      </h4>
                      <p className="text-xs text-text-secondary mt-0.5">
                        <Clock size={10} className="inline mr-1" />
                        {new Date(review.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant={statusInfo.variant}>
                      {statusInfo.label}
                    </Badge>
                  </div>

                  {review.description && (
                    <p className="text-sm text-text-secondary leading-relaxed mb-3">
                      {review.description}
                    </p>
                  )}

                  {/* Attachments */}
                  {review.attachments.length > 0 && (
                    <div className="space-y-1.5 mb-3">
                      {review.attachments.map((a) => (
                        <a
                          key={a.id}
                          href={
                            a.type === "url" ? a.value : undefined
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cn(
                            "flex items-center gap-2 bg-surface border border-divider rounded-lg px-3 py-2 text-sm transition-colors",
                            a.type === "url"
                              ? "hover:border-primary/30 hover:text-primary cursor-pointer"
                              : ""
                          )}
                        >
                          <span className="text-text-secondary">
                            {ATTACHMENT_ICONS[a.type]}
                          </span>
                          <span className="flex-1 truncate font-semibold text-text-primary">
                            {a.label}
                          </span>
                          {a.type === "url" && (
                            <ExternalLink className="w-3.5 h-3.5 text-text-secondary" />
                          )}
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Quick status actions */}
                  {review.status === "submitted" && (
                    <div className="flex gap-2 pt-2 border-t border-divider">
                      <Button
                        variant="ghost"
                        onClick={() =>
                          handleUpdateReviewStatus(review.id, "approved")
                        }
                        className="text-xs py-1.5 px-3 rounded-lg h-auto cursor-pointer hover:bg-success/10 hover:text-success"
                      >
                        <CheckCircle2 size={12} className="mr-1" />{" "}
                        Approve
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() =>
                          handleUpdateReviewStatus(
                            review.id,
                            "revision_needed"
                          )
                        }
                        className="text-xs py-1.5 px-3 rounded-lg h-auto cursor-pointer hover:bg-warning/10 hover:text-warning"
                      >
                        Request Revision
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </section>

          {/* ── Activity Timeline ─── */}
          <section>
            <h3 className="font-bold text-sm tracking-widest text-text-secondary uppercase mb-4">
              Stage Activity
            </h3>

            {timeline.length === 0 ? (
              <p className="text-sm text-text-secondary text-center py-4">
                No activity on this stage yet.
              </p>
            ) : (
              <div className="relative pl-6 border-l-2 border-divider space-y-4">
                {timeline.map((entry) => {
                  if (entry.kind === "review") {
                    const r = entry.data;
                    return (
                      <div key={r.id} className="relative">
                        <div className="absolute -left-[25px] top-1 w-3 h-3 rounded-full bg-primary ring-4 ring-surface" />
                        <div className="bg-primary/5 border border-primary/20 rounded-xl p-3">
                          <p className="text-xs font-bold text-primary">
                            Work Submitted
                          </p>
                          <p className="text-sm font-semibold text-text-primary mt-0.5">
                            {r.title}
                          </p>
                          <p className="text-[10px] text-text-secondary mt-1">
                            {new Date(r.submittedAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    );
                  }

                  const c = entry.data;
                  return (
                    <div key={c.id} className="relative">
                      <div
                        className={cn(
                          "absolute -left-[25px] top-1 w-3 h-3 rounded-full ring-4 ring-surface",
                          c.resolved ? "bg-success" : "bg-divider"
                        )}
                      />
                      <div
                        className={cn(
                          "bg-background border border-divider rounded-xl p-3 transition-all",
                          c.resolved && "opacity-60"
                        )}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-divider flex items-center justify-center text-text-primary font-bold text-[9px]">
                              {c.author.substring(0, 2).toUpperCase()}
                            </div>
                            <span className="text-xs font-bold text-text-primary">
                              {c.author}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {c.resolved && (
                              <Badge
                                variant="success"
                                className="text-[9px] px-1.5 py-0"
                              >
                                Resolved
                              </Badge>
                            )}
                            <span className="text-[10px] text-text-secondary">
                              {c.timestamp}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-text-secondary leading-relaxed ml-8">
                          {c.text}
                        </p>
                        {!c.resolved && (
                          <div className="ml-8 mt-2">
                            <Button
                              variant="ghost"
                              onClick={() =>
                                handleResolveComment(c.id)
                              }
                              className="text-[10px] py-1 px-2 rounded-md h-auto cursor-pointer hover:bg-success/10 hover:text-success"
                            >
                              <CheckCircle2 size={10} className="mr-1" />{" "}
                              Resolve
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* Footer: comment input */}
        <div className="shrink-0 border-t border-divider p-4 bg-background/50">
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <Input
                placeholder={`Add a note to "${milestone.label}"...`}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleAddComment();
                  }
                }}
              />
            </div>
            <Button
              variant="primary"
              onClick={handleAddComment}
              disabled={!commentText.trim()}
              className="py-3 px-4 rounded-xl cursor-pointer border-none text-white shrink-0"
            >
              <ArrowRight size={16} />
            </Button>
          </div>
          <p className="text-[10px] text-text-secondary mt-2 text-center">
            <MessageSquare size={10} className="inline mr-1" />
            Comments are automatically linked to the{" "}
            <strong>{milestone.label}</strong> stage
          </p>
        </div>
      </div>
    </>
  );
}
