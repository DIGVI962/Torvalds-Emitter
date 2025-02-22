import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

const TiptapViewer = ({ content }) => {
	const editor = useEditor({
		editable: false, // ✅ Read-only viewer
		content,
		extensions: [StarterKit],
		editorProps: {
			attributes: {
				class:
					'max-w-none focus:outline-none prose prose-xs lg:prose-sm dark:prose-invert',
			},
		},
	});

	return (
		<div className='tiptap-viewer text-sm sm:text-base leading-relaxed'>
			<EditorContent editor={editor} />
		</div>
	);
};

export default TiptapViewer;
