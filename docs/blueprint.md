
# Frontier Tower Timeline - Technical Blueprint

This document provides a detailed technical overview of the Frontier Tower Timeline application, outlining its architecture, data flow, component structure, and key logic.

## 1. High-Level Architecture

The application is a full-stack web application built on the **Next.js App Router** paradigm, leveraging **React Server Components (RSC)** where possible and client components for interactivity.

- **Frontend**: Next.js 15, React 18, TypeScript.
- **UI Framework**: Tailwind CSS with `shadcn/ui` for pre-built, accessible components.
- **Styling**: CSS Custom Properties (Variables) defined in `globals.css` for theming, with utility classes from Tailwind CSS.
- **State Management**: Client-side state is managed via React Hooks (`useState`, `useEffect`, `useMemo`). URL `searchParams` are used for global state management (e.g., zoom level, date range, view mode), enabling deep linking.
- **Data Fetching**: A server-side proxy layer fetches data from external APIs. The frontend then consumes this data through internal API routes (`/api/events`, `/api/rooms`).
- **AI/Generative**: Genkit is set up for potential future AI features but is not currently used in the core application logic.

---

## 2. Data Flow

The application aggregates event data from two primary sources and presents it in a unified timeline.

1.  **External APIs**:
    - **Frontier Tower API**: Fetches events from `https://api.berlinhouse.com/events/` using a private API key (`FRONTIER_TOWER_API_KEY`). This API only returns future events.
    - **Luma Calendar**: Fetches a public iCalendar (`.ics`) feed from `https://api2.luma.com/...` which contains both past and future events.

2.  **Server-Side Proxy (`/api/events/route.ts`)**:
    - A Next.js API route acts as a secure proxy.
    - The `getEvents` function in `src/lib/data.ts` is responsible for fetching data from both external APIs.
    - It uses an in-memory cache with a 10-minute TTL to reduce redundant API calls. A manual cache-clearing endpoint exists at `/api/refresh`.

3.  **Data Processing (`src/lib/data.ts`)**:
    - **Normalization**: Raw data from both sources is transformed into a standardized `Event` type.
    - **Location Mapping**: A `locationNameMapping` dictionary normalizes various free-text location strings from Luma into standardized room/floor IDs (e.g., "Frontier Tower @ lounge / floor 16" becomes `rooftop-lounge`).
    - **Color-Coding**: Events are assigned a color based on their `source` (`frontier-tower` or `luma`).

4.  **Client-Side Consumption (`src/app/page.tsx`)**:
    - The main page component fetches the processed event data and static room data from the internal `/api/events` and `/api/rooms` endpoints.
    - This data is then passed down to either the `TimelineContainer` or `EventListContainer` based on the `view` search parameter.

5.  **Deduplication & Filtering (Client-Side)**:
    - Inside `TimelineContainer` and `EventListContainer`, a `useMemo` hook performs smart deduplication.
    - It groups events by name and merges any that occur within a 5-minute window of each other, preventing duplicate entries from appearing.
    - It also filters events based on the currently selected date range and visible sources (Frontier Tower, Luma).

---

## 3. Project & Component Structure

### Key Directories

-   `src/app/`: Contains all routes and pages.
    -   `/page.tsx`: The main entry point, routing to Timeline or List view.
    -   `/events/[id]/page.tsx`: The detail page for a single (or merged) event.
    -   `/readme/page.tsx`: The "About" page.
    -   `/api/`: Internal API routes for proxying data.
-   `src/components/`: Reusable React components.
    -   `/ui/`: Core `shadcn/ui` components.
    -   `/timeline/`: Components specific to the timeline view.
-   `src/lib/`: Core application logic, data fetching, and type definitions.

### Component Breakdown

#### `src/app/page.tsx`
- **Purpose**: Main application shell.
- **Logic**: Uses `useSearchParams` to decide whether to render the `TimelineContainer` or `EventListContainer`. Fetches initial data and handles the top-level loading state.

#### `TimelineContainer` (`/components/timeline/timeline-container.tsx`)
- **Purpose**: Orchestrates the main timeline view.
- **Logic**:
    - Manages zoom level (`day`, `week`, `month`), current date, and visible sources.
    - Updates URL `searchParams` as the user navigates.
    - Performs client-side event filtering and deduplication based on the current view.
    - Filters the room tree to only show rooms/floors with events in the current time range.
    - Passes processed data to `TimelineView`.

#### `TimelineView` (`/components/timeline/timeline-view.tsx`)
- **Purpose**: Renders the grid-based timeline.
- **Logic**:
    - Renders the `RoomList` and the scrollable event grid.
    - Calculates the grid position and width for each `EventItem` based on its start/end times and the current zoom level.
    - Implements smart auto-scrolling: scrolls to the current time on "today's" view, or to the earliest event on other days.

#### `EventListContainer` (`/components/event-list.tsx`)
- **Purpose**: Renders the card-based list view.
- **Logic**:
    - Manages visible sources and a "Show Past Events" toggle.
    - Performs the same event deduplication as the timeline view.
    - Filters out past events unless the toggle is active.
    - Renders events as a grid of `Card` components.

#### `EventDetail` (`/components/event-detail.tsx`)
- **Purpose**: Displays the full details for one or more events.
- **Logic**:
    - Fetches all events and finds the one(s) matching the ID(s) in the URL.
    - Handles merged events by displaying a "Multiple Events" banner and rendering a detail card for each event in the group.
    - Formats event times, descriptions, and provides an outbound link to the location map.

#### `RoomList` (`/components/timeline/room-list.tsx`)
- **Purpose**: Renders the sticky list of rooms and floors on the left side of the timeline.
- **Logic**: Receives a pre-filtered, flattened list of rooms and renders them with appropriate indentation and icons. Includes links to the location map.

#### `EventItem` (`/components/timeline/event-item.tsx`)
- **Purpose**: Represents a single event block on the timeline grid.
- **Logic**:
    - Displays the event name and handles hover tooltips.
    - Adapts its appearance for single events, grouped events, and past events (faded/grayscale).
    - Links to the event detail page, using a comma-separated list of IDs for merged events.
