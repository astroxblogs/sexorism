import React, { useMemo, useCallback, forwardRef } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import ImageResize from 'quill-image-resize-module-react';
import api from '../services/api';

// Register the module only once
if (typeof window !== 'undefined' && Quill && !Quill.imports['modules/imageResize']) {
    Quill.register('modules/imageResize', ImageResize);
}

export const QuillEditor = forwardRef(({ value, onChange, onLinkClick }, ref) => {

    const quillImageUploadHandler = useCallback(() => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = async () => {
            const file = input.files[0];
            if (!file) return;

            const editor = ref.current?.getEditor();
            if (!editor) {
                console.error('Quill editor instance not found.');
                return;
            }

            // --- THIS IS THE FIX ---
            // We get the precise cursor position BEFORE we do anything else.
            const range = editor.getSelection(true);
            const cursorIndex = range ? range.index : editor.getLength();
            
            // Insert a visual placeholder so the user knows something is happening.
            editor.insertText(cursorIndex, ' [Uploading image...] ', 'user');
            
            const formData = new FormData();
            formData.append('image', file);
            
            try {
                const res = await api.post('/api/admin/blogs/upload-image', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                const imageUrl = res.data.imageUrl;
                
                // CRITICAL FIX: Instead of letting React re-render, we directly manipulate
                // the editor's content. This is the standard, safe way to work with Quill.
                // We remove the placeholder text and insert the image at the exact same spot.
                editor.deleteText(cursorIndex, 22, 'user'); // 22 is the length of " [Uploading image...] "
                editor.insertEmbed(cursorIndex, 'image', imageUrl, 'user');
                
                // Move the cursor to be after the newly inserted image.
                editor.setSelection(cursorIndex + 1, 0, 'user');

            } catch (error) {
                console.error('Error uploading image to backend for Quill:', error);
                alert('Error uploading image: ' + (error.response?.data?.error || error.message));
                // Clean up the placeholder text if the upload fails.
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
        'link', 'image', 'width' 
    ]), []);

    return (
        <ReactQuill
            ref={ref}
            theme="snow"
            value={value}
            onChange={onChange}
            modules={modules}
            formats={formats}
            className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white admin-quill-editor"
        />
    );
});

