'use client'

import React, { useEffect, useState, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useForm } from 'react-hook-form';
import api from '../lib/api';
import 'react-quill/dist/quill.snow.css';
import { LinkDialog } from './LinkDialog';

const QuillEditor = dynamic(() => import('./QuillEditor').then(mod => ({ default: mod.QuillEditor })), {
  ssr: false,
  loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-md"></div>,
});

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
];

const AdminBlogForm = ({ blog, onSave, onCancel }) => {
  const { register, handleSubmit, reset, setValue, watch } = useForm();
  const [activeLang, setActiveLang] = useState('en');
  const [contents, setContents] = useState(() => Object.fromEntries(LANGUAGES.map(l => [l.code, ''])));
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);
  const quillRef = useRef(null);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoriesError, setCategoriesError] = useState(null);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkDialogRange, setLinkDialogRange] = useState(null);
  const [linkInitialText, setLinkInitialText] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const response = await api.get('/admin/categories');
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategoriesError('Failed to fetch categories.');
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (blog) {
      reset(blog);
      LANGUAGES.forEach(lang => {
        setValue(`title_${lang.code}`, blog[`title_${lang.code}`] || '');
        setValue(`excerpt_${lang.code}`, blog[`excerpt_${lang.code}`] || '');
        setValue(`metaTitle_${lang.code}`, blog[`metaTitle_${lang.code}`] || '');
        setValue(`metaDescription_${lang.code}`, blog[`metaDescription_${lang.code}`] || '');
      });
      setValue('title', blog.title || '');
      setContents(Object.fromEntries(LANGUAGES.map(l => [l.code, blog[`content_${l.code}`] || ''])));
      setValue('image', blog.image || '');
    } else {
      reset({
        title: '',
        image: '',
        category: categories[0]?.name_en || '',
      });
      setContents(Object.fromEntries(LANGUAGES.map(l => [l.code, ''])));
      setActiveLang('en');
    }
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [blog, categories, reset, setValue]);

  const handleContentChange = (value) => setContents(prev => ({ ...prev, [activeLang]: value }));

  const extractFirstImageUrl = (htmlContent) => {
    if (!htmlContent) return null;
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const img = doc.querySelector('img');
    return img ? img.src : null;
  };

  const handleFileChange = (e) => {
    if (e.target.files?.[0]) {
      setSelectedFile(e.target.files[0]);
      setValue('image', '');
    } else setSelectedFile(null);
  };

  const uploadMainCoverImage = async () => {
    if (!selectedFile) return;
    setUploadingImage(true);
    const formData = new FormData();
    formData.append('image', selectedFile);
    try {
      const res = await api.post('/admin/blogs/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setValue('image', res.data.imageUrl);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      alert('Main cover image uploaded successfully!');
    } catch (error) {
      alert('Error uploading image: ' + (error.response?.data?.error || error.message));
    } finally {
      setUploadingImage(false);
    }
  };

  const openLinkDialog = useCallback(() => {
    const editor = quillRef.current?.getEditor();
    if (!editor) return;
    const range = editor.getSelection(true) || { index: editor.getLength(), length: 0 };
    const defaultText = editor.getText(range.index, range.length) || '';
    setLinkDialogRange(range);
    setLinkInitialText(defaultText || 'link');
    setLinkDialogOpen(true);
  }, []);

  const confirmInsertLink = useCallback((text, url) => {
    const editor = quillRef.current?.getEditor();
    if (!editor || !linkDialogRange) return;
    const insertIndex = linkDialogRange.index;
    const selectedLength = linkDialogRange.length || 0;
    if (selectedLength > 0) editor.deleteText(insertIndex, selectedLength, 'user');
    editor.insertText(insertIndex, text, 'user');
    editor.formatText(insertIndex, text.length, 'link', url, 'user');
    editor.setSelection(insertIndex + text.length, 0, 'user');
    setLinkDialogOpen(false);
  }, [linkDialogRange]);

  const onSubmit = async (data) => {
    let finalImageUrl = data.image || extractFirstImageUrl(contents.en);
    if (finalImageUrl) finalImageUrl = finalImageUrl.trim();
    const payload = {
      image: finalImageUrl,
      category: data.category,
      title: data.title_en || data.title,
      content: contents.en || data.content,
    };
    LANGUAGES.forEach(lang => {
      payload[`title_${lang.code}`] = data[`title_${lang.code}`];
      payload[`content_${lang.code}`] = contents[lang.code];
      payload[`excerpt_${lang.code}`] = data[`excerpt_${lang.code}`];
      payload[`metaTitle_${lang.code}`] = data[`metaTitle_${lang.code}`];
      payload[`metaDescription_${lang.code}`] = data[`metaDescription_${lang.code}`];
    });
    try {
      const res = blog
        ? await api.put(`/admin/blogs/${blog._id}`, payload)
        : await api.post('/admin/blogs', payload);
      onSave(res.data);
      reset();
      setContents(Object.fromEntries(LANGUAGES.map(l => [l.code, ''])));
    } catch (error) {
      alert('Error saving blog: ' + (error.response?.data?.error || error.message));
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="mb-8 bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow flex flex-col gap-4 max-w-4xl mx-auto">
        <div className="flex justify-center border-b border-gray-200 dark:border-gray-700">
          {LANGUAGES.map(lang => (
            <button key={lang.code} type="button" onClick={() => setActiveLang(lang.code)}
              className={`px-4 py-2 text-sm font-medium ${activeLang === lang.code ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'}`}>
              {lang.name}
            </button>
          ))}
        </div>

        {/* Cover Image Upload */}
        <div className="flex flex-col gap-2">
          <label className="block font-medium text-sm text-gray-700 dark:text-gray-300">Main Cover Image</label>
          <input className="border border-gray-300 dark:border-gray-700 p-2 rounded w-full" placeholder="Paste Image URL" {...register('image')} />
          <div className="flex items-center gap-2">
            <input type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef}
              className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
            {selectedFile && (
              <button type="button" onClick={uploadMainCoverImage} disabled={uploadingImage}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-semibold transition-colors disabled:opacity-50">
                {uploadingImage ? 'Uploading...' : 'Upload Image'}
              </button>
            )}
          </div>
          {watch('image') && (
            <div className="mt-2 text-center"><img src={watch('image')} alt="Cover Preview" className="max-h-48 object-contain mx-auto rounded-md shadow-md" /></div>
          )}
        </div>

        {loadingCategories ? (
          <div className="text-gray-500 dark:text-gray-400">Loading categories...</div>
        ) : categoriesError ? (
          <div className="text-red-500 dark:text-red-400">{categoriesError}</div>
        ) : (
          <select className="border border-gray-300 dark:border-gray-700 p-2 rounded w-full" {...register('category', { required: true })}>
            {categories.map((category) => (
              <option key={category.slug} value={category.name_en}>{category.name_en}</option>
            ))}
          </select>
        )}

        {LANGUAGES.map(lang => (
          activeLang === lang.code && (
            <div key={lang.code} className="space-y-2">
              <input className="border p-2 rounded w-full" placeholder={`Title (${lang.name})`} {...register(`title_${lang.code}`, { required: lang.code === 'en' })} />
              <div>
                <label className="block font-medium text-sm mb-1">Content ({lang.name})</label>
                <QuillEditor ref={quillRef} value={contents[lang.code]} onChange={handleContentChange} onLinkClick={openLinkDialog} />
              </div>
            </div>
          )
        ))}

        {/* SEO Section */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4">SEO & Excerpt ({LANGUAGES.find(l => l.code === activeLang).name})</h3>
          {LANGUAGES.map(lang => (
            activeLang === lang.code && (
              <div key={lang.code} className="space-y-4">
                <div>
                  <label htmlFor={`excerpt_${lang.code}`} className="block font-medium text-sm">Excerpt</label>
                  <textarea id={`excerpt_${lang.code}`} {...register(`excerpt_${lang.code}`)} rows="3" className="mt-1 border p-2 rounded w-full" />
                </div>
                <div>
                  <label htmlFor={`metaTitle_${lang.code}`} className="block font-medium text-sm">Meta Title</label>
                  <input id={`metaTitle_${lang.code}`} {...register(`metaTitle_${lang.code}`)} className="mt-1 border p-2 rounded w-full" />
                </div>
                <div>
                  <label htmlFor={`metaDescription_${lang.code}`} className="block font-medium text-sm">Meta Description</label>
                  <textarea id={`metaDescription_${lang.code}`} {...register(`metaDescription_${lang.code}`)} rows="4" className="mt-1 border p-2 rounded w-full" />
                </div>
              </div>
            )
          ))}
        </div>

        <div className="flex justify-end items-center space-x-4 pt-4 mt-4 border-t">
          <button type="button" onClick={onCancel} className="px-6 py-3 border rounded-lg text-sm font-medium">Cancel</button>
          <button type="submit" className="px-6 py-3 border-none rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700">
            {blog ? 'Update Blog' : 'Submit Blog'}
          </button>
        </div>
      </form>

      <LinkDialog isOpen={linkDialogOpen} onClose={() => setLinkDialogOpen(false)} onConfirm={confirmInsertLink} initialText={linkInitialText} />
    </>
  );
};

export default AdminBlogForm;
