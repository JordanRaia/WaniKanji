# WaniKanji

A kanji learning and practice tool for studying Japanese kanji by level using the WaniKani API. Features lessons, quizzes, and a learning mode.

## Quick Links

-   **Live Demo**: [wanikanji.com](https://wanikanji.com)
-   **GitHub**: [github.com/JordanRaia/WaniKanji](https://github.com/JordanRaia/WaniKanji)
-   **WaniKani API**: [docs.api.wanikani.com](https://docs.api.wanikani.com/20170710/)

## What is WaniKanji?

WaniKanji is a kanji learning application for studying kanji from WaniKani by level. Practice just the kanji per level with multiple learning modes, feedback systems, and progress tracking.

## Features

### Core Learning Modes

-   **Quiz Mode**: Practice with multiple question types and review system
-   **Lesson Mode**: Lessons with mnemonics, radicals, and similar kanji
-   **Learn Mode**: Learning in batches of 5 kanji

### Quiz Features

-   **Multiple Quiz Modes**:
    -   Kanji → English Meaning
    -   Kanji → Japanese Reading
    -   English Meaning → Japanese Reading
-   **Review System**: Wrong answers cycle back for additional practice
-   **Cross-Mode Validation**: Feedback when you answer correctly in the wrong mode
-   **Fuzzy Matching**: Accepts answers with typos (80%+ similarity threshold)
-   **Results**: Shows which kanji you got right or wrong

### Lesson Features

-   **Lessons**: Kanji lessons with meanings, readings, and mnemonics
-   **Component Radicals**: Shows the building blocks of each kanji
-   **Visually Similar Kanji**: Related kanji to avoid confusion
-   **WaniKani Links**: Direct links to WaniKani pages for each kanji
-   **Keyboard Navigation**: Navigate with arrow keys (← →) or Enter

### Learning Mode

-   **Batch Learning**: Learn kanji in batches of 5 at a time
-   **Progressive Learning**: Build knowledge through lessons and quizzes
-   **Progress Tracking**: Track learning progress across batches
-   **Adaptive Quizzes**: Quiz on current batch plus all previously learned kanji
-   **Final Quiz**: Quiz on all learned kanji after completing all batches

### Advanced Features

-   **Level-Based Practice**: Select any WaniKani level (1-60) to practice
-   **Advanced Filtering**:
    -   Exclude Guru+ kanji
    -   Exclude locked kanji
-   **Kanji Selection**: Choose specific kanji to practice or learn
-   **Export Functionality**: Export kanji, meanings, and readings
-   **Data Caching**: Cache data from API
-   **Responsive Design**: Works on desktop and mobile devices

## Getting Started

### Prerequisites

You'll need a WaniKani account and an API token:

1. Go to [WaniKani Personal Access Tokens](https://www.wanikani.com/settings/personal_access_tokens)
2. Create a new token (no special permissions needed - the app only uses GET requests)
3. Copy your token

### Usage

1. **Setup**: Open the app and paste your WaniKani API token
2. **Select Level**: Choose the WaniKani level you want to practice (1-60)
3. **Choose Mode**: Select from four main learning modes:
    - **Quiz All**: Practice all kanji in the level
    - **Select Quiz**: Choose specific kanji to quiz on
    - **Lessons**: Lessons with mnemonics and radicals
    - **Learn**: Learning mode with batch processing
4. **Configure Options**:
    - Choose quiz modes (Kanji → English, Kanji → Reading, English → Reading)
    - Apply filters (exclude Guru+ kanji, unlocked only)
    - Preview kanji before starting
5. **Start Learning**: Begin your chosen mode

### Keyboard Shortcuts

-   **Enter**: Check answer or continue to next question
-   **← →**: Navigate lessons (Previous/Next)

## Learning Modes Explained

### Quiz Mode

**Quiz All** lets you practice all kanji in the selected level with your chosen quiz modes. Wrong answers cycle back for additional practice until you get them right.

**Select Quiz** allows you to choose specific kanji from the level to focus your practice.

Both quiz modes feature:

-   Multiple question types with review system
-   Cross-mode validation (recognizes when you answer correctly in the wrong mode)
-   Fuzzy matching to accept answers with typos
-   Results showing correct and incorrect kanji

### Lesson Mode

Lessons provide the full WaniKani learning experience:

-   Learn meanings, readings, and mnemonics for each kanji
-   Study component radicals that make up each kanji
-   See visually similar kanji to avoid confusion
-   Direct links to WaniKani for additional reference
-   Navigate with keyboard shortcuts

### Learn Mode

Learning mode follows this process:

1. **Select Kanji**: Choose kanji to learn (or select all for a level)
2. **Batch Processing**: Learn in batches of 5 kanji at a time
3. **Lessons First**: Complete lessons for each batch
4. **Quiz Integration**: Quiz on current batch plus all previously learned kanji
5. **Progressive Learning**: Each new batch includes previous knowledge
6. **Final Quiz**: Quiz on all learned kanji after completing all batches

## Installation

This is a static web application that requires no build step or server. To run locally:

1. Clone the repository
2. Open `index.html` in your web browser
3. Enter your WaniKani API token to get started

The app is also hosted at [wanikanji.com](https://wanikanji.com) for immediate use.

## Technical Details

WaniKanji is a client-side application built with:

-   **Vanilla JavaScript** (no framework dependencies)
-   [Tailwind CSS](https://tailwindcss.com/) for styling
-   [DaisyUI](https://daisyui.com/) for UI components
-   [WaniKani API v2](https://docs.api.wanikani.com/20170710/)
-   [Fuzzball.js](https://github.com/nol13/fuzzball.js) for fuzzy string matching
-   [DOMPurify](https://github.com/cure53/DOMPurify) for XSS protection
-   [Canvas Confetti](https://github.com/catdad/canvas-confetti) for celebration effects

### How It Works

**Fuzzy Matching**: Uses Fuzzball.js for string comparison with typo tolerance. Accepts answers with 80%+ similarity to correct answers.

**Cross-Mode Validation**: Recognizes when you answer correctly in the wrong mode (e.g., typing a reading when asked for a meaning). Provides feedback to prevent confusion.

**Data Export**: Export kanji data including characters, meanings, and readings.

## Privacy & Security

-   Your API token is stored locally in your browser (localStorage)
-   Never sent anywhere except to the official WaniKani API
-   All data processing happens client-side in your browser
-   No tracking or analytics
-   No data collected or stored on any server

## License

This project is not affiliated with WaniKani. WaniKani is a trademark of Tofugu LLC.

## Acknowledgments

-   Built for the WaniKani learning community
-   Uses the official [WaniKani API](https://docs.api.wanikani.com/)
-   Inspired by WaniKani's kanji learning methodology
