const Article = require('../models/Article');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Helper function to shift orders when inserting at a specific position
async function shiftOrdersForInsertion(insertOrder) {
  try {
    // Find all articles with order >= insertOrder
    const articlesToShift = await Article.find({ order: { $gte: insertOrder } });
    
    // Increment their orders by 1
    for (const article of articlesToShift) {
      article.order = article.order + 1;
      await article.save();
    }
  } catch (error) {
    console.error('Error shifting orders:', error);
    throw error;
  }
}

// Helper function to download image from URL
async function downloadImage(imageUrl, uploadDir) {
  try {
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Download the image
    const response = await axios({
      method: 'GET',
      url: imageUrl,
      responseType: 'stream',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 30000 // 30 seconds timeout
    });

    // Determine file extension from content type or URL
    const contentType = response.headers['content-type'] || '';
    let extension = '.jpg';
    if (contentType.includes('png')) extension = '.png';
    else if (contentType.includes('gif')) extension = '.gif';
    else if (contentType.includes('webp')) extension = '.webp';
    else {
      // Try to get extension from URL
      const urlMatch = imageUrl.match(/\.(jpg|jpeg|png|gif|webp)/i);
      if (urlMatch) extension = urlMatch[0];
    }

    // Generate unique filename
    const filename = `facebook-image-${Date.now()}-${Math.round(Math.random() * 1E9)}${extension}`;
    const filepath = path.join(uploadDir, filename);

    // Save the file
    const writer = fs.createWriteStream(filepath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => resolve(`/media_content/uploads/${filename}`));
      writer.on('error', reject);
    });
  } catch (error) {
    console.error('Error downloading image:', error.message);
    throw new Error(`Failed to download image: ${error.message}`);
  }
}

// Helper function to extract image URLs from text
function extractImageUrls(text) {
  const imageUrlPattern = /(https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp|bmp))/gi;
  const urls = text.match(imageUrlPattern) || [];
  return [...new Set(urls)]; // Remove duplicates
}

// Helper function to extract video URLs from text
function extractVideoUrls(text) {
  const videoUrlPattern = /(https?:\/\/[^\s]+\.(mp4|mov|avi|webm|mkv))/gi;
  const facebookVideoPattern = /(https?:\/\/(www\.)?(facebook\.com|fb\.com)\/[^\s]+)/gi;
  const urls = [
    ...(text.match(videoUrlPattern) || []),
    ...(text.match(facebookVideoPattern) || [])
  ];
  return [...new Set(urls)]; // Remove duplicates
}

// Helper function to fetch Facebook post content from URL
async function fetchFacebookPostContent(facebookUrl) {
  try {
    // Use Facebook's oEmbed API or scrape the page
    // Note: Facebook has restrictions, so we'll try to extract Open Graph data
    const response = await axios.get(facebookUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      },
      timeout: 10000,
      maxRedirects: 5
    });

    const html = response.data;
    
    // Extract Open Graph metadata
    const ogTitleMatch = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i) || 
                         html.match(/<meta\s+name="og:title"\s+content="([^"]+)"/i);
    const ogDescriptionMatch = html.match(/<meta\s+property="og:description"\s+content="([^"]+)"/i) ||
                                html.match(/<meta\s+name="og:description"\s+content="([^"]+)"/i);
    const ogImageMatches = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/gi) ||
                           html.match(/<meta\s+name="og:image"\s+content="([^"]+)"/gi);
    
    // Extract images
    const images = [];
    if (ogImageMatches) {
      ogImageMatches.forEach(match => {
        const urlMatch = match.match(/content="([^"]+)"/i);
        if (urlMatch && urlMatch[1]) {
          images.push(urlMatch[1]);
        }
      });
    }
    
    // Extract video URLs (for reels/videos)
    const videoMatches = html.match(/<meta\s+property="og:video"\s+content="([^"]+)"/gi) ||
                        html.match(/<meta\s+property="og:video:url"\s+content="([^"]+)"/gi);
    const videos = [];
    if (videoMatches) {
      videoMatches.forEach(match => {
        const urlMatch = match.match(/content="([^"]+)"/i);
        if (urlMatch && urlMatch[1]) {
          videos.push(urlMatch[1]);
        }
      });
    }
    
    // Also try to extract video from video tags
    const videoTagMatches = html.match(/<video[^>]*src="([^"]+)"/gi);
    if (videoTagMatches) {
      videoTagMatches.forEach(match => {
        const urlMatch = match.match(/src="([^"]+)"/i);
        if (urlMatch && urlMatch[1]) {
          videos.push(urlMatch[1]);
        }
      });
    }
    
    // Try to extract video/reel URLs from Facebook embed patterns
    const facebookVideoPatterns = [
      /"video_id":"([^"]+)"/gi,
      /"videoUrl":"([^"]+)"/gi,
      /facebook\.com\/.*\/videos\/(\d+)/gi,
      /facebook\.com\/.*\/reel\/(\d+)/gi
    ];
    
    facebookVideoPatterns.forEach(pattern => {
      const matches = html.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const videoIdMatch = match.match(/(\d+)/);
          if (videoIdMatch) {
            // Construct Facebook video URL
            videos.push(`https://www.facebook.com/video.php?v=${videoIdMatch[1]}`);
          }
        });
      }
    });
    
    return {
      title: ogTitleMatch ? decodeURIComponent(ogTitleMatch[1].replace(/&quot;/g, '"').replace(/&#39;/g, "'")) : null,
      description: ogDescriptionMatch ? decodeURIComponent(ogDescriptionMatch[1].replace(/&quot;/g, '"').replace(/&#39;/g, "'")) : null,
      images: [...new Set(images)],
      videos: [...new Set(videos)]
    };
  } catch (error) {
    console.error('Error fetching Facebook post:', error.message);
    // Return null if scraping fails - user will need to provide content manually
    return null;
  }
}

// Import Facebook post
exports.importFacebookPost = async (req, res) => {
  try {
    const { facebookUrl, section } = req.body;

    if (!facebookUrl) {
      return res.status(400).json({ message: 'Facebook URL is required' });
    }

    // Try to automatically fetch content from Facebook URL
    let fetchedContent = null;
    let title = 'Facebook Post';
    let text = '';
    let allImageUrls = [];
    let allVideoUrls = [];
    
    if (facebookUrl) {
      console.log('Fetching content from Facebook URL:', facebookUrl);
      fetchedContent = await fetchFacebookPostContent(facebookUrl);
      
      if (fetchedContent) {
        title = fetchedContent.title || title;
        text = fetchedContent.description || text;
        allImageUrls = fetchedContent.images || [];
        allVideoUrls = fetchedContent.videos || [];
        console.log('Fetched content:', { title, text, images: allImageUrls.length, videos: allVideoUrls.length });
      } else {
        // If automatic fetch fails, use the Facebook URL as content
        // This allows the post to be embedded/shared even if we can't scrape it
        console.log('Could not automatically fetch content, using URL for embedding');
        text = `Shared from Facebook: ${facebookUrl}`;
        title = 'Facebook Post';
      }
    }
    
    // If we still don't have content, use the URL
    if (!text && facebookUrl) {
      text = `Shared from Facebook: ${facebookUrl}`;
    }

    // Extract Facebook post ID from URL if provided
    let facebookPostId = null;
    if (facebookUrl) {
      const urlMatch = facebookUrl.match(/\/posts\/([^\/\?]+)/) || facebookUrl.match(/\/permalink\/([^\/\?]+)/);
      if (urlMatch) {
        facebookPostId = urlMatch[1];
      }
    }

    // Extract hashtags from text
    let hashtagsArray = [];
    if (text) {
      // Extract hashtags from text (#hashtag format)
      const hashtagMatches = text.match(/#\w+/g);
      if (hashtagMatches) {
        hashtagsArray = hashtagMatches.map(tag => tag.replace('#', ''));
      }
    }
    
    // Also extract image URLs from text content if any
    if (text) {
      const extractedUrls = extractImageUrls(text);
      allImageUrls = [...allImageUrls, ...extractedUrls];
    }
    
    // Also extract video URLs from text content if any
    if (text) {
      const extractedVideoUrls = extractVideoUrls(text);
      allVideoUrls = [...allVideoUrls, ...extractedVideoUrls];
    }
    
    // Remove duplicates
    allImageUrls = [...new Set(allImageUrls)];
    allVideoUrls = [...new Set(allVideoUrls)];

    // Download images and save them locally
    const uploadDir = path.join(__dirname, '../media_content/uploads');
    const downloadedImages = [];
    
    for (const imageUrl of allImageUrls) {
      try {
        const localPath = await downloadImage(imageUrl, uploadDir);
        downloadedImages.push(localPath);
      } catch (error) {
        console.error(`Failed to download image ${imageUrl}:`, error.message);
        // Continue with other images even if one fails
        // Optionally, you could add the URL directly instead of downloading
        downloadedImages.push(imageUrl); // Fallback to URL if download fails
      }
    }

    // Default order is 0 for new Facebook posts
    const articleOrder = 0;
    
    // Shift existing orders when inserting at position 0
    await shiftOrdersForInsertion(articleOrder);

    const articleData = {
      title: title || 'Facebook Post',
      content: text || '',
      section: section || 'autre',
      published: false, // Default to draft
      featured: false,
      order: articleOrder,
      hashtags: hashtagsArray,
      source: 'facebook',
      facebookPostId: facebookPostId,
      images: downloadedImages
    };

    // Handle video/reel - use first video URL if available
    if (allVideoUrls.length > 0) {
      // Check if it's a Facebook video/reel URL
      const firstVideo = allVideoUrls[0];
      if (firstVideo.includes('facebook.com') || firstVideo.includes('fb.com') || firstVideo.includes('video.php')) {
        articleData.video = {
          type: 'facebook',
          url: firstVideo
        };
      } else {
        // For direct video URLs, use as file type
        articleData.video = {
          type: 'file',
          url: firstVideo
        };
      }
    }

    // Always create content blocks to properly organize text and media
    // This ensures text and media are properly shared and displayed
    const contentBlocks = [];
    let blockOrder = 0;

    // Add text block first if there's text
    if (text && text.trim()) {
      contentBlocks.push({
        type: 'text',
        content: text,
        order: blockOrder++
      });
    }

    // Add image blocks (interleaved with text if needed, but for now add after text)
    for (const imagePath of downloadedImages) {
      contentBlocks.push({
        type: 'image',
        mediaUrl: imagePath,
        order: blockOrder++
      });
    }

    // Add video blocks
    for (const videoUrl of allVideoUrls) {
      contentBlocks.push({
        type: 'video',
        mediaUrl: videoUrl,
        mediaType: 'facebook',
        order: blockOrder++
      });
    }

    // Set content blocks if we have any blocks, otherwise keep empty array
    if (contentBlocks.length > 0) {
      articleData.contentBlocks = contentBlocks;
    }

    const article = new Article(articleData);
    await article.save();

    res.status(201).json({
      message: 'Facebook post imported successfully',
      article,
      downloadedImages: downloadedImages.length,
      videosFound: allVideoUrls.length
    });
  } catch (error) {
    console.error('Error importing Facebook post:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

