export type EditorBlockContent = unknown

export type EditorBlock = {
  id?: string
  type: string
  order?: number
  content?: EditorBlockContent | null
}

export type EditorPage = {
  id: string
  handle: string
  title?: string | null
  clientEmail?: string | null
  clientPinEnabled?: boolean | null
  clientAccessCreatedAt?: string | Date | null
  lastClientAccessAt?: string | Date | null
  clientPinCreatedAt?: string | Date | null
  blocks?: EditorBlock[]
}

export function findEditorBlock(
  blocks: EditorBlock[] | undefined,
  type: string,
  section?: string
) {
  return (blocks || []).find((block) => {
    if (!section) {
      return block.type === type
    }

    if (!block.content || typeof block.content !== "object" || Array.isArray(block.content)) {
      return false
    }

    return block.type === type && "section" in block.content && block.content.section === section
  })
}
