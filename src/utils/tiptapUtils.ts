import type { JSONContent } from '@tiptap/react'

export function extractTextFromTiptapJSON(jsonInput: JSONContent | string | null | undefined): string {
  if (!jsonInput) return ''

  let json: JSONContent
  try {
    json = typeof jsonInput === 'string' ? JSON.parse(jsonInput) : jsonInput
  } catch {
    return ''
  }

  const texts: string[] = []

  const walk = (node: any) => {
    if (!node) return
    if (node.type === 'text' && node.text) {
      texts.push(node.text)
    }
    if (Array.isArray(node.content)) {
      node.content.forEach(walk)
    }
  }

  walk(json)
  return texts.join(' ').replace(/\s+/g, ' ').trim()
}

export const isEmptyTiptapJSON = (input: any): boolean => {
  if (!input) return true;

  let parsed: any;
  try {
    parsed = typeof input === 'string' ? JSON.parse(input) : input;
  } catch {
    return true;
  }

  return (
    typeof parsed !== 'object' ||
    parsed.type !== 'doc' ||
    !Array.isArray(parsed.content) ||
    parsed.content.length === 0 ||
    parsed.content.every(
      (node: any) =>
        !node ||
        (node.type === 'paragraph' &&
          (!node.content || node.content.length === 0)) ||
        (node.type === 'paragraph' &&
          node.content.every((child: any) => child.type === 'text' && !child.text?.trim()))
    )
  );
};
