# Off Script

> **Find what's next in what you've already made.**  
> AI-powered content memory, audience intelligence, and short-form creation studio for creators.

---

## Overview

**Off Script** is an AI-powered workspace that turns a creator's existing long-form content library into searchable memory, analyzes audience comments and unmet questions to find high-demand content gaps, and repurposes key moments into vertical 9:16 short clips with hooks, captions, and brand guardrails.

### Key Capabilities

1. **Glossy Macro Keypad Interface**: Minimalist homepage featuring an interactive 5-key macro keyboard with 3D tactile popping animations, dynamic OLED dot-matrix display, and mechanical audio feedback.
2. **Live Social Media Account Sync**: Connect YouTube channels via Channel ID or handle (e.g. `@fireship`, `@mkbhd`) and Instagram profiles to index published videos directly without manual uploads.
3. **Searchable Creator Memory**: Transcripts, timestamps, topics, and key takeaways indexed for instant natural-language retrieval.
4. **Audience Demand & Gap Detection**: Uncovers unanswered audience questions and high-interest topics from comments compared against published videos.
5. **9:16 Vertical Clip Studio**: Repurposes long-form moments into high-retention vertical clips with AI-suggested hooks, customizable subtitle styles, and ready-to-post captions.
6. **Brand Memory & Rules**: Enforces creator-defined voice, tone guidelines, and avoided phrases across all generated output.

---

## Macro Keypad Architecture

The homepage is controlled through a glossy 5-button macro interface:

| Key | Color / Icon | Action |
| :--- | :--- | :--- |
| **Key 1** | White Link | **Connect Accounts** (Sync YouTube / Instagram) |
| **Key 2** | Peach Video | **Videos Library** (Searchable Creator Memory) |
| **Key 3** | Lavender Audience | **Audience & Gaps** (Unmet Demand & Ideation) |
| **Key 4** | Yellow Scissors | **Clip Studio** (9:16 Vertical Repurposing) |
| **Key 5** | Blue Stack | **Brand Memory** (Tone & Content Guidelines) |

---

## Getting Started

### Prerequisites

- Python 3.8+
- `fastapi`, `uvicorn`, `yt-dlp`

Install dependencies:

```bash
pip install fastapi uvicorn yt-dlp
```

### Running Locally

1. Start the backend server:

```bash
python server.py
```

2. Open your browser and navigate to:

```text
http://localhost:3333
```

---

## License

MIT
