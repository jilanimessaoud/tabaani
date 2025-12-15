const Section = require('../models/Section');

// Helper function to ensure "autre" section is always last
const ensureAutreIsLast = async () => {
  const autreSection = await Section.findOne({ name: 'autre' });
  if (!autreSection) return;

  // Get all sections except "autre", sorted by order
  const otherSections = await Section.find({ name: { $ne: 'autre' } }).sort({ order: 1 });
  
  // Find the maximum order among other sections
  const maxOrder = otherSections.length > 0 
    ? Math.max(...otherSections.map(s => s.order))
    : -1;
  
  // Set "autre" order to be maxOrder + 1 (always last)
  if (autreSection.order !== maxOrder + 1) {
    autreSection.order = maxOrder + 1;
    await autreSection.save();
  }
};

// Helper function to reorganize section orders
const reorganizeOrders = async (excludeSectionId = null) => {
  // Get all sections except the one being updated and "autre"
  const sections = await Section.find({
    _id: { $ne: excludeSectionId },
    name: { $ne: 'autre' }
  }).sort({ order: 1 });
  
  // Reassign orders sequentially starting from 0
  for (let i = 0; i < sections.length; i++) {
    if (sections[i].order !== i) {
      sections[i].order = i;
      await sections[i].save();
    }
  }
  
  // Ensure "autre" is always last
  await ensureAutreIsLast();
};

// Initialize default sections
const initializeSections = async () => {
  const sections = await Section.find();
  if (sections.length === 0) {
    const defaultSections = [
      { name: 'tourism', title: 'Tourism', description: 'Tourism articles', order: 0 },
      { name: 'culture', title: 'Culture', description: 'Culture articles', order: 1 },
      { name: 'environment', title: 'Environment', description: 'Environment articles', order: 2 },
      { name: 'autre', title: 'Other', description: 'Other articles', order: 3 }
    ];
    await Section.insertMany(defaultSections);
  } else {
    // Ensure "autre" is last even after initialization
    await ensureAutreIsLast();
  }
};

// Get all sections (public)
exports.getPublicSections = async (req, res) => {
  try {
    await initializeSections();
    const sections = await Section.find({ visible: true }).sort({ order: 1 });
    res.json(sections);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all sections (admin)
exports.getAllSections = async (req, res) => {
  try {
    await initializeSections();
    const sections = await Section.find().sort({ order: 1 });
    res.json(sections);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create section
exports.createSection = async (req, res) => {
  try {
    const { name, title, titleFr, titleEn, titleAr, description, order, visible } = req.body;
    
    if (!name || !title) {
      return res.status(400).json({ message: 'Name and title are required' });
    }

    // Check if section with same name already exists
    const existingSection = await Section.findOne({ name: name.toLowerCase().trim() });
    if (existingSection) {
      return res.status(400).json({ message: 'Section with this name already exists' });
    }

    // Get the "autre" section
    const autreSection = await Section.findOne({ name: 'autre' });
    
    // Get max order from other sections (excluding "autre")
    const otherSections = await Section.find({ name: { $ne: 'autre' } }).sort({ order: -1 });
    const maxOrder = otherSections.length > 0 ? otherSections[0].order : -1;
    
    // Determine the order for the new section
    let sectionOrder = order;
    if (sectionOrder === undefined || sectionOrder === null) {
      // If no order provided, place it before "autre"
      sectionOrder = maxOrder + 1;
    } else {
      // If order is provided, ensure it's not greater than or equal to "autre" order
      if (autreSection && sectionOrder >= autreSection.order) {
        sectionOrder = autreSection.order;
      }
    }

    const section = new Section({
      name: name.toLowerCase().trim(),
      title,
      titleFr: titleFr || '',
      titleEn: titleEn || '',
      titleAr: titleAr || '',
      description: description || '',
      order: sectionOrder,
      visible: visible !== undefined ? visible : true
    });

    await section.save();
    
    // Reorganize orders and ensure "autre" is last
    await reorganizeOrders();
    
    // Fetch updated section with correct order
    const updatedSection = await Section.findById(section._id);
    res.status(201).json(updatedSection);
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Section with this name already exists' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update section
exports.updateSection = async (req, res) => {
  try {
    const { name, title, titleFr, titleEn, titleAr, description, order, visible } = req.body;
    const section = await Section.findById(req.params.id);
    
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }

    // Prevent updating "autre" section's order directly
    if (section.name === 'autre' && order !== undefined && order !== section.order) {
      return res.status(400).json({ message: 'Cannot change the order of "Other" section. It must always be last.' });
    }

    // Check if name is being changed and if new name already exists
    if (name && name.toLowerCase().trim() !== section.name) {
      // Prevent renaming to "autre"
      if (name.toLowerCase().trim() === 'autre') {
        return res.status(400).json({ message: 'Cannot rename section to "autre". This name is reserved.' });
      }
      const existingSection = await Section.findOne({ name: name.toLowerCase().trim() });
      if (existingSection) {
        return res.status(400).json({ message: 'Section with this name already exists' });
      }
      section.name = name.toLowerCase().trim();
    }

    const oldOrder = section.order;
    const orderChanged = order !== undefined && order !== section.order;

    if (title) section.title = title;
    if (titleFr !== undefined) section.titleFr = titleFr;
    if (titleEn !== undefined) section.titleEn = titleEn;
    if (titleAr !== undefined) section.titleAr = titleAr;
    if (description !== undefined) section.description = description;
    if (order !== undefined && section.name !== 'autre') {
      // Get "autre" section to ensure new order doesn't exceed it
      const autreSection = await Section.findOne({ name: 'autre' });
      if (autreSection && order >= autreSection.order) {
        return res.status(400).json({ message: `Order cannot be greater than or equal to ${autreSection.order} (Other section order). Other section must always be last.` });
      }
      section.order = order;
    }
    if (visible !== undefined) section.visible = visible;

    await section.save();
    
    // If order was changed, reorganize all sections
    if (orderChanged) {
      await reorganizeOrders(section._id);
      // Fetch updated section
      const updatedSection = await Section.findById(section._id);
      return res.json(updatedSection);
    }
    
    // Ensure "autre" is still last (in case of other changes)
    await ensureAutreIsLast();
    
    res.json(section);
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Section with this name already exists' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete section
exports.deleteSection = async (req, res) => {
  try {
    const section = await Section.findById(req.params.id);
    
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }

    // Prevent deleting "autre" section
    if (section.name === 'autre') {
      return res.status(400).json({ message: 'Cannot delete "Other" section. It is a required section.' });
    }

    await section.deleteOne();
    
    // Reorganize orders after deletion
    await reorganizeOrders();
    
    res.json({ message: 'Section deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

