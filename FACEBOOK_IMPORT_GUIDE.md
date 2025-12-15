# Facebook Post Import and Filtering Guide

## New Features

### 1. Facebook Post Import
Admins can now import Facebook posts directly into the application:
- Import text content from Facebook posts
- Import Facebook videos
- Add title and hashtags
- Optional category assignment
- Automatic hashtag extraction from text

### 2. Hashtag Support
- Add hashtags to articles
- Filter articles by hashtag
- Hashtags displayed in article list
- Automatic extraction from Facebook posts

### 3. Advanced Filtering
- Filter by title (search)
- Filter by hashtag
- Filter by section/category
- Real-time filtering with debounce

### 4. Optional Category
- Articles can be created without a category
- Category is now optional (not required)
- Better organization flexibility

## How to Use

### Importing Facebook Posts

1. **Click "📘 Import Facebook Post"** button in the admin articles page
2. **Fill in the form:**
   - Facebook Post URL (optional): Paste the Facebook post URL
   - Title (required): Enter a title for the post
   - Text Content (required): Paste the Facebook post text
   - Video URL (optional): If the post has a video, paste the video URL
   - Hashtags (optional): Enter hashtags separated by commas
   - Category (optional): Select a category or leave empty
3. **Click "Import Post"**
4. The post will be imported as a draft article

### Adding Hashtags to Articles

#### When Creating/Editing Articles:
1. Open the article form
2. Find the "Hashtags (Optional)" field
3. Enter hashtags separated by commas
   - Example: `news, culture, event`
   - The `#` symbol is optional
4. Hashtags will be automatically formatted

#### Automatic Extraction:
- When importing from Facebook, hashtags in the text (format: `#hashtag`) are automatically extracted
- You can also add additional hashtags manually

### Filtering Articles

#### In Admin Panel:
1. Use the **Filter Articles** card at the top
2. **Search by Title**: Enter any part of the title
3. **Filter by Hashtag**: Enter a hashtag (without #)
4. **Filter by Section**: Select a section or "All Sections"
5. Filters work together (AND logic)
6. Click "Clear Filters" to reset

#### Filter Features:
- **Real-time**: Filters update automatically as you type (with 500ms debounce)
- **Case-insensitive**: Searches are not case-sensitive
- **Partial matching**: Title search matches partial text
- **Hashtag matching**: Finds articles containing the hashtag

## Article Display

### In Article List:
- **Hashtags**: Displayed as badges (shows first 3, then "+X more")
- **Source Badge**: Facebook posts show a "Facebook" badge
- **Category**: Shows category or "No category" if none

### In Article Detail:
- Hashtags can be displayed (if you add this feature to the viewer)

## Technical Details

### Facebook Import API
```
POST /api/facebook/import
Body: {
  facebookUrl: String (optional),
  title: String (required),
  text: String (required),
  videoUrl: String (optional),
  hashtags: String (optional),
  section: String (optional)
}
```

### Article Model Updates
- `hashtags`: Array of strings
- `source`: 'manual' or 'facebook'
- `facebookPostId`: Facebook post identifier
- `section`: Now optional (can be null)

### Filtering API
```
GET /api/articles?title=search&hashtag=tag&section=tourism
```

## Examples

### Importing a Facebook Post

**Facebook Post:**
```
Title: "New Cultural Event"
Text: "Join us for an amazing cultural event! #culture #event #heritage"
Video: https://www.facebook.com/video/...
```

**Import Form:**
- Title: "New Cultural Event"
- Text: "Join us for an amazing cultural event! #culture #event #heritage"
- Video URL: (paste video URL)
- Hashtags: (auto-extracted: culture, event, heritage)
- Category: Culture (optional)

### Adding Hashtags Manually

When creating an article:
- Hashtags field: `tourism, travel, adventure`
- Result: Article tagged with `tourism`, `travel`, `adventure`

### Filtering Examples

1. **Find all articles with "festival" in title:**
   - Title filter: `festival`

2. **Find all articles with "culture" hashtag:**
   - Hashtag filter: `culture`

3. **Find culture articles with "event" hashtag:**
   - Section: Culture
   - Hashtag: event

## Tips

1. **Facebook Import**: 
   - Copy the post text directly from Facebook
   - Extract hashtags from the text automatically
   - Add video URL if the post contains a video

2. **Hashtags**:
   - Use descriptive hashtags for better organization
   - Separate multiple hashtags with commas
   - The # symbol is optional (will be added automatically)

3. **Filtering**:
   - Use specific hashtags for better results
   - Combine filters for precise searches
   - Clear filters to see all articles

4. **Categories**:
   - Articles don't need a category
   - Use categories for organization
   - Facebook posts can be imported without categories

