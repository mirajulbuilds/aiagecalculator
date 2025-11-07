# Celebrity Profile Generator - User Guide

## Overview
This system allows you to generate AI-powered, original celebrity-style profiles with 800+ word biographies using Google Gemini. The generated content is ad-safe, SEO-optimized, and ready to be added to your Famous Birthdays database.

## How to Use

### Step 1: Access the Generator
Navigate to `/celebrity-generator` in your browser to access the profile generation tool.

### Step 2: Fill in Basic Information
Enter the following details for the celebrity you want to create:
- **Full Name**: e.g., "Ariana Vale"
- **Profession**: e.g., "Singer-Songwriter"
- **Birth Date**: Select from date picker
- **Birth Place**: e.g., "Los Angeles, CA"
- **Country**: e.g., "United States"

### Step 3: Generate Profile
Click the "Generate Profile" button. The AI will create:
- ✅ **About section**: 800-1000 word comprehensive biography
- ✅ **Before Fame**: Early life and background (100-150 words)
- ✅ **Trivia**: 3 interesting facts in bullet points
- ✅ **Family Life**: Family background and relationships (100-150 words)
- ✅ **Associated With**: Collaborators and connections (100-150 words)

### Step 4: Review Generated Content
The tool will display:
- Word count for the About section (should be 800+)
- All generated sections formatted and ready
- Preview of all content

### Step 5: Download JSON
Click the "Download JSON" button to get a complete JSON file with:
- All generated content
- Basic profile information
- Placeholder image path
- Social media link structure
- Default popularity score

### Step 6: Add to Your Database

#### Option A: Manual Addition
1. Open `src/data/explore_famous_birthdays.json`
2. Add the downloaded JSON content to the `celebrities` array
3. Update the following fields:
   - `image`: Replace `/placeholder.svg` with actual image path
   - `country_code`: Set the correct 2-letter country code (e.g., "us", "gb")
   - `birth_sign`: Set the zodiac sign
   - `popularity_score`: Adjust based on actual popularity (0-1000)
   - `trending`: Set to `true` or `false`
   - Social media links: Update with real URLs

#### Option B: Batch Import
If you have multiple profiles, you can add them all at once to the JSON file.

## Content Structure

### Generated JSON Format
```json
{
  "id": "celebrity-name",
  "slug": "celebrity-name",
  "name": "Celebrity Name",
  "profession": "Profession",
  "birthdate": "YYYY-MM-DD",
  "birthplace": "City, State",
  "country": "Country Name",
  "birth_sign": "Zodiac Sign",
  "country_code": "XX",
  "about": "800+ word biography...",
  "before_fame": "Early life paragraph...",
  "trivia": [
    "Fact 1",
    "Fact 2",
    "Fact 3"
  ],
  "family_life": "Family background paragraph...",
  "associated_with": "Professional connections paragraph...",
  "excerpt": "Brief summary...",
  "image": "/path/to/image.jpg",
  "social_links": {
    "instagram": "https://instagram.com/...",
    "twitter": "https://twitter.com/...",
    "youtube": "https://youtube.com/..."
  },
  "popularity_score": 500,
  "trending": false
}
```

## Image Guidelines

### Adding Celebrity Images
1. Add image files to `src/assets/celebrities/`
2. Use the naming convention: `celebrity-name.jpg`
3. Recommended size: 800x800px minimum
4. Supported formats: JPG, PNG, WebP
5. Update the `image` field in JSON to: `/src/assets/celebrities/celebrity-name.jpg`

### Image Best Practices
- Use high-quality, properly licensed images
- Maintain consistent aspect ratios across profiles
- Optimize file sizes for web (under 500KB recommended)
- Use descriptive alt text in the image field

## SEO Optimization

### Auto-Generated SEO Fields
The system automatically generates:
- Meta descriptions
- OpenGraph tags
- Structured data (JSON-LD)
- Canonical URLs

### Manual SEO Enhancements
You can add these optional fields to enhance SEO:
```json
{
  "meta_description": "Custom meta description",
  "og_title": "Custom OG title",
  "og_description": "Custom OG description",
  "keywords": ["keyword1", "keyword2"]
}
```

## Rate Limits & Costs

### Lovable AI Credits
- Each generation consumes API credits
- Rate limit: Check your workspace settings
- If rate limited (429 error): Wait and retry
- If credits exhausted (402 error): Add credits to workspace

### Managing Costs
- Generate profiles in batches during off-peak hours
- Review and reuse similar profiles when appropriate
- Only generate when you have complete information

## Troubleshooting

### Generation Fails
**Error 429**: Rate limit exceeded
- Solution: Wait 1-2 minutes and retry

**Error 402**: Payment required
- Solution: Add credits to your Lovable workspace

**Invalid JSON**: AI returned unparseable content
- Solution: Retry generation or check input data

### About Section Too Short
If the about section has fewer than 800 words:
- The system will warn you in the console
- You can regenerate or manually expand the content
- Most generations will meet the 800+ word requirement

### Missing Sections
If any required section is missing:
- The generator will show an error
- Retry the generation
- Verify all input fields are filled correctly

## Best Practices

### Content Quality
1. ✅ Use realistic, believable information
2. ✅ Maintain professional tone throughout
3. ✅ Ensure content is Google Ads-friendly (no controversial topics)
4. ✅ Verify accuracy of factual details
5. ✅ Keep content engaging and informative

### Batch Generation
When creating multiple profiles:
1. Prepare a list of celebrities with all required info
2. Generate one at a time to avoid rate limits
3. Save each JSON file with descriptive names
4. Review content quality before bulk import
5. Update images and details after import

### Maintenance
- Regularly update popularity scores based on trends
- Refresh outdated information in older profiles
- Add new social media links as they become available
- Update "Associated With" sections with recent collaborations

## Example Workflow

1. **Research**: Gather celebrity information
2. **Generate**: Use the tool to create profile
3. **Review**: Check content quality and accuracy
4. **Download**: Save JSON file locally
5. **Enhance**: Add real image and update details
6. **Import**: Add to `explore_famous_birthdays.json`
7. **Test**: View profile at `/celebrity/slug-name`
8. **Publish**: Deploy changes to production

## Support

If you encounter issues:
1. Check console logs for errors
2. Verify API credits in workspace settings
3. Review edge function logs in backend dashboard
4. Ensure all required fields are filled
5. Test with a simple profile first

## Future Enhancements

Potential improvements:
- Bulk import from CSV
- Auto-fetch images from URLs
- Social media profile scraping
- Popularity score calculator
- Category auto-assignment
- Related celebrity suggestions
