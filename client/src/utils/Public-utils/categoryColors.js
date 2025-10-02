// Returns Tailwind classes for category chip background and text colors
export const getCategoryClasses = (categoryName = '') => {
    const key = String(categoryName).toLowerCase();
    const map = {
        'technology': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
        'fashion': 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
        'health': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
        'health & wellness': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
        'travel': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
        'food & cooking': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
        'sports': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
        'business & finance': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
        'lifestyle': 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
        'trends': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
        'relationship': 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
        'astrology': 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300'
    };
    return map[key] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
};


