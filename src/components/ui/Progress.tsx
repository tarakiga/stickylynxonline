"use client"
import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight } from "lucide-react"

export interface Step {
  id: string
  label: string
  badgeCount?: number
}

/* ─── Individual step dot + label ────────────────────────── */
function StepDot({
  step,
  index,
  isDone,
  isActive,
  clickable,
  onStepClick,
}: {
  step: Step
  index: number
  isDone: boolean
  isActive: boolean
  clickable: boolean
  onStepClick?: (index: number) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onStepClick?.(index)}
      className={cn(
        "relative flex flex-col items-center bg-transparent border-none p-0 focus:outline-none group shrink-0",
        clickable ? "cursor-pointer" : "cursor-default"
      )}
      aria-label={`${step.label}${isDone ? " (complete)" : isActive ? " (current)" : ""}`}
    >
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ring-4 z-10 transition-all duration-300",
          isDone
            ? "bg-primary text-white shadow-sm ring-surface"
            : isActive
              ? "bg-primary text-white shadow-lg ring-primary-light"
              : "bg-surface border-2 border-divider text-text-secondary shadow-sm ring-surface",
          clickable && "group-hover:scale-110 group-hover:shadow-md"
        )}
      >
        {isDone ? (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          index + 1
        )}
        {typeof step.badgeCount === "number" && step.badgeCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-surface z-20">
            {step.badgeCount}
          </span>
        )}
      </div>
      <span
        className={cn(
          "text-[10px] sm:text-xs font-semibold mt-2 whitespace-nowrap transition-colors max-w-[72px] truncate text-center",
          isActive || isDone ? "text-text-primary" : "text-text-secondary",
          clickable && "group-hover:text-primary"
        )}
      >
        {step.label}
      </span>
    </button>
  )
}

/* ─── Connector line between dots ────────────────────────── */
function Connector({ filled }: { filled: boolean }) {
  return (
    <div className="flex-1 min-w-[24px] sm:min-w-[32px] h-1 mx-1 rounded-full transition-colors duration-500">
      <div className={cn("h-full rounded-full transition-all duration-500", filled ? "bg-primary" : "bg-divider")} />
    </div>
  )
}

/* ─── Main component ─────────────────────────────────────── */
export function StepProgress({
  steps,
  currentStep,
  onStepClick,
}: {
  steps: Step[]
  currentStep: number
  onStepClick?: (index: number) => void
}) {
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = React.useState(false)
  const [canScrollRight, setCanScrollRight] = React.useState(false)

  const checkScroll = React.useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4)
  }, [])

  React.useEffect(() => {
    checkScroll()
    const el = scrollRef.current
    if (!el) return
    el.addEventListener("scroll", checkScroll, { passive: true })
    const ro = new ResizeObserver(checkScroll)
    ro.observe(el)
    return () => { el.removeEventListener("scroll", checkScroll); ro.disconnect() }
  }, [checkScroll, steps.length])

  // Auto-scroll active step into view
  React.useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const child = el.children[Math.max(0, (currentStep - 1) * 2)] as HTMLElement
    if (child) child.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" })
  }, [currentStep])

  function scroll(dir: "left" | "right") {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: dir === "left" ? -160 : 160, behavior: "smooth" })
  }

  const clickable = !!onStepClick

  return (
    <div className="relative w-full pb-2">
      {/* Scroll arrows (only visible when overflowing) */}
      {canScrollLeft && (
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-30 w-7 h-7 rounded-full bg-surface border border-divider shadow-sm flex items-center justify-center text-text-secondary hover:text-primary hover:border-primary transition-colors cursor-pointer"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}
      {canScrollRight && (
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-30 w-7 h-7 rounded-full bg-surface border border-divider shadow-sm flex items-center justify-center text-text-secondary hover:text-primary hover:border-primary transition-colors cursor-pointer"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}

      {/* Scrollable track */}
      <div
        ref={scrollRef}
        className="flex items-start overflow-x-auto scrollbar-hide scroll-smooth px-2 sm:px-4 pb-8 pt-1"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {steps.map((step, index) => {
          const isDone = index < currentStep - 1
          const isActive = index === currentStep - 1
          return (
            <React.Fragment key={step.id}>
              <StepDot
                step={step}
                index={index}
                isDone={isDone}
                isActive={isActive}
                clickable={clickable}
                onStepClick={onStepClick}
              />
              {index < steps.length - 1 && (
                <Connector filled={index < currentStep - 1} />
              )}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}
