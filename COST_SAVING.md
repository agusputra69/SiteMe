# Cost-Saving Features

## AI vs Basic Processing

SiteMe now offers two processing modes to help reduce costs:

### 🤖 AI Processing (Default)

- **Cost**: Uses Together.ai API credits
- **Accuracy**: High - AI-powered extraction
- **Features**:
  - Extracts all sections (experience, education, skills, certifications, etc.)
  - Handles complex resume formats
  - Better understanding of context
  - More accurate data extraction

### 💰 Basic Processing (Cost-Free)

- **Cost**: Free - no API calls
- **Accuracy**: Limited - pattern-based extraction
- **Features**:
  - Extracts basic information (name, email, phone, experience, education, skills)
  - Works with standard resume formats
  - Requires manual editing for best results
  - No API rate limits or costs

## How to Use

### Switching Processing Modes

1. **On Dashboard**: Use the toggle buttons to switch between AI and Basic processing
2. **Before Upload**: Select your preferred mode before uploading a PDF
3. **Automatic Fallback**: If AI processing fails, the system automatically falls back to basic processing

### When to Use Each Mode

#### Use AI Processing When:

- You want the most accurate results
- Your resume has complex formatting
- You need all sections extracted (certifications, languages, projects, awards)
- You have API credits available
- Accuracy is more important than cost

#### Use Basic Processing When:

- You want to save on API costs
- Your resume has standard formatting
- You're willing to do manual editing
- You're testing the system
- Cost is more important than accuracy

## Cost Comparison

| Feature                   | AI Processing        | Basic Processing                                    |
| ------------------------- | -------------------- | --------------------------------------------------- |
| **Cost per upload**       | ~$0.01-0.05          | Free                                                |
| **Accuracy**              | 90-95%               | 60-70%                                              |
| **Sections extracted**    | All                  | Basic + Certifications, Languages, Projects, Awards |
| **Manual editing needed** | Minimal              | Moderate                                            |
| **Rate limits**           | Yes (6 requests/min) | None                                                |

## Implementation Details

### Basic Processing Algorithm

The basic processing uses pattern matching to extract:

- **Name**: First prominent line
- **Email**: Regex pattern matching
- **Phone**: Regex pattern matching
- **Location**: Lines containing city, state, or country
- **Experience**: Lines with job patterns (title - company - duration)
- **Education**: Lines with degree patterns (degree - institution - year)
- **Skills**: Comma-separated or bullet-pointed lists
- **Summary**: Text under summary/objective sections
- **Certifications**: Lines under certification sections
- **Languages**: Comma-separated or bullet-pointed language lists
- **Projects**: Lines under project/portfolio sections
- **Awards**: Lines under award/achievement sections

### Fallback Mechanism

If AI processing fails due to:

- Rate limiting
- API errors
- Timeouts
- Network issues

The system automatically switches to basic processing and notifies the user.

## Benefits

1. **Cost Reduction**: Users can choose free processing
2. **Reliability**: Fallback ensures processing always works
3. **Flexibility**: Users can choose based on their needs
4. **Transparency**: Clear indication of which mode is being used
5. **No Lock-in**: Users can always edit manually after processing

## Future Enhancements

- Machine learning model for better basic processing
- Hybrid processing (AI for complex sections, basic for simple ones)
- User preference storage
- Processing quality metrics
- Batch processing options
