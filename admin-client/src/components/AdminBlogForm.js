import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import 'react-quill/dist/quill.snow.css';

import { QuillEditor } from './QuillEditor';
import { LinkDialog } from './LinkDialog';

const LANGUAGES = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'Hindi' },
];

const AdminBlogForm = ({ blog, onSave, onCancel }) => {
    const { register, handleSubmit, reset, setValue, watch } = useForm();
    const [activeLang, setActiveLang] = useState('en');
    const [contents, setContents] = useState(() => {
        const initialContents = {};
        LANGUAGES.forEach(lang => {
            initialContents[lang.code] = '';
        });
        return initialContents;
    });
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
                const response = await api.get('/api/admin/categories');
                setCategories(response.data);
                setLoadingCategories(false);
            } catch (error) {
                console.error('Error fetching categories:', error);
                setCategoriesError('Failed to fetch categories.');
                setLoadingCategories(false);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        if (blog) {
            reset(blog);
            const newContents = {};
            LANGUAGES.forEach(lang => {
                setValue(`title_${lang.code}`, blog[`title_${lang.code}`] || '');
                newContents[lang.code] = blog[`content_${lang.code}`] || '';
                
                // ✅ STEP 1: Populate the new SEO and Excerpt fields when editing a blog
                setValue(`excerpt_${lang.code}`, blog[`excerpt_${lang.code}`] || '');
                setValue(`metaTitle_${lang.code}`, blog[`metaTitle_${lang.code}`] || '');
                setValue(`metaDescription_${lang.code}`, blog[`metaDescription_${lang.code}`] || '');
            });
            setValue('title', blog.title || '');
            newContents['en'] = newContents['en'] || blog.content || '';
            setContents(newContents);
            setValue('image', blog.image || '');
            
            if (blog.tags && Array.isArray(blog.tags)) {
                setValue('tags', blog.tags.join(', '));
            } else {
                setValue('tags', '');
            }

            setSelectedFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        } else {
            reset({
                title: '', image: '', tags: '',
                category: categories[0]?.name_en || ''
            });
            const clearedContents = {};
            LANGUAGES.forEach(lang => clearedContents[lang.code] = '');
            setContents(clearedContents);
            setActiveLang('en');
            setSelectedFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    }, [blog, reset, setValue, categories]);

    const handleContentChange = (value) => {
        setContents(prev => ({ ...prev, [activeLang]: value }));
    };

    const extractFirstImageUrl = (htmlContent) => {
        if (!htmlContent) return null;
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');
        const img = doc.querySelector('img');
        return img ? img.src : null;
    };

    const handleFileChange = (event) => {
        if (event.target.files && event.target.files[0]) {
            setSelectedFile(event.target.files[0]);
            setValue('image', '');
        } else {
            setSelectedFile(null);
        }
    };

    const uploadMainCoverImage = async () => {
        if (!selectedFile) return;
        setUploadingImage(true);
        const formData = new FormData();
        formData.append('image', selectedFile);
        try {
            const res = await api.post('/api/admin/blogs/upload-image', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setValue('image', res.data.imageUrl);
            setSelectedFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
            alert('Main cover image uploaded successfully!');
        } catch (error) {
            alert('Error uploading main cover image: ' + (error.response?.data?.error || error.message));
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
        if (selectedLength > 0) {
            editor.deleteText(insertIndex, selectedLength, 'user');
        }
        editor.insertText(insertIndex, text, 'user');
        editor.formatText(insertIndex, text.length, 'link', url, 'user');
        editor.setSelection(insertIndex + text.length, 0, 'user');
        setLinkDialogOpen(false);
    }, [linkDialogRange]);

    const onSubmit = async (data) => {
        const tags = typeof data.tags === 'string' ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [];
        let finalImageUrl = data.image;
        if (!finalImageUrl && !selectedFile) {
            finalImageUrl = extractFirstImageUrl(contents.en);
        }
        if (finalImageUrl) {
            finalImageUrl = finalImageUrl.trim();
        }
        const payload = {
            image: finalImageUrl,
            tags,
            category: data.category,
            title: data.title_en || data.title,
            content: contents.en || data.content,
        };
        LANGUAGES.forEach(lang => {
            payload[`title_${lang.code}`] = data[`title_${lang.code}`];
            payload[`content_${lang.code}`] = contents[lang.code];
            
            // ✅ STEP 2: Add the new SEO and Excerpt data to the payload on submit
            payload[`excerpt_${lang.code}`] = data[`excerpt_${lang.code}`];
            payload[`metaTitle_${lang.code}`] = data[`metaTitle_${lang.code}`];
            payload[`metaDescription_${lang.code}`] = data[`metaDescription_${lang.code}`];
        });
        
        try {
            const res = blog
                ? await api.put(`/api/admin/blogs/${blog._id}`, payload)
                : await api.post('/api/admin/blogs', payload);
            onSave(res.data);
            reset();
            const clearedContents = {};
            LANGUAGES.forEach(lang => clearedContents[lang.code] = '');
            setContents(clearedContents);
        } catch (error) {
            alert('Error saving blog: ' + (error.response?.data?.error || error.message));
        }
    };

    // Watch for changes in meta fields to show character count
    const watchedMetaTitle = watch(`metaTitle_${activeLang}`);
    const watchedMetaDescription = watch(`metaDescription_${activeLang}`);

    return (
        <>
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="mb-8 bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow flex flex-col gap-4 max-w-4xl mx-auto"
            >
                {/* Language Selection Tabs */}
                <div className="flex justify-center border-b border-gray-200 dark:border-gray-700">
                    {LANGUAGES.map(lang => (
                        <button
                            key={lang.code} type="button" onClick={() => setActiveLang(lang.code)}
                            className={`px-4 py-2 text-sm font-medium ${activeLang === lang.code ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'} focus:outline-none transition-colors duration-200`}
                        >
                            {lang.name}
                        </button>
                    ))}
                </div>

                {/* Main Cover Image Section */}
                <div className="flex flex-col gap-2">
                    <label className="block font-medium text-sm text-gray-700 dark:text-gray-300">Main Cover Image</label>
                    <input className="border border-gray-300 dark:border-gray-700 p-2 rounded w-full text-gray-900 dark:text-white bg-white dark:bg-gray-700" placeholder="Paste Image URL" {...register('image')} />
                    <div className="flex items-center gap-2">
                        <input type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} className="block w-full text-sm text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-300 dark:hover:file:bg-blue-800" />
                        {selectedFile && (
                            <button type="button" onClick={uploadMainCoverImage} disabled={uploadingImage} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0">
                                {uploadingImage ? 'Uploading...' : 'Upload Image'}
                            </button>
                        )}
                    </div>
                    {watch('image') && (
                        <div className="mt-2 text-center"><img src={watch('image')} alt="Cover Preview" className="max-h-48 object-contain mx-auto rounded-md shadow-md" /></div>
                    )}
                </div>

                <input className="border border-gray-300 dark:border-gray-700 p-2 rounded w-full text-gray-900 dark:text-white bg-white dark:bg-gray-700" placeholder="Tags (comma separated)" {...register('tags')} />

                {loadingCategories ? <div className="text-gray-500 dark:text-gray-400">Loading categories...</div>
                    : categoriesError ? <div className="text-red-500 dark:text-red-400">{categoriesError}</div>
                    : (
                        <select className="border border-gray-300 dark:border-gray-700 p-2 rounded w-full text-gray-900 dark:text-white bg-white dark:bg-gray-700" {...register('category', { required: true })}>
                            {categories.map((category) => (
                                <option key={category.slug} value={category.name_en}>{category.name_en}</option>
                            ))}
                        </select>
                    )
                }

                {LANGUAGES.map(lang => (
                    activeLang === lang.code && (
                        <div key={lang.code} className="space-y-2">
                            <input className="border border-gray-300 dark:border-gray-700 p-2 rounded w-full text-gray-900 dark:text-white bg-white dark:bg-gray-700" placeholder={`Title (${lang.name})`} {...register(`title_${lang.code}`, { required: lang.code === 'en' })} />
                            <div>
                                <label className="block font-medium text-sm mb-1 text-gray-700 dark:text-gray-300">Content ({lang.name})</label>
                                <QuillEditor
                                    ref={quillRef}
                                    value={contents[lang.code]}
                                    onChange={handleContentChange}
                                    onLinkClick={openLinkDialog}
                                />
                            </div>
                        </div>
                    )
                ))}

                {/* ✅ STEP 3: Add the new form section for SEO and Excerpt fields */}
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">SEO & Excerpt ({LANGUAGES.find(l => l.code === activeLang).name})</h3>
                    {LANGUAGES.map(lang => (
                        activeLang === lang.code && (
                            <div key={lang.code} className="space-y-4">
                                <div>
                                    <label htmlFor={`excerpt_${lang.code}`} className="block font-medium text-sm text-gray-700 dark:text-gray-300">Excerpt</label>
                                    <textarea
                                        id={`excerpt_${lang.code}`}
                                        {...register(`excerpt_${lang.code}`)}
                                        placeholder="A short summary of the post for blog listing pages."
                                        rows="3"
                                        className="mt-1 border border-gray-300 dark:border-gray-700 p-2 rounded w-full text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                                    />
                                </div>
                                <div>
                                    <label htmlFor={`metaTitle_${lang.code}`} className="block font-medium text-sm text-gray-700 dark:text-gray-300">Meta Title</label>
                                    <input
                                        id={`metaTitle_${lang.code}`}
                                        {...register(`metaTitle_${lang.code}`)}
                                        placeholder="An SEO-friendly title for search engine results (around 60 characters)."
                                        className="mt-1 border border-gray-300 dark:border-gray-700 p-2 rounded w-full text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                                    />
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        Character count: {watchedMetaTitle?.length || 0} / 60
                                    </p>
                                </div>
                                <div>
                                    <label htmlFor={`metaDescription_${lang.code}`} className="block font-medium text-sm text-gray-700 dark:text-gray-300">Meta Description</label>
                                    <textarea
                                        id={`metaDescription_${lang.code}`}
                                        {...register(`metaDescription_${lang.code}`)}
                                        placeholder="A compelling description for search engine results (around 160 characters)."
                                        rows="4"
                                        className="mt-1 border border-gray-300 dark:border-gray-700 p-2 rounded w-full text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                                    />
                                     <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        Character count: {watchedMetaDescription?.length || 0} / 160
                                    </p>
                                </div>
                            </div>
                        )
                    ))}
                </div>

                <div className="flex justify-end items-center space-x-4 pt-4 mt-4 border-t">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-6 py-3 border border-transparent rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                    >
                        {blog ? 'Update Blog' : 'Submit Blog'}
                    </button>
                </div>
            </form>

            <LinkDialog
                isOpen={linkDialogOpen}
                onClose={() => setLinkDialogOpen(false)}
                onConfirm={confirmInsertLink}
                initialText={linkInitialText}
            />
        </>
    );
};

export default AdminBlogForm;