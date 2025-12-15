const Article = require('../models/Article');
const Section = require('../models/Section');

// Admin dashboard stats
exports.getStats = async (req, res) => {
  try {
    const totalArticles = await Article.countDocuments();
    const publishedArticles = await Article.countDocuments({ published: true });
    const sections = await Section.countDocuments();
    
    // Get article counts by section
    const articlesBySectionData = await Article.aggregate([
      {
        $group: {
          _id: '$section',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get all sections to ensure we show all of them
    const allSections = await Section.find().sort({ order: 1 });
    
    // Create a map of section name to article count
    const sectionCountMap = {};
    articlesBySectionData.forEach(item => {
      sectionCountMap[item._id] = item.count;
    });
    
    // Build articlesBySection array with all sections, including those with 0 articles
    const articlesBySection = allSections.map(section => ({
      _id: section._id,
      section: section.name,
      sectionTitle: section.title,
      count: sectionCountMap[section.name] || 0,
      visible: section.visible
    }));
    
    // Also include sections that have articles but might not be in the Section collection
    articlesBySectionData.forEach(item => {
      const sectionExists = allSections.some(s => s.name === item._id);
      if (!sectionExists) {
        articlesBySection.push({
          _id: null,
          section: item._id,
          sectionTitle: item._id.charAt(0).toUpperCase() + item._id.slice(1),
          count: item.count,
          visible: false
        });
      }
    });
    
    // Sort by section order, then by count descending
    articlesBySection.sort((a, b) => {
      const sectionA = allSections.find(s => s.name === a.section);
      const sectionB = allSections.find(s => s.name === b.section);
      const orderA = sectionA ? sectionA.order : 999;
      const orderB = sectionB ? sectionB.order : 999;
      if (orderA !== orderB) return orderA - orderB;
      return b.count - a.count;
    });
    
    res.json({
      totalArticles,
      publishedArticles,
      draftArticles: totalArticles - publishedArticles,
      sections,
      articlesBySection
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

