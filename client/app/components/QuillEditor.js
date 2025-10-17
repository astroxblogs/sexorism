'use client'

import React, { useMemo, useCallback, forwardRef, useRef, useEffect } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import ImageResize from 'quill-image-resize-module-react';
import api from '../lib/api';

// Register the module only once to prevent errors - only on client side
if (typeof window !== 'undefined' && typeof document !== 'undefined' && typeof Quill !== 'undefined' && Quill && !Quill.imports['modules/imageResize']) {
    Quill.register('modules/imageResize', ImageResize);
}

// --- CSS FIX for Resizing and Scrolling ---
const quillEditorStyles = `
  .admin-quill-editor .ql-container {
    overflow: hidden; /* Keeps image-resize handles contained */
    position: relative;
    border-bottom-left-radius: 0.5rem; /* Optional: rounds out the bottom corners */
    border-bottom-right-radius: 0.5rem;
    /* ✅ IMPORTANT: Ensure the overall container takes up vertical space */
    /* This might be necessary if parent containers restrict height */
    // min-height: 450px; /* Adjust this to match your desired editor height */ 
  }

  .admin-quill-editor .ql-editor {
    /* ✅ KEY FIX: Set both height and min-height to your desired fixed size */
    /* This creates a fixed-height scrollable area */
    height: auto; /* Explicitly set the height you want */
    // min-height: auto; /* Ensure it doesn't shrink */
    overflow-y: auto; /* Enable vertical scrolling */
    padding-bottom: 1rem; /* Add some padding at the bottom for better typing experience */
  }

  .admin-quill-editor .ql-editor img {
    max-width: 100%;
    height: auto;
    display: block;
  }
  .image-resize .handle {
    background-color: #3b82f6;
    border: 1px solid #fff;
    border-radius: 9999px;
    opacity: 0.8;
  }
  .image-resize .overlay {
    border-color: #3b82f6;
  }
`;

export const QuillEditor = forwardRef(({ value, onChange, onLinkClick }, ref) => {
    const internalRef = useRef(null);

    // Use internal ref if external ref is not provided
    const editorRef = ref || internalRef;

    const quillImageUploadHandler = useCallback(async () => {
        // Check if we're on the client side
        if (typeof window === 'undefined' || typeof document === 'undefined') {
            return;
        }

        // Check if internal ref is available before proceeding
        if (!editorRef || !editorRef.current) {
            console.error('QuillEditor ref not available for image upload');
            alert('Editor not ready. Please try again.');
            return;
        }

        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = async () => {
            if (!input.files || !input.files[0]) return;
            const file = input.files[0];

            // Wait for ref to be available and get editor
            let retries = 0;
            const maxRetries = 10;
            const retryDelay = 100;

            const getEditor = () => {
                return new Promise((resolve) => {
                    const checkEditor = () => {
                        // More comprehensive null checks using editorRef
                        if (editorRef && editorRef.current && typeof editorRef.current.getEditor === 'function') {
                            try {
                                const editor = editorRef.current.getEditor();
                                if (editor && typeof editor.getSelection === 'function') {
                                    resolve(editor);
                                    return;
                                }
                            } catch (error) {
                                console.warn('Error accessing editor:', error);
                            }
                        }

                        if (retries < maxRetries) {
                            retries++;
                            setTimeout(checkEditor, retryDelay);
                        } else {
                            console.error('Editor ref not available after retries - editorRef:', editorRef, 'editorRef.current:', editorRef?.current);
                            resolve(null);
                        }
                    };
                    checkEditor();
                });
            };

            const editor = await getEditor();
            if (!editor) {
                console.error('Failed to get editor instance');
                return;
            }

            const range = editor.getSelection(true);
            const cursorIndex = range ? range.index : editor.getLength();
            editor.insertText(cursorIndex, ' [Uploading image...] ', 'user');
            const formData = new FormData();
            formData.append('image', file);
            try {
                const res = await api.post('/admin/blogs/upload-image', formData, {
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

    const modules = useMemo(() => {
        // Only create modules if we're on the client side and Quill is available
        if (typeof window === 'undefined' || typeof document === 'undefined' || typeof Quill === 'undefined' || !Quill) {
            return {};
        }

        return {
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
        };
    }, [quillImageUploadHandler, onLinkClick]);

    const formats = useMemo(() => ([
        'header', 'font', 'size',
        'bold', 'italic', 'underline', 'strike',
        'align', 'list', 'bullet',
        'link', 'image',
        'width', 'height', 'style' 
    ]), []);

    // Handle ref forwarding
    useEffect(() => {
        if (ref && editorRef.current) {
            if (typeof ref === 'function') {
                ref(editorRef.current);
            } else {
                ref.current = editorRef.current;
            }
        }
    }, [ref, editorRef.current]);

    return (
        <>
            <style>{quillEditorStyles}</style>
            <ReactQuill
                ref={editorRef}
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