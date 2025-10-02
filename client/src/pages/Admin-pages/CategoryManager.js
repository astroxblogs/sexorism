import React, {useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import api from '../../services/Admin-service/api';

const CategoryManager = () => {
    // ✅ STEP 1: Add setValue and watch from react-hook-form
    const { register, handleSubmit, reset, setValue, watch } = useForm();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // ✅ STEP 2: Add state to manage editing mode
    const [editingCategory, setEditingCategory] = useState(null);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/admin/categories');
            setCategories(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching categories:', err);
            setError('Failed to fetch categories. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    // ✅ STEP 3: Populate the form when entering edit mode
    useEffect(() => {
        if (editingCategory) {
            setValue('name_en', editingCategory.name_en);
            setValue('name_hi', editingCategory.name_hi);
            setValue('metaTitle_en', editingCategory.metaTitle_en);
            setValue('metaTitle_hi', editingCategory.metaTitle_hi);
            setValue('metaDescription_en', editingCategory.metaDescription_en);
            setValue('metaDescription_hi', editingCategory.metaDescription_hi);
        } else {
            reset(); // Clear form when not editing
        }
    }, [editingCategory, setValue, reset]);


    const onSubmit = async (data) => {
        // ✅ STEP 4: Update the submit handler to handle both create and update
        const payload = {
            name_en: data.name_en,
            name_hi: data.name_hi,
            metaTitle_en: data.metaTitle_en,
            metaTitle_hi: data.metaTitle_hi,
            metaDescription_en: data.metaDescription_en,
            metaDescription_hi: data.metaDescription_hi,
        };

        try {
            if (editingCategory) {
                // Update existing category
                await api.put(`/api/admin/categories/${editingCategory._id}`, payload);
                alert('Category updated successfully!');
            } else {
                // Create new category
                await api.post('/api/admin/categories', payload);
                alert('Category added successfully!');
            }
            reset();
            setEditingCategory(null); // Exit edit mode
            fetchCategories(); // Refresh the list
        } catch (err) {
            console.error('Error saving category:', err);
            alert('Failed to save category: ' + (err.response?.data?.message || err.message));
        }
    };
    
    const handleCancelEdit = () => {
        setEditingCategory(null);
        reset();
    };

    const handleDelete = async (categoryId) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            try {
                await api.delete(`/api/admin/categories/${categoryId}`);
                alert('Category deleted successfully!');
                fetchCategories(); // Refresh the list
            } catch (err) {
                console.error('Error deleting category:', err);
                alert('Failed to delete category: ' + (err.response?.data?.message || err.message));
            }
        }
    };

    if (loading) {
        return <div className="text-center p-6 text-gray-500">Loading categories...</div>;
    }

    if (error) {
        return <div className="text-center p-6 text-red-500">Error: {error}</div>;
    }

    const watchedMetaTitleEn = watch('metaTitle_en');
    const watchedMetaDescEn = watch('metaDescription_en');
    const watchedMetaTitleHi = watch('metaTitle_hi');
    const watchedMetaDescHi = watch('metaDescription_hi');

    return (
        <div className="container mx-auto p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">Category Management</h2>

            {/* Form to Add or Edit Category */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
                <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">
                    {editingCategory ? 'Edit Category' : 'Add New Category'}
                </h3>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* English Fields */}
                    <div className="p-4 border rounded border-gray-200 dark:border-gray-700">
                         <h4 className="font-semibold text-gray-600 dark:text-gray-300 mb-2">English</h4>
                         <div className="space-y-4">
                            <div>
                                <label htmlFor="name_en" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category Name (English)</label>
                                <input type="text" id="name_en" {...register('name_en', { required: true })} className="mt-1 block w-full input-style" />
                            </div>
                            <div>
                                <label htmlFor="metaTitle_en" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Meta Title (English)</label>
                                <input type="text" id="metaTitle_en" {...register('metaTitle_en')} className="mt-1 block w-full input-style" />
                                <p className="text-xs text-gray-500 mt-1">Character count: {watchedMetaTitleEn?.length || 0} / 60</p>
                            </div>
                            <div>
                                <label htmlFor="metaDescription_en" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Meta Description (English)</label>
                                <textarea id="metaDescription_en" {...register('metaDescription_en')} rows="3" className="mt-1 block w-full input-style" />
                                <p className="text-xs text-gray-500 mt-1">Character count: {watchedMetaDescEn?.length || 0} / 160</p>
                            </div>
                         </div>
                    </div>
                    
                    {/* Hindi Fields */}
                     <div className="p-4 border rounded border-gray-200 dark:border-gray-700">
                         <h4 className="font-semibold text-gray-600 dark:text-gray-300 mb-2">Hindi</h4>
                         <div className="space-y-4">
                             <div>
                                <label htmlFor="name_hi" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category Name (Hindi)</label>
                                <input type="text" id="name_hi" {...register('name_hi')} className="mt-1 block w-full input-style" />
                            </div>
                             <div>
                                <label htmlFor="metaTitle_hi" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Meta Title (Hindi)</label>
                                <input type="text" id="metaTitle_hi" {...register('metaTitle_hi')} className="mt-1 block w-full input-style" />
                                <p className="text-xs text-gray-500 mt-1">Character count: {watchedMetaTitleHi?.length || 0} / 60</p>
                            </div>
                            <div>
                                <label htmlFor="metaDescription_hi" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Meta Description (Hindi)</label>
                                <textarea id="metaDescription_hi" {...register('metaDescription_hi')} rows="3" className="mt-1 block w-full input-style" />
                                 <p className="text-xs text-gray-500 mt-1">Character count: {watchedMetaDescHi?.length || 0} / 160</p>
                            </div>
                         </div>
                    </div>
                    
                    <div className="flex space-x-4">
                        <button type="submit" className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                             {editingCategory ? 'Update Category' : 'Add Category'}
                        </button>
                        {editingCategory && (
                            <button type="button" onClick={handleCancelEdit} className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">
                                Cancel Edit
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* List of Existing Categories */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">Existing Categories</h3>
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                    {categories.map((category) => (
                        <li key={category._id} className="flex justify-between items-center py-4">
                            <span className="text-lg text-gray-900 dark:text-gray-100">{category.name_en}</span>
                            {/* ✅ STEP 5: Add Edit and Delete buttons */}
                            <div className="space-x-4">
                               <button onClick={() => setEditingCategory(category)} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-500">
                                    Edit
                                </button>
                                <button onClick={() => handleDelete(category._id)} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-500">
                                    Delete
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

// Add a simple style for inputs to avoid repetition
const styles = `
    .input-style {
        display: block;
        width: 100%;
        border-radius: 0.375rem;
        border-width: 1px;
        border-color: #D1D5DB;
        box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    }
    .dark .input-style {
        background-color: #374151;
        border-color: #4B5563;
        color: #FFFFFF;
    }
    .input-style:focus {
        border-color: #3B82F6;
        --tw-ring-color: #3B82F6;
    }
`;
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);


export default CategoryManager;