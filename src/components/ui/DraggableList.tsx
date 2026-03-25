"use client"
import * as React from "react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, Edit2, Trash2, Plus } from "lucide-react"
import { IconButton } from "@/components/ui/IconButton"
import { cn } from "@/lib/utils"

export interface ListItem {
  id: string
  title: string
  subtitle: string
  iconText: string
  colorClass: string
}

/* ─── Sortable Row (Molecule) ────────────────────────────────── */
function SortableRow({
  item,
  onEdit,
  onDelete,
}: {
  item: ListItem
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    position: "relative",
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "p-3 flex items-center gap-3 bg-surface transition-colors group",
        isDragging
          ? "shadow-premium rounded-xl ring-2 ring-primary/30 opacity-95"
          : "hover:bg-background/50"
      )}
    >
      {/* Drag handle – touch target is intentionally generous */}
      <button
        className="touch-manipulation p-1 -m-1 cursor-grab active:cursor-grabbing text-divider group-hover:text-text-secondary transition-colors bg-transparent border-none focus:outline-none"
        aria-label={`Reorder ${item.title}`}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-5 h-5" />
      </button>

      <div
        className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center font-bold shrink-0 text-sm",
          item.colorClass
        )}
      >
        {item.iconText}
      </div>

      <div className="flex-1 min-w-0">
        <h5 className="font-bold text-sm text-text-primary truncate">
          {item.title}
        </h5>
        <p className="text-xs text-text-secondary truncate">{item.subtitle}</p>
      </div>

      <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
        <IconButton
          variant="primary"
          title="Edit"
          onClick={() => onEdit?.(item.id)}
          aria-label={`Edit ${item.title}`}
        >
          <Edit2 className="w-4 h-4" />
        </IconButton>
        <IconButton
          variant="danger"
          title="Delete"
          onClick={() => onDelete?.(item.id)}
          aria-label={`Delete ${item.title}`}
        >
          <Trash2 className="w-4 h-4" />
        </IconButton>
      </div>
    </div>
  )
}

/* ─── DraggableList (Organism) ───────────────────────────────── */
export function DraggableList({
  title,
  items,
  onReorder,
  onEdit,
  onDelete,
  onAdd,
  addLabel,
  emptyMessage,
}: {
  title: string
  items: ListItem[]
  onReorder?: (items: ListItem[]) => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onAdd?: () => void
  addLabel?: string
  emptyMessage?: string
}) {
  // Fully controlled: parent owns the items array, we just render and report back.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = items.findIndex((i) => i.id === active.id)
    const newIndex = items.findIndex((i) => i.id === over.id)
    onReorder?.(arrayMove(items, oldIndex, newIndex))
  }

  return (
    <div className="bg-surface border border-divider rounded-xl overflow-hidden shadow-sm">
      <div className="px-5 py-3 border-b border-divider bg-background flex items-center justify-between">
        <h4 className="font-bold text-sm text-text-primary">{title}</h4>
        {onAdd && (
          <button
            onClick={onAdd}
            className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:bg-primary/5 px-2 py-1 rounded-lg transition-colors bg-transparent border-none cursor-pointer focus:outline-none"
          >
            <Plus className="w-3.5 h-3.5" />
            {addLabel || "Add"}
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="p-6 text-center text-sm text-text-secondary">
          {emptyMessage || "No items yet. Add one to get started."}
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={items.map((i) => i.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="divide-y divide-divider flex flex-col">
              {items.map((item) => (
                <SortableRow
                  key={item.id}
                  item={item}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  )
}
