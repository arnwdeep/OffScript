# Off Script
## AI-powered content memory, audience intelligence, and short-form creation

**Working tagline:** Find what's next in what you've already made.

**Track:** Media — Content Repurposing Studio with Brand Memory  
**Project type:** Hackathon MVP  
**Status:** Proposed product concept

---

## 1. Executive summary

Off Script is an AI-powered workspace for creators. It builds a searchable memory of the creator's existing content, analyses audience feedback to discover topics the audience wants but the creator has not adequately covered, and turns relevant moments from existing long-form videos or podcasts into short-form clips.

Instead of treating content storage, audience research, and video editing as separate jobs, Off Script connects them in one workflow:

1. **Remember:** Understand and index what the creator has already published.
2. **Discover:** Compare the creator's content library with audience questions and interests to identify content gaps.
3. **Create:** Recommend new content and generate short clips from relevant existing footage.
4. **Learn:** Use creator feedback and performance data to improve future recommendations.

The central product idea is not simply “make more clips.” It is to help creators make more relevant content by understanding both their publishing history and their audience.

## 2. The problem

Creators often have a large back catalogue of videos, podcasts, posts, and scripts. Over time, it becomes difficult to remember:

- Which topics have already been covered.
- Where a particular explanation or discussion appeared.
- Which questions have already been answered.
- What their audience repeatedly asks for.
- Which subjects are missing or underdeveloped.
- Which existing moments could be reused as short-form content.

Creators therefore spend time manually searching old material, reading comments, brainstorming ideas, and editing clips. They may also repeat topics while overlooking audience demand.

## 3. The solution

Off Script combines three connected capabilities.

### A. Creator memory — searchable content archive

The platform turns a creator's content library into a searchable knowledge base.

**Inputs**
- Video files and audio recordings.
- Podcast episodes and interviews.
- Transcripts and scripts.
- Blog posts and captions.
- Imported content metadata and links, where supported.

**What it does**
- Transcribes audio and video.
- Splits transcripts into timestamped segments.
- Identifies topics, entities, questions, and key takeaways.
- Stores content metadata and searchable text.
- Supports natural-language search across the creator's library.
- Returns relevant source items with timestamps and evidence.
- Stores creator preferences and brand-voice examples, with user control.

**Example query:** “Find every time I explained Python projects.”

**Example result:** A list of relevant videos, short excerpts, and timestamps where the topic appears.

### B. Audience intelligence and content-gap detection

This module analyses audience feedback and compares it with the creator's existing content.

**Inputs**
- Exported comments (for example, CSV files).
- Audience questions and feedback supplied by the creator.
- Poll results or survey responses.
- Platform analytics exports, where available.

**What it does**
- Groups similar comments into themes.
- Extracts recurring questions and requests.
- Estimates topic demand from the supplied feedback.
- Compares audience topics with topics already covered.
- Identifies topics that are missing, lightly covered, or already covered well.
- Explains why each suggested opportunity was identified.

**Example:** Viewers repeatedly ask for beginner Python projects, but the creator's library mainly contains Python basics. Off Script flags “beginner Python projects” as a possible content gap.

**Important:** A content gap is an evidence-based opportunity, not a guarantee of views or growth. The interface should show the comments or data behind each recommendation.

### C. Short-form clip generator

This module finds useful moments in existing long-form content and helps turn them into short videos.

**What it does**
- Uses transcripts and timestamps to find self-contained moments.
- Scores candidate segments for relevance, clarity, usefulness, and hook strength.
- Checks surrounding context so a clip does not distort the speaker's meaning.
- Suggests start and end timestamps.
- Cuts selected sections from the original media.
- Reframes to vertical 9:16 where feasible.
- Generates and burns in subtitles.
- Suggests a title, hook, and platform-specific caption.
- Lets the creator review, adjust, and export the clip.

**Key connection:** When the content-gap engine finds a topic the audience wants, the clip generator can search the creator's archive for existing footage about that topic. If suitable footage exists, it can propose clips instead of always asking the creator to record something new.

## 4. End-to-end user journey

1. The creator creates a workspace.
2. They upload a small set of existing videos, podcasts, transcripts, or posts.
3. Off Script transcribes and indexes the material.
4. The creator uploads audience comments or feedback.
5. Off Script groups audience requests and compares them with the content archive.
6. The dashboard presents content opportunities with supporting evidence.
7. The creator selects an opportunity.
8. Off Script searches the archive for relevant footage.
9. It proposes timestamped short clips and explains why they fit.
10. The creator reviews and edits the clips, subtitles, and captions.
11. The creator exports the final clips.
12. Later, the creator can add performance data and feedback to improve future recommendations.

## 5. Example demonstration scenario

**Creator profile:** A programming educator.

**Sample inputs**
- 10 existing programming videos or transcripts.
- A CSV containing 500 audience comments.
- A few creator-approved examples of preferred writing style.

**Illustrative analysis**
- The archive contains several videos about Python fundamentals.
- Comments repeatedly request practical beginner projects and internship guidance.
- The system identifies “beginner Python projects” as a potential gap.
- It searches the archive and finds a segment from an older podcast discussing three project ideas.
- It proposes a 35-second clip, shows the original timestamp and surrounding transcript, and generates subtitles and a caption.
- If the archive has no suitable footage, it offers a new video outline and script instead.

The demo should clearly label sample data and simulated metrics. Do not present invented engagement numbers as real results.

## 6. Main product screens

### 6.1 Dashboard
- Overview of indexed content.
- Recent audience themes.
- Top content opportunities.
- Recently generated clips.
- Processing status.

### 6.2 Content Library
- Searchable list of videos, audio, transcripts, and posts.
- Topic tags and metadata.
- Transcript viewer with timestamps.
- Search results linked to source material.

### 6.3 Audience Insights
- Frequently asked questions.
- Topic clusters and request counts.
- Feedback examples.
- Potential content gaps with evidence.

### 6.4 Opportunity Detail
- What the audience is asking for.
- What the creator has already published on the topic.
- What is missing or underdeveloped.
- Recommended next action.
- Relevant existing footage, if available.

### 6.5 Clip Studio
- Video preview.
- Candidate clips and timestamps.
- Transcript context.
- Vertical preview.
- Subtitle editing.
- Title and caption suggestions.
- Export controls.

### 6.6 Brand Preferences
- Preferred tone and vocabulary.
- Caption length and formatting preferences.
- Creator corrections and approved examples.
- Controls to review or reset learned preferences.

## 7. MVP scope

The hackathon MVP should demonstrate the complete core loop with a manageable amount of data.

### Must-have
1. Upload video/audio or paste a transcript.
2. Transcribe audio/video and retain timestamps.
3. Extract topics and index content.
4. Search the archive using natural language.
5. Upload audience comments as CSV.
6. Cluster recurring questions and requests.
7. Compare audience demand with existing topic coverage.
8. Show explainable content-gap recommendations.
9. Find relevant timestamped moments in existing footage.
10. Cut at least one selected clip using FFmpeg.
11. Generate subtitles and a caption.
12. Let the creator preview and download the result.

### Nice-to-have
- Multiple clip suggestions per video.
- Automatic vertical reframing and speaker tracking.
- Brand-voice learning from edits.
- Content calendar.
- Direct social-platform integrations.
- Performance analytics and recommendation feedback loop.
- Multi-language transcription and subtitles.

### Explicitly out of scope for the first demo
- Fully autonomous publishing to every social platform.
- Guaranteed virality or predicted view counts.
- Training a custom foundation model.
- Complex multi-camera editing.
- Real-time ingestion from every social platform.
- Perfect automatic speaker identification in all audio conditions.

## 8. Suggested technical architecture

| Layer | Suggested technology | Responsibility |
|---|---|---|
| Frontend | React / Next.js + Tailwind CSS | Dashboard, library, insights, clip studio |
| Backend | Python + FastAPI | API, orchestration, processing jobs |
| Database | PostgreSQL / Supabase | Users, media records, topics, comments, tasks |
| Semantic retrieval | pgvector | Search across transcript segments and content |
| File storage | Supabase Storage or compatible object storage | Original media and generated clips |
| Speech-to-text | Whisper or another available transcription service | Transcript with timestamps |
| LLM | Available LLM API | Topic extraction, clustering, comparison, recommendations |
| Video processing | FFmpeg | Cutting, resizing, subtitle rendering |
| Charts | Recharts | Audience and content insights |
| Deployment | Vercel + a backend host | Application deployment |

### Processing flow

```text
Media upload
    |
    v
Store original file and metadata
    |
    v
Extract audio / transcribe with timestamps
    |
    v
Split transcript into timestamped segments
    |
    +------> Extract topics, questions and key points
    |                    |
    |                    v
    |             Store in PostgreSQL
    |             + vector embeddings
    |
Audience comments CSV
    |
    v
Clean and group comments into themes
    |
    v
Estimate demand from supplied feedback
    |
    v
Compare audience themes with archive coverage
    |
    v
Explainable content-gap recommendations
    |
    v
Search archive for relevant timestamped footage
    |
    v
Creator reviews proposed clip
    |
    v
FFmpeg cuts / reframes / subtitles
    |
    v
Preview and export
```

## 9. Core data model

A practical first database design could include:

- **users:** creator account and workspace details.
- **media_items:** file name, type, duration, storage path, source, upload date, processing status.
- **transcript_segments:** media item, start time, end time, text, speaker label if available, embedding.
- **topics:** canonical topic names and descriptions.
- **media_topics:** links between media items or transcript segments and topics, with relevance.
- **audience_comments:** comment text, source, date, and optional engagement metadata.
- **comment_topics:** links between comments and topic clusters.
- **content_opportunities:** topic, demand evidence, existing coverage, gap explanation, recommendation, confidence.
- **clip_candidates:** source media, start/end timestamps, transcript excerpt, relevance explanation, review status.
- **generated_assets:** output file, subtitles, captions, and export metadata.
- **creator_preferences:** user-approved tone, vocabulary, and formatting preferences.
- **performance_records:** creator-supplied views, engagement, and other metrics associated with published content.

## 10. Content-gap detection approach

Avoid asking the LLM to invent a gap from a vague prompt. Use a transparent pipeline.

1. **Extract audience themes:** Cluster similar comments and questions.
2. **Estimate demand:** Use the number of relevant comments and available engagement signals. Treat this as a relative indicator, not a prediction of future views.
3. **Measure existing coverage:** Retrieve relevant transcript segments and identify whether the topic is absent, briefly mentioned, or covered in depth.
4. **Find the gap:** Compare audience demand with existing coverage.
5. **Explain the result:** Show representative audience questions and links/timestamps to existing content.
6. **Recommend an action:** Suggest a new video, a follow-up, or a clip from existing footage.

A simple prioritisation score for the MVP could be:

```text
Opportunity score =
    normalized audience demand
    × (1 - existing coverage)
```

This is a starting heuristic, not a validated ranking model. Show the underlying signals so creators can judge the recommendation themselves.

## 11. Clip selection approach

For each transcript segment:

- Detect a complete thought or useful explanation.
- Prefer moments with a clear opening and understandable ending.
- Check neighbouring transcript context for qualifications, negations, or missing context.
- Match the segment to the selected audience topic.
- Score clarity, relevance, self-containment, and hook strength.
- Present the original timestamp and transcript for human review.

The system should never silently change what the speaker said. The creator must be able to preview and approve each clip before export.

## 12. Brand memory

Brand memory should be practical and user-controlled.

The creator can provide:
- Example captions or scripts.
- Preferred tone (for example, friendly, direct, educational).
- Preferred language.
- Typical caption length.
- Words or phrases to avoid.

When the creator edits an AI-generated caption, the system can ask whether that edit should be saved as a preference. It should not assume every edit represents a permanent preference.

## 13. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Poor transcription | Show transcript confidence where available and allow corrections |
| Misleading clip boundaries | Include surrounding context and require creator approval |
| Weak topic clustering | Allow manual merging, renaming, and correction |
| False content-gap claims | Show source comments and archive evidence |
| Unrepresentative comments | Display sample size, source, date range, and limitations |
| Large video processing times | Use short demo videos, background jobs, and processing status |
| Copyright or consent concerns | Process only media the creator is authorised to use |
| Platform API restrictions | Start with uploads and CSV exports; add integrations only when supported |
| Sensitive audience data | Minimise stored personal information and provide deletion controls |

## 14. Success criteria for the hackathon demo

The demo is successful if a judge can see that:

1. A creator can upload existing content.
2. The platform creates a searchable, timestamped memory.
3. A creator can find a topic in old content using natural language.
4. Audience comments are grouped into understandable themes.
5. The system identifies a plausible content gap and explains it with evidence.
6. It finds relevant existing footage for that opportunity.
7. It creates a short, reviewable clip with subtitles.
8. The creator remains in control of the final output.

## 15. Product positioning

**Product name:** Off Script

**Short description:** An AI content intelligence and creation workspace for creators.

**Tagline:** Find what's next in what you've already made.

**One-line pitch:** Off Script remembers everything a creator has published, discovers what their audience wants next, and turns relevant existing footage into ready-to-share short-form content.

**Longer pitch:**

Creators have years of valuable content buried in videos, podcasts, and posts, while their audiences keep asking for new topics. Off Script connects those two worlds. It builds a searchable memory of a creator's work, analyses audience feedback to uncover content opportunities, and turns relevant moments from existing footage into short-form clips. It helps creators decide what to make next and reuse what they have already made.

---

## 16. Recommended build order

For a short hackathon, build in this order:

**Phase 1 — Make the content searchable**
- Upload a sample video or transcript.
- Transcribe and index it.
- Search for topics and return timestamps.

**Phase 2 — Find audience demand**
- Upload a comments CSV.
- Group repeated questions.
- Compare audience topics with existing content.
- Show evidence-backed content opportunities.

**Phase 3 — Turn an opportunity into a clip**
- Retrieve relevant transcript segments.
- Let the creator select a candidate.
- Cut the source video with FFmpeg.
- Generate subtitles and a caption.
- Preview and export.

**Phase 4 — Polish the demo**
- Add brand preferences.
- Improve dashboard visuals.
- Show processing states and evidence.
- Prepare one coherent end-to-end demonstration.

**Guiding principle:** Build one complete workflow that works reliably before adding more features. Off Script should demonstrate a connected cycle of memory → audience insight → content opportunity → short-form creation.
