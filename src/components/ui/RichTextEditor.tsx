import React from 'react';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  value: string;
  onChange: (richText: string) => void;
  className?: string;
  placeholder?: string;
}

// Basic Toolbar (Optional, can be expanded later)
const MenuBar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-1 border-b p-1 mb-1">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={cn("p-1 rounded hover:bg-muted", editor.isActive('bold') ? 'bg-muted' : '')}
        aria-label="Bold"
      >
        B
      </button>
      <button
         type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={cn("p-1 rounded hover:bg-muted", editor.isActive('italic') ? 'bg-muted' : '')}
        aria-label="Italic"
      >
        I
      </button>
      {/* Add more buttons as needed (e.g., lists, headings) */}
    </div>
  );
};


const RichTextEditor = React.forwardRef<HTMLDivElement, RichTextEditorProps>(
  ({ value, onChange, className, placeholder }, ref) => {
    const editor = useEditor({
      extensions: [
        StarterKit.configure({
          // Configure extensions as needed
          heading: {
            levels: [1, 2, 3],
          },
          bulletList: {
            keepMarks: true,
            keepAttributes: false, // Prevent list item styles from persisting
          },
          orderedList: {
            keepMarks: true,
            keepAttributes: false,
          },
        }),
      ],
      content: value,
      editorProps: {
        attributes: {
          // Apply shadcn input styles to the editor content area
          class: cn(
            'prose dark:prose-invert max-w-none', // Basic prose styling
            'min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            className // Allow overriding styles
          ),
        },
      },
      onUpdate: ({ editor }) => {
        onChange(editor.getHTML());
      },
    });

    // Use forwardRef with the EditorContent wrapper div if needed,
    // otherwise, the ref might not be directly applicable here in a standard way.
    // For form integration, we rely on value/onChange.

    return (
      <div className="rounded-md border border-input focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
        <MenuBar editor={editor} />
        <EditorContent editor={editor} placeholder={placeholder} />
      </div>
    );
  }
);

RichTextEditor.displayName = 'RichTextEditor';

export { RichTextEditor };