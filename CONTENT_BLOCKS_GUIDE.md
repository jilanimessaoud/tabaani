# Content Blocks and Article Ordering Guide

## New Features

### 1. Content Blocks System
Admins can now create articles with inline media using a content blocks system that allows:
- **Text blocks**: Regular text content
- **Image blocks**: Insert images within the content
- **Video blocks**: Insert videos (file, YouTube, or Facebook) within the content

This allows for layouts like: Text → Image → Text → Video → Text

### 2. Article Viewer Updates
- **Content First**: Article content (with inline blocks) displays first
- **Media at Bottom**: Standalone images and videos appear at the bottom in a gallery section
- **Better Layout**: Cleaner separation between content and media

### 3. Article Ordering
- **Drag & Drop**: Reorder articles within sections
- **Newest First**: By default, new articles appear first (negative timestamp)
- **Manage Order Tab**: Dedicated interface for managing article positions
- **Section Filtering**: Filter articles by section when managing order

## How to Use Content Blocks

### Creating an Article with Content Blocks

1. **Open Article Editor**: Click "Create New Article" or edit an existing article
2. **Enable Content Blocks**: Toggle "Use Content Blocks (Text/Image/Video)" switch
3. **Add Blocks**: 
   - Click "+ Add Text" for text content
   - Click "+ Add Image" to insert an image
   - Click "+ Add Video" to insert a video
4. **Reorder Blocks**: Drag blocks up or down to reorder them
5. **Upload Media First**: 
   - Upload images in the "Pictures" section
   - Upload videos in the "Video" section
   - Then select them in content blocks
6. **Save**: Click "Create Article" or "Update Article"

### Content Block Types

#### Text Block
- Enter text content in the textarea
- Supports multiple paragraphs
- Can be placed anywhere in the sequence

#### Image Block
- Select from uploaded images
- Images must be uploaded first in the "Pictures" section
- Preview shows selected image
- Can be removed and replaced

#### Video Block
- Choose video type: Uploaded File, YouTube, or Facebook
- For uploaded videos: Select from uploaded files
- For YouTube/Facebook: Paste the URL
- Preview available for YouTube/Facebook links

## Managing Article Order

### Using the Order Manager

1. **Navigate to Order Tab**: In Admin Articles, click "Manage Order" tab
2. **Filter by Section**: Select a section or "All Sections"
3. **Drag & Drop**: Drag articles to reorder them
4. **Auto-Save**: Order updates automatically when you drag
5. **Newest First**: Articles are sorted by order (descending) - newest appear first

### Default Order Behavior

- **New Articles**: Automatically get order = -Date.now() (negative timestamp)
- **Newest First**: Negative values mean newest articles appear first
- **Manual Override**: You can set custom order values in the article form

### Order Values

- **Negative values**: Newer articles (appear first)
- **Positive values**: Older articles (appear later)
- **Lower numbers**: Appear before higher numbers when sorted descending

## Article Display

### Public View
- Articles sorted by `order` descending (newest first)
- Content blocks render in order
- Standalone images/videos appear at bottom

### Admin View
- All articles visible (published and drafts)
- Same ordering as public view
- Quick toggle for publish status

## Tips

1. **Upload Media First**: Upload images and videos before adding them to content blocks
2. **Use Content Blocks for Layout**: Create rich layouts with text, images, and videos mixed
3. **Use Standalone Media for Gallery**: Use the Pictures/Video sections for a gallery at the bottom
4. **Reorder Frequently**: Use drag-and-drop to keep important articles at the top
5. **Save Order**: Order changes save automatically when dragging

## Technical Details

### Content Blocks Structure
```javascript
{
  type: 'text' | 'image' | 'video',
  content: String,        // For text blocks
  mediaUrl: String,        // For image/video blocks
  mediaType: String,      // For video: 'file' | 'youtube' | 'facebook'
  order: Number          // Display order
}
```

### Article Order
- Default: `-Date.now()` (negative timestamp)
- Sorting: `order: -1` (descending) = newest first
- Manual: Can set any number value

### Backward Compatibility
- Articles without content blocks use the old `content` field
- Standalone images/videos still work for gallery display
- Both systems can coexist

