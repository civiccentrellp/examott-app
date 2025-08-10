import { useEffect, useRef } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Placeholder from '@tiptap/extension-placeholder';
import { Button } from '@/components/ui/button';
import Image from '@tiptap/extension-image'
import {
  TypeBold,
  ListUl,
  ListOl,
  Indent,
  Unindent,
  Table as TableIcon,
  PlusSquare,
  Plus,
  DashSquare,
  Dash,
  Trash,
  Image as ImageIcon,
} from 'react-bootstrap-icons';
import { uploadFileToFirebase } from '@/utils/firebaseUpload';

import type { JSONContent } from '@tiptap/react';

interface TiptapEditorProps {
  content?: JSONContent;
  onUpdate?: (editorContent: JSONContent) => void;
  className?: string;
  placeholder?: string;
  editable?: boolean;
}

const TiptapEditor: React.FC<TiptapEditorProps> = ({
  content = '',
  onUpdate,
  className = '',
  placeholder = 'Start writing...',
  editable = true,
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({}),
      Image.configure({
        inline: false,
        allowBase64: true,
      }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      Placeholder.configure({ placeholder }),
    ],
    immediatelyRender: false,
    content,
    editable: true,  
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      if (onUpdate) onUpdate(json); // send raw JSON directly
    },    
    editorProps: {
      attributes: {
        class: 'tiptap-editor dark:prose-invert focus:outline-none px-3 py-2 border border-input rounded-md shadow-sm bg-background min-h-[140px]',
      },
    },
  });

  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editor && content) {
      editor.commands.setContent(content); // Update editor with new instructions
    }
  }, [editor, content]);

  useEffect(() => {
    if (editor && editorRef.current) {
      editor.commands.focus();
    }
  }, [editor]);

  useEffect(() => {
    if (editor && editorRef.current) {
      editor.commands.focus();
    }
  }, [editor]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleImageButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && editor) {
      const reader = new FileReader();
      reader.onload = async () => {
        if (!reader.result) return;
        const blob = await (await fetch(reader.result as string)).blob();
        const file = new File([blob], `img-${Date.now()}.${blob.type.split('/')[1]}`, { type: blob.type });
      
        const url = await uploadFileToFirebase(file, `questions/editor/${Date.now()}`);
        editor.chain().focus().setImage({ src: url }).run();
      };
      
      reader.readAsDataURL(file); // or upload to cloud and use the returned URL
    }
  };


  return (
    <div ref={editorRef} className={`space-y-2 ${className}`}>
      {editor && (
        <div className="flex flex-wrap gap-2 mb-2 border border-input rounded-md p-2 bg-background">
          <Button variant="outline" size="sm" onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'bg-muted' : ''}>
            <TypeBold />
          </Button>
          <Button variant="outline" size="sm" onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive('bulletList') ? 'bg-muted' : ''}>
            <ListUl />
          </Button>
          <Button variant="outline" size="sm" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={editor.isActive('orderedList') ? 'bg-muted' : ''}>
            <ListOl />
          </Button>
          <Button variant="outline" size="sm" onClick={() => editor.chain().focus().sinkListItem('listItem').run()}>
            <Indent />
          </Button>
          <Button variant="outline" size="sm" onClick={() => editor.chain().focus().liftListItem('listItem').run()}>
            <Unindent />
          </Button>
          <Button variant="outline" size="sm" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>
            <TableIcon />
          </Button>
          <Button variant="outline" size="sm" onClick={() => editor.chain().focus().addColumnAfter().run()}>
            <PlusSquare />
          </Button>
          <Button variant="outline" size="sm" onClick={() => editor.chain().focus().addRowAfter().run()}>
            <Plus />
          </Button>
          <Button variant="outline" size="sm" onClick={() => editor.chain().focus().deleteColumn().run()}>
            <DashSquare />
          </Button>
          <Button variant="outline" size="sm" onClick={() => editor.chain().focus().deleteRow().run()}>
            <Dash />
          </Button>
          <Button variant="destructive" size="sm" onClick={() => editor.chain().focus().deleteTable().run()}>
            <Trash />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleImageButtonClick}
          >
            <ImageIcon />
          </Button>

          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageUpload}
            style={{ display: 'none' }}
          />

        </div>
      )}
      {editor ? <EditorContent editor={editor} /> : <p>Loading editor...</p>}
    </div>
  );
};

export default TiptapEditor;
