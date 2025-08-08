# **App Name**: Frontier Tower Timeline

## Core Features:

- Interactive Timeline: Display a 2D table representing time on the horizontal axis (zoomable to day/week/month) and Frontier Tower floors/rooms on the vertical axis.
- Event Data Integration: Fetch event data from `server.com/api/events.json` and display events on the timeline based on their `startsAt`, `endsAt`, and `location` properties.
- Floor/Room Hierarchy: Use static data from `server.com/rooms.json` to create a hierarchical, tree-like list of floors and rooms, filtered to show only those with events in the current time range. Make root the top level parent of tree
- Event Detail View: When clicking an event, the UI navigates to a page for an event with the event details, such as the description of the event. Set URL as `/EVENTID`.
- Secure API Proxy: Implement a server-side function to fetch events from the Frontier Tower API (`https://api.berlinhouse.com/events/`) using the `FRONTIER_TOWER_API_KEY` for authentication and expose the events in `/api/events.json` endpoint.
- Deep Linking: Dynamically update the URL to reflect the current zoom range (e.g., `?from=20250901_09&to=20250901_22`).

## Style Guidelines:

- Primary color: Soft lavender (#D0B8FF) for a calm and inviting feel. The hue is related to purple, often associated with technology, creativity, and innovation.
- Background color: Off-white (#FAFAFA), offering a clean, light base for readability.
- Accent color: Muted teal (#70A1AF), an analogous color providing a cool contrast, suitable for interactive elements.
- Body text: 'PT Sans', a sans-serif, providing legibility and modern appearance. Header text: 'Playfair', a modern sans-serif suitable for a high-end feel.
- Responsive layout adapting to smartphones, desktop browsers, and 1080p TVs.
- Simple, modern icons for event types and categories. Logos will primarily be SVGs so there should be an svg.tsx component somewhere that will contain SVGs embedded elsewhere in the app.
- Subtle transitions when zooming and filtering events.
- CSS should used named variables whenever possible. E.g,`--ft-purple: #764AE2; --ft-purple-dark: #6c44d4;`