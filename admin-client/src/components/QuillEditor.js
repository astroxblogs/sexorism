import React, { useMemo, useCallback, forwardRef } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import ImageResize from 'quill-image-resize-module-react';
import api from '../services/api';

// Register the module only once to prevent errors
if (typeof window !== 'undefined' && Quill && !Quill.imports['modules/imageResize']) {
    Quill.register('modules/imageResize', ImageResize);
}

// --- CSS FIX for Resizing Overflow and Editor Height ---
const quillEditorStyles = `
  .admin-quill-editor .ql-container {
    overflow: hidden; /* This is the key fix to contain the resize module */
    position: relative; 
  }

  /* ✅ THIS IS THE NEW RULE TO INCREASE THE EDITOR'S HEIGHT */
  .admin-quill-editor .ql-editor {
    min-height: 1800px; /* Set a minimum height for the editor */
  }

  .admin-quill-editor .ql-editor img {
    max-width: 100%; /* Ensures images are always responsive inside the editor */
    height: auto;
    display: block;
  }
  /* Optional: Nicer styling for the resize handles */
  .image-resize .handle {
    background-color: #3b82f6; /* Tailwind blue-500 */
    border: 1px solid #fff;
    border-radius: 9999px;
    opacity: 0.8;
  }
  .image-resize .overlay {
    border-color: #3b82f6;
  }
`;

export const QuillEditor = forwardRef(({ value, onChange, onLinkClick }, ref) => {

    const quillImageUploadHandler = useCallback(async () => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = async () => {
            if (!input.files || !input.files[0]) return;
            const file = input.files[0];
            
            const editor = ref.current?.getEditor();
            if (!editor) {
                console.error('Quill editor instance not found.');
                return;
            }

            const range = editor.getSelection(true);
            const cursorIndex = range ? range.index : editor.getLength();
            
            editor.insertText(cursorIndex, ' [Uploading image...] ', 'user');
            
            const formData = new FormData();
            formData.append('image', file);
            
            try {
                const res = await api.post('/api/admin/blogs/upload-image', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                const imageUrl = res.data.imageUrl;

                editor.deleteText(cursorIndex, 22, 'user');
                editor.insertEmbed(cursorIndex, 'image', imageUrl, 'user');
                
                editor.setSelection(cursorIndex + 1, 0, 'user');

            } catch (error) {
                console.error('Error uploading image to backend:', error);
                alert('Error uploading image: ' + (error.response?.data?.error || error.message));
                editor.deleteText(cursorIndex, 22, 'user');
            }
        };
    }, [ref]);

    const modules = useMemo(() => ({
        imageResize: {
            parchment: Quill.import('parchment'),
            modules: ['Resize', 'DisplaySize', 'Toolbar']
        },
        toolbar: {
            container: [
                [{ 'header': [1, 2, 3, false] }],
                [{ 'font': [] }],
                [{ 'size': ['small', false, 'large', 'huge'] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'align': [] }],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                ['link', 'image'],
                ['clean']
            ],
            handlers: {
                image: quillImageUploadHandler,
                link: onLinkClick,
            },
        },
    }), [quillImageUploadHandler, onLinkClick]);

    const formats = useMemo(() => ([
        'header', 'font', 'size',
        'bold', 'italic', 'underline', 'strike',
        'align', 'list', 'bullet',
        'link', 'image',
        'width', 'height', 'style' 
    ]), []);

    return (
        <>
            <style>{quillEditorStyles}</style>
            <ReactQuill
                ref={ref}
                theme="snow"
                value={value}
                onChange={onChange}
                modules={modules}
                formats={formats}
                className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white admin-quill-editor"
            />
        </>
    );
});