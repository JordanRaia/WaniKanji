# WaniKanji

A focused kanji practice tool that helps you practice Japanese kanji by level using the WaniKani API.

## What is WaniKanji?

WaniKanji is a specialized quiz application designed to help learners practice kanji from WaniKani by level. Unlike the full WaniKani experience, WaniKanji lets you drill specifically on the kanji for any level you choose.

## Features

-   **Level-Based Practice**: Select any WaniKani level (1-60) to practice
-   **Multiple Quiz Modes**:
    -   Kanji → English Meaning
    -   Kanji → Japanese Reading
    -   English Meaning → Japanese Reading
-   **Smart Review System**: Wrong answers automatically cycle back for additional practice
-   **Instant Feedback**: See correct answers immediately after each question
-   **Progress Tracking**: Track correct vs. incorrect answers throughout your session
-   **Detailed Results**: Review which kanji you got right or wrong at the end
-   **Export Functionality**: Export kanji, meanings, and readings for the level

## Getting Started

### Prerequisites

You'll need a WaniKani account and an API token:

1. Go to [WaniKani Personal Access Tokens](https://www.wanikani.com/settings/personal_access_tokens)
2. Create a new token (no special permissions needed - the app only uses GET requests)
3. Copy your token

### Usage

1. Open the app in your browser
2. Paste your WaniKani API token
3. Select the level you want to practice
4. Choose your quiz modes (you can enable multiple modes)
5. Click "Load Level and Start"
6. Start practicing!

## Technical Details

WaniKanji is a lightweight, client-side application built with:

-   Vanilla JavaScript (no framework dependencies)
-   [Tailwind CSS](https://tailwindcss.com/) for styling
-   [DaisyUI](https://daisyui.com/) for UI components
-   [WaniKani API v2](https://docs.api.wanikani.com/20170710/)

Your API token is stored locally in your browser and never sent anywhere except to the official WaniKani API.

## How to Use

1. **Setup**: Enter your API token and select a level
2. **Quiz**: Type your answers and press Enter
3. **Learn**: Wrong answers will come back for another try
4. **Review**: See your results and which kanji need more practice

## License

This project is not affiliated with WaniKani. WaniKani is a trademark of Tofugu LLC.

## Acknowledgments

-   Built for the WaniKani learning community
-   Uses the official [WaniKani API](https://docs.api.wanikani.com/)
