require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('../models/Category');

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const seedCategories = [
  {
    name_en: "Technology",
    name_hi: "प्रौद्योगिकी",
    slug: "technology",
    metaTitle_en: "Technology Blogs - Latest Tech News and Insights",
    metaTitle_hi: "प्रौद्योगिकी ब्लॉग - नवीनतम तकनीकी समाचार और जानकारी",
    metaDescription_en: "Stay updated with the latest technology trends, gadgets, and innovations. Expert insights on AI, software development, and digital transformation.",
    metaDescription_hi: "नवीनतम प्रौद्योगिकी रुझानों, गैजेट्स और नवाचारों के साथ अपडेट रहें। AI, सॉफ्टवेयर विकास और डिजिटल परिवर्तन पर विशेषज्ञ जानकारी।"
  },
  {
    name_en: "Health & Wellness",
    name_hi: "स्वास्थ्य और कल्याण",
    slug: "health-&-wellness",
    metaTitle_en: "Health & Wellness Blogs - Tips for Healthy Living",
    metaTitle_hi: "स्वास्थ्य और कल्याण ब्लॉग - स्वस्थ जीवन के लिए टिप्स",
    metaDescription_en: "Discover practical tips for maintaining physical and mental health. Expert advice on nutrition, fitness, and wellness practices.",
    metaDescription_hi: "शारीरिक और मानसिक स्वास्थ्य बनाए रखने के लिए व्यावहारिक टिप्स खोजें। पोषण, फिटनेस और कल्याण प्रथाओं पर विशेषज्ञ सलाह।"
  },
  {
    name_en: "Travel",
    name_hi: "यात्रा",
    slug: "travel",
    metaTitle_en: "Travel Blogs - Explore Destinations and Travel Tips",
    metaTitle_hi: "यात्रा ब्लॉग - गंतव्य और यात्रा युक्तियां एक्सप्लोर करें",
    metaDescription_en: "Embark on virtual journeys through captivating travel stories. Discover hidden gems and practical travel advice from experienced explorers.",
    metaDescription_hi: "आकर्षक यात्रा कहानियों के माध्यम से आभासी यात्राओं पर निकलें। अनुभवी एक्सप्लोरर्स से छिपे हुए रत्नों और व्यावहारिक यात्रा सलाह की खोज करें।"
  },
  {
    name_en: "Fashion",
    name_hi: "फैशन",
    slug: "fashion",
    metaTitle_en: "Fashion Blogs - Latest Trends and Style Tips",
    metaTitle_hi: "फैशन ब्लॉग - नवीनतम रुझान और स्टाइल टिप्स",
    metaDescription_en: "Explore the latest fashion trends, styling tips, and wardrobe essentials. Stay ahead in the world of fashion and personal style.",
    metaDescription_hi: "नवीनतम फैशन रुझानों, स्टाइलिंग टिप्स और अलमारी आवश्यकताओं का पता लगाएं। फैशन और व्यक्तिगत स्टाइल की दुनिया में आगे रहें।"
  },
  {
    name_en: "Lifestyle",
    name_hi: "जीवनशैली",
    slug: "lifestyle",
    metaTitle_en: "Lifestyle Blogs - Modern Living and Personal Development",
    metaTitle_hi: "जीवनशैली ब्लॉग - आधुनिक जीवन और व्यक्तिगत विकास",
    metaDescription_en: "Enhance your lifestyle with practical advice on home, relationships, and personal growth. Discover the art of balanced living.",
    metaDescription_hi: "घर, रिश्तों और व्यक्तिगत विकास पर व्यावहारिक सलाह के साथ अपनी जीवनशैली में सुधार करें। संतुलित जीवन की कला की खोज करें।"
  },
  {
    name_en: "Food & Cooking",
    name_hi: "खाना और खाना बनाना",
    slug: "food-&-cooking",
    metaTitle_en: "Food & Cooking Blogs - Recipes and Culinary Tips",
    metaTitle_hi: "खाना और खाना बनाना ब्लॉग - व्यंजन और पाककला युक्तियां",
    metaDescription_en: "Delicious recipes, cooking techniques, and food inspiration. From quick meals to gourmet dishes, explore the world of culinary arts.",
    metaDescription_hi: "स्वादिष्ट व्यंजन, खाना बनाने की तकनीक और खाद्य प्रेरणा। त्वरित भोजन से लेकर गॉरमेट व्यंजनों तक, पाककला की दुनिया का पता लगाएं।"
  },
  {
    name_en: "Business & Finance",
    name_hi: "व्यापार और वित्त",
    slug: "business-&-finance",
    metaTitle_en: "Business & Finance Blogs - Financial Insights and Business Tips",
    metaTitle_hi: "व्यापार और वित्त ब्लॉग - वित्तीय जानकारी और व्यापार युक्तियां",
    metaDescription_en: "Navigate the world of business and finance with expert insights. Learn about investments, entrepreneurship, and financial planning.",
    metaDescription_hi: "विशेषज्ञ जानकारी के साथ व्यापार और वित्त की दुनिया में नेविगेट करें। निवेश, उद्यमिता और वित्तीय योजना के बारे में जानें।"
  },
  {
    name_en: "Sports",
    name_hi: "खेल",
    slug: "sports",
    metaTitle_en: "Sports Blogs - Latest Sports News and Analysis",
    metaTitle_hi: "खेल ब्लॉग - नवीनतम खेल समाचार और विश्लेषण",
    metaDescription_en: "Stay updated with the latest sports news, match analysis, and athlete stories. Coverage of various sports and sporting events.",
    metaDescription_hi: "नवीनतम खेल समाचार, मैच विश्लेषण और एथलीट कहानियों के साथ अपडेट रहें। विभिन्न खेलों और खेल आयोजनों की कवरेज।"
  },
  {
    name_en: "Relationship",
    name_hi: "रिश्ता",
    slug: "relationship",
    metaTitle_en: "Relationship Blogs - Love, Dating and Relationship Advice",
    metaTitle_hi: "रिश्ता ब्लॉग - प्यार, डेटिंग और रिश्ता सलाह",
    metaDescription_en: "Navigate the complexities of relationships with expert advice. Tips on communication, dating, and building meaningful connections.",
    metaDescription_hi: "विशेषज्ञ सलाह के साथ रिश्तों की जटिलताओं में नेविगेट करें। संचार, डेटिंग और सार्थक संबंध बनाने पर युक्तियां।"
  },
  {
    name_en: "Astrology",
    name_hi: "ज्योतिष",
    slug: "astrology",
    metaTitle_en: "Astrology Blogs - Horoscopes and Astrological Insights",
    metaTitle_hi: "ज्योतिष ब्लॉग - राशिफल और ज्योतिषीय जानकारी",
    metaDescription_en: "Explore the mystical world of astrology with daily horoscopes, zodiac insights, and celestial guidance for life decisions.",
    metaDescription_hi: "दैनिक राशिफल, राशि चक्र की जानकारी और जीवन निर्णयों के लिए खगोलीय मार्गदर्शन के साथ ज्योतिष की रहस्यमय दुनिया का पता लगाएं।"
  },
  {
    name_en: "Vastu Shastra",
    name_hi: "वास्तु शास्त्र",
    slug: "vastu-shastra",
    metaTitle_en: "Vastu Shastra Blogs - Ancient Wisdom for Modern Living",
    metaTitle_hi: "वास्तु शास्त्र ब्लॉग - आधुनिक जीवन के लिए प्राचीन ज्ञान",
    metaDescription_en: "Discover the ancient Indian science of architecture and design. Learn how to harmonize your living spaces for peace and prosperity.",
    metaDescription_hi: "वास्तुकला और डिजाइन की प्राचीन भारतीय विज्ञान की खोज करें। शांति और समृद्धि के लिए अपने रहने की जगहों को सामंजस्य करने का तरीका जानें।"
  },
  {
    name_en: "Trends",
    name_hi: "रुझान",
    slug: "trends",
    metaTitle_en: "Trends Blogs - What's Hot and Happening Now",
    metaTitle_hi: "रुझान ब्लॉग - क्या गर्म और क्या हो रहा है अब",
    metaDescription_en: "Stay ahead of the curve with insights into current trends. From cultural shifts to emerging patterns across various domains.",
    metaDescription_hi: "वर्तमान रुझानों में अंतर्दृष्टि के साथ कर्व से आगे रहें। सांस्कृतिक बदलावों से लेकर विभिन्न डोमेन में उभरती हुई पैटर्न तक।"
  }
];

async function seed() {
  try {
   
    // Insert new categories
    await Category.insertMany(seedCategories);
    console.log('✅ Categories seeded successfully!');

    console.log('\n📋 Created Categories:');
    seedCategories.forEach(cat => {
      console.log(`  - ${cat.name_en} (${cat.name_hi}) - Slug: ${cat.slug}`);
    });

  } catch (error) {
    console.error('❌ Error during category seeding:', error);
  } finally {
    mongoose.disconnect();
  }
}

seed();