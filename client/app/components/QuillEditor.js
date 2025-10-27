'use client'

import React, { useMemo, useCallback, forwardRef, useRef, useEffect, useState } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import ImageResize from 'quill-image-resize-module-react';
import api from '../lib/api';

// Register image resize once
if (typeof window !== 'undefined' && typeof document !== 'undefined' && typeof Quill !== 'undefined' && Quill && !Quill.imports['modules/imageResize']) {
  Quill.register('modules/imageResize', ImageResize);
}

/* ---------- Custom HTML5 <video> blot (for mp4/webm/ogg) ---------- */
const BlockEmbed = Quill.import('blots/block/embed');
class Html5VideoBlot extends BlockEmbed {
  static create(value) {
    const node = super.create();
    const src = typeof value === 'string' ? value : (value?.src || '');
    if (src) node.setAttribute('src', src);
    if (value?.poster) node.setAttribute('poster', value.poster);
    node.setAttribute('controls', '');
    node.setAttribute('playsinline', '');
    node.setAttribute('preload', 'metadata');
    node.classList.add('ql-html5video');
    return node;
  }
  static value(node) {
    return { src: node.getAttribute('src') || '', poster: node.getAttribute('poster') || '' };
  }
}
Html5VideoBlot.blotName = 'html5video';
Html5VideoBlot.tagName  = 'VIDEO';
Html5VideoBlot.className = 'ql-html5video';
if (!Quill.imports['formats/html5video']) Quill.register(Html5VideoBlot);

/* ---------- Helpers ---------- */
const parseTimeToSeconds = (t) => {
  if (!t) return '';
  if (/^\d+$/.test(t)) return t;
  const m = /(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?/.exec(t);
  if (!m) return '';
  const h = parseInt(m[1] || '0', 10);
  const mm = parseInt(m[2] || '0', 10);
  const s = parseInt(m[3] || '0', 10);
  return String(h * 3600 + mm * 60 + s);
};

// YouTube/Vimeo -> iframe embed src
const getVideoEmbedSrc = (rawUrl) => {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  let url;
  try { url = new URL(rawUrl.trim()); } catch { return null; }
  const host = url.hostname.replace(/^www\./, '').toLowerCase();

  // YouTube
  if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtu.be' || host === 'youtube-nocookie.com') {
    if (host === 'youtu.be') {
      const id = url.pathname.split('/').filter(Boolean)[0];
      if (!id) return null;
      const t = url.searchParams.get('t');
      return `https://www.youtube-nocookie.com/embed/${id}${t ? `?start=${parseTimeToSeconds(t)}` : ''}`;
    }
    const v = url.searchParams.get('v');
    if (v) {
      const t = url.searchParams.get('t');
      return `https://www.youtube-nocookie.com/embed/${v}${t ? `?start=${parseTimeToSeconds(t)}` : ''}`;
    }
    const parts = url.pathname.split('/').filter(Boolean);
    const idx = parts.indexOf('embed');
    if (idx >= 0 && parts[idx + 1]) return `https://www.youtube-nocookie.com/embed/${parts[idx + 1]}`;
  }

  // Vimeo
  if (host === 'vimeo.com' || host === 'player.vimeo.com') {
    const parts = url.pathname.split('/').filter(Boolean);
    const id = parts[0] && /^\d+$/.test(parts[0]) ? parts[0] : (parts[1] && /^\d+$/.test(parts[1]) ? parts[1] : null);
    if (id) return `https://player.vimeo.com/video/${id}`;
    const vidIdx = parts.indexOf('video');
    if (vidIdx >= 0 && parts[vidIdx + 1]) return `https://player.vimeo.com/video/${parts[vidIdx + 1]}`;
  }
  return null;
};

// Basic file-type sniff by extension
const isDirectMediaFile = (u) => /\.(mp4|webm|ogg)(\?|#|$)/i.test(u || '');

/* ---------- Small in-editor modal (replaces window.prompt) ---------- */
const UrlDialog = ({ open, onCancel, onSubmit }) => {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');

  useEffect(() => {
    if (open) {
      setUrl('');
      setTitle('');
      // focus first input on open
      setTimeout(() => {
        const el = document.getElementById('qe-url-input');
        if (el) el.focus();
      }, 0);
    }
  }, [open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md p-4">
        <h3 className="text-lg font-semibold mb-3 dark:text-white">Insert Link or Video</h3>
        <label className="block text-sm mb-1 dark:text-gray-200">URL</label>
        <input
          id="qe-url-input"
          className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 mb-3 outline-none"
          placeholder="https://..."
          value={url}
          onChange={(e) => setUrl(e.target.value.trim())}
        />
        <label className="block text-sm mb-1 dark:text-gray-200">Link Title (for normal website links)</label>
        <input
          className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 mb-4 outline-none"
          placeholder="e.g., Official site"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <div className="flex gap-2 justify-end">
          <button className="px-3 py-2 rounded-md bg-gray-200 dark:bg-gray-700 dark:text-white" onClick={onCancel}>Cancel</button>
          <button
            className="px-3 py-2 rounded-md bg-blue-600 text-white"
            onClick={() => onSubmit({ url, title: title.trim() })}
            disabled={!url}
          >
            Insert
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-3 dark:text-gray-400">
          • YouTube/Vimeo URLs embed a player. • .mp4/.webm/.ogg embed an inline HTML5 video. • Other URLs create a normal link using the title.
        </p>
      </div>
    </div>
  );
};

/* ---------- Styles (keep your existing + size limits) ---------- */
const quillEditorStyles = `
  .admin-quill-editor .ql-container {
    overflow: hidden;
    position: relative;
    border-bottom-left-radius: 0.5rem;
    border-bottom-right-radius: 0.5rem;
  }
  .admin-quill-editor .ql-editor {
    height: auto;
    overflow-y: auto;
    padding-bottom: 1rem;
  }
  .admin-quill-editor .ql-editor img {
    max-width: 100%;
    height: auto;
    display: block;
  }
  .image-resize .handle { background-color: #3b82f6; border: 1px solid #fff; border-radius: 9999px; opacity: 0.8; }
  .image-resize .overlay { border-color: #3b82f6; }

  /* Responsive embeds (shrink preview) */
  .admin-quill-editor .ql-editor .ql-video,
  .admin-quill-editor .ql-editor .ql-html5video {
    display: block;
    width: 100%;
    max-width: 720px;
    height: auto;
    aspect-ratio: 16 / 9;
    margin: 1rem auto;
    border-radius: 0.75rem;
  }
`;

export const QuillEditor = forwardRef(({ value, onChange, onLinkClick }, ref) => {
  const internalRef = useRef(null);
  const editorRef = ref || internalRef;

  const [linkOpen, setLinkOpen] = useState(false);

  /* ----- Image upload (unchanged) ----- */
  const quillImageUploadHandler = useCallback(async () => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
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

      let retries = 0;
      const maxRetries = 10;
      const retryDelay = 100;

      const getEditor = () =>
        new Promise((resolve) => {
          const checkEditor = () => {
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
              console.error('Editor ref not available after retries');
              resolve(null);
            }
          };
          checkEditor();
        });

      const editor = await getEditor();
      if (!editor) return;

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

  /* ----- New smart link flow using a modal (doesn't disappear on tab switch) ----- */
  const openLinkDialog = useCallback(() => setLinkOpen(true), []);
  const closeLinkDialog = useCallback(() => setLinkOpen(false), []);

  const handleInsertFromDialog = useCallback(({ url, title }) => {
    const quill = editorRef?.current?.getEditor?.();
    if (!quill || !url) { closeLinkDialog(); return; }

    const range = quill.getSelection(true) || { index: quill.getLength(), length: 0 };

    // 1) YouTube/Vimeo -> iframe embed
    const embedSrc = getVideoEmbedSrc(url);
    if (embedSrc) {
      quill.insertEmbed(range.index, 'video', embedSrc, 'user');
      quill.setSelection(range.index + 1, 0, 'user');
      closeLinkDialog();
      return;
    }

    // 2) Direct media file -> HTML5 <video>
    if (isDirectMediaFile(url)) {
      quill.insertEmbed(range.index, 'html5video', { src: url }, 'user');
      quill.setSelection(range.index + 1, 0, 'user');
      closeLinkDialog();
      return;
    }

    // 3) Normal external link with optional title
    if (!range.length) {
      const text = title || url;
      quill.insertText(range.index, text, 'user');
      quill.setSelection(range.index, text.length, 'user');
    }
    quill.format('link', url);
    const after = quill.getSelection();
    if (after) quill.setSelection(after.index + (after.length || 0), 0, 'user');

    closeLinkDialog();
  }, [editorRef, closeLinkDialog]);

  /* ----- Paste handler: auto-embed YT/Vimeo or direct media; otherwise let it paste ----- */
  useEffect(() => {
    const quill = editorRef?.current?.getEditor?.();
    if (!quill) return;

    const onPaste = (e) => {
      const text = (e.clipboardData || window.clipboardData)?.getData('text');
      const val = (text || '').trim();
      const src = getVideoEmbedSrc(val);
      const asMedia = isDirectMediaFile(val);
      if (!src && !asMedia) return; // non-video: let Quill handle normally

      e.preventDefault();
      const range = quill.getSelection(true);
      const index = range ? range.index : quill.getLength();
      if (src) quill.insertEmbed(index, 'video', src, 'user');
      else quill.insertEmbed(index, 'html5video', { src: val }, 'user');
      quill.setSelection(index + 1, 0, 'user');
    };

    quill.root.addEventListener('paste', onPaste);
    return () => quill.root.removeEventListener('paste', onPaste);
  }, [editorRef]);

  /* ----- Quill config ----- */
  const modules = useMemo(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined' || typeof Quill === 'undefined' || !Quill) return {};
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
          ['link', 'image'],         // toolbar unchanged
          ['clean']
        ],
        handlers: {
          image: quillImageUploadHandler,
          link: openLinkDialog,      // open our modal (no disappearing)
        },
      },
    };
  }, [quillImageUploadHandler, openLinkDialog]);

  const formats = useMemo(() => ([
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'align', 'list', 'bullet',
    'link', 'image',
    'video', 'html5video', // allow both iframe and html5 video
    'width', 'height', 'style'
  ]), []);

  // Forward ref
  useEffect(() => {
    if (ref && editorRef.current) {
      if (typeof ref === 'function') ref(editorRef.current);
      else ref.current = editorRef.current;
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
      {/* Modal */}
      <UrlDialog
        open={linkOpen}
        onCancel={closeLinkDialog}
        onSubmit={handleInsertFromDialog}
      />
    </>
  );
});
