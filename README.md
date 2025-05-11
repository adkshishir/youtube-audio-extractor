# YouTube Audio Extractor

A modern web application that allows users to extract and download audio from YouTube videos. Built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

- 🎵 Extract audio from YouTube videos
- 📥 Download in multiple formats (MP3, MP4)
- 🎨 Modern, responsive UI with Tailwind CSS
- ⚡ Fast and efficient downloads using streaming
- 🔄 Automatic cleanup of old downloads
- 📱 Mobile-friendly interface

## Prerequisites

- Node.js 18.0.0 or later
- npm or yarn package manager

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/youtube-audio-extractor.git
cd youtube-audio-extractor
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file in the root directory and add your environment variables:
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Start the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Enter a YouTube video URL in the input field
2. Click "Extract" to fetch video information
3. Select your preferred format (MP3 or MP4)
4. Click "Download" to save the file

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── components/        # React components
│   └── page.tsx           # Main page
├── lib/                   # Utility functions
├── public/               # Static assets
└── styles/               # Global styles
```

## API Routes

- `POST /api/extract` - Extract video information
- `GET /api/download/[format]/[id]/[filename]` - Download video/audio

## Technologies Used

- [Next.js 14](https://nextjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [ytdl-core](https://github.com/fent/node-ytdl-core)
- [shadcn/ui](https://ui.shadcn.com/)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [ytdl-core](https://github.com/fent/node-ytdl-core) for YouTube video downloading
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Next.js](https://nextjs.org/) for the amazing framework

## Disclaimer

This tool is for personal use only. Please respect YouTube's terms of service and copyright laws when using this application.
