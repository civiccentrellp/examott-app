// components/ui/ReadOnlyTiptapRenderer.tsx
import React, { useEffect, useMemo } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';

type Props = {
  jsonContent: any
  className?: string
  truncate?: boolean
  triggerKey?: string;
  truncateChars?: number
}

const hasImages = (node: any): boolean => {
  if (!node) return false
  if (node.type === 'image') return true
  if (node.content) {
    return node.content.some((child: any) => hasImages(child))
  }
  return false
}

const getTruncatedContent = (content: any, maxChars: number): any => {
  const clone = JSON.parse(JSON.stringify(content));
  let charCount = 0;

  const truncateNode = (node: any): boolean => {
    if (!node.content) return false;

    for (let i = 0; i < node.content.length; i++) {
      const child = node.content[i];

      if (child.type === 'text') {
        const remaining = maxChars - charCount;
        if (child.text.length > remaining) {
          child.text = child.text.slice(0, remaining);
          node.content = node.content.slice(0, i + 1);
          return true;
        } else {
          charCount += child.text.length;
        }
      } else {
        const reachedLimit = truncateNode(child);
        if (reachedLimit) {
          node.content = node.content.slice(0, i + 1);
          return true;
        }
      }
    }

    return false;
  };

  truncateNode(clone);
  return clone;
};

const ReadOnlyTiptapRenderer = ({
  jsonContent,
  className = '',
  truncate = false,
  triggerKey,
  truncateChars = 300, // default value
}: Props) => {

  const editor = useEditor({
    content: truncate ? getTruncatedContent(jsonContent, truncateChars) : jsonContent,
    editable: false,
    extensions: [StarterKit, Image, Table, TableRow, TableCell, TableHeader],
    immediatelyRender: false,
  });

  const containsImages = useMemo(() => hasImages(jsonContent), [jsonContent]);

  // ✅ Update content when truncate or triggerKey changes
  useEffect(() => {
    if (editor) {
      const contentToUse = truncate ? getTruncatedContent(jsonContent, truncateChars) : jsonContent;
      editor.commands.setContent(contentToUse, false); // false = don't emit transaction
    }
  }, [truncate, triggerKey, jsonContent, truncateChars, editor]);

  if (!editor) return null

  return (
    <div className={className}>
      {containsImages ? (
        <div style={{ display: 'flex', gap: '2rem' }}>
          <div style={{ flex: 2 }}>
            <EditorContent editor={editor} />
          </div>
          <div style={{ flex: 1 }}>
            {extractImages(jsonContent).map((img, i) => (
              <img
                key={i}
                src={img.attrs.src}
                alt=""
                style={{
                  width: '100%',
                  objectFit: 'contain',
                  marginBottom: '1rem',
                  borderRadius: '0.5rem',
                }}
              />
            ))}
          </div>
        </div>
      ) : (
        <EditorContent editor={editor} />
      )}


      <style jsx global>{`
  .ProseMirror img {
    display: ${containsImages ? 'none' : 'block'};
  }

  .ProseMirror ul {
    list-style-type: disc;
    padding-left: 1.5rem;
    margin-bottom: 1rem;
  }

  .ProseMirror ol {
    list-style-type: decimal;
    padding-left: 1.5rem;
    margin-bottom: 1rem;
  }

  .ProseMirror li {
    margin-bottom: 0.25rem;
  }

  .ProseMirror table {
    width: 100%;
    border-collapse: collapse;
  }

  .ProseMirror th,
  .ProseMirror td {
    border: 1px solid #ccc;
    padding: 0.5rem;
  }
`}</style>

    </div>
  )
}

// Helper to extract images from JSON content
const extractImages = (node: any): any[] => {
  if (!node) return []
  let images: any[] = []
  if (node.type === 'image') {
    images.push(node)
  }
  if (node.content) {
    node.content.forEach((child: any) => {
      images = images.concat(extractImages(child))
    })
  }
  return images
}

export default ReadOnlyTiptapRenderer
