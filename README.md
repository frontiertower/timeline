# Frontier Tower Timeline

([https://ft0.sh/timeline](https://ft0.sh/timeline))

This is a vibe-coded event viewer for Frontier Tower. It's primarily designed to test the various event APIs. Contact [Sameer](https://t.me/SxP256) for more info.

## Design

The application is built with a modern, server-first approach using the Next.js App Router and React Server Components to optimize initial load times. Interactivity is powered by client-side components and React Hooks, with global state like date and zoom level managed through URL search parameters for deep-linking. A server-side proxy provides a unified and secure data layer for fetching and caching events from multiple external APIs, while client-side logic handles the smart deduplication and real-time filtering required for the timeline and list views. Styling is achieved with Tailwind CSS and a `shadcn/ui` component library, themed with CSS variables for consistency.
