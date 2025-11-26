// Test script to verify search API is working
async function testSearchAPI() {
    try {
        console.log('🔍 Testing search API...');

        const testQueries = ['health', 'technology', 'fashion'];

        for (const query of testQueries) {
            try {
                console.log(`\n📡 Testing search query: "${query}"`);
                const response = await fetch(`http://localhost:8081/api/blogs/search?q=${encodeURIComponent(query)}&page=1&limit=5`);
                const data = await response.json();

                console.log(` Status: ${response.status}`);
                console.log(`Total results: ${data.totalBlogs || 0}`);
                console.log(` Results count: ${data.blogs?.length || 0}`);

                if (data.blogs && data.blogs.length > 0) {
                    console.log(' Sample results:');
                    data.blogs.slice(0, 3).forEach(blog => {
                        console.log(`  - ${blog.title_en || blog.title} (${blog.category})`);
                    });
                }
            } catch (error) {
                console.log(` Error: ${error.message}`);
            }
        }

    } catch (error) {
        console.error('Test script error:', error);
    }
}

testSearchAPI();