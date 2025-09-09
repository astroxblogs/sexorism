import React, { useState, useEffect } from 'react';

// --- Using a NAMED export to match the import in AdminBlogForm.js ---
export const LinkDialog = ({ isOpen, onClose, onConfirm, initialText }) => {
    const [text, setText] = useState('');
    const [url, setUrl] = useState('https://');

    useEffect(() => {
        if (isOpen) {
            setText(initialText);
            setUrl('https://');
        }
    }, [isOpen, initialText]);

    if (!isOpen) {
        return null;
    }

    const handleConfirm = () => {
        if (text.trim() && url.trim() !== 'https://') {
            onConfirm(text, url);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 w-full max-w-md">
                <h4 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">Insert Link</h4>
                <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Display Text</label>
                    <input
                        className="border border-gray-300 dark:border-gray-700 p-2 rounded w-full text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="e.g., Read more"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL</label>
                    <input
                        className="border border-gray-300 dark:border-gray-700 p-2 rounded w-full text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://example.com"
                    />
                </div>
                <div className="flex gap-2 justify-end">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200">Cancel</button>
                    <button type="button" onClick={handleConfirm} className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white">Insert</button>
                </div>
            </div>
        </div>
    );
};

