# Coding Guidelines

This document outlines the coding standards, component structure, and patterns to be followed for this project to ensure consistency and maintainability.

## 1. Directory Structure

We will follow a feature-based directory structure to keep the code organized and scalable.

- **`src/app/`**: This directory is strictly for Next.js routing. The `page.tsx` files within this directory should be lightweight wrappers.

- **`src/components/`**: Contains globally reusable UI components.
  - **`src/components/ui/`**: For primitive, unstyled components like `Button`, `Input`, `Card`. These are the basic building blocks.
  - **`src/components/common/`**: For larger, site-wide components like `Header`, `Footer`, `Sidebar`, `MarketTicker`.

- **`src/features/`**: This is where the main logic for each page or complex feature resides. Each page in the `app` directory will correspond to a feature here.
  - *Example:* The home page (`app/page.tsx`) will import its main component from `src/features/home/`. 

- **`src/hooks/`**: Contains all custom React hooks. Hooks should be reusable and focused on a single piece of logic.

- **`src/lib/`**: For utility functions, helper scripts, and third-party library configurations (e.g., API clients, date formatters).

- **`src/store/`**: For Zustand state management stores. Each store should be in its own file.

## 2. Component Architecture

To keep our page routes clean and separate concerns, we will follow this pattern:

1.  **Page Route (`app/some-route/page.tsx`):** This file should be as simple as possible. Its only responsibility is to import and render the main feature component for that page. It should not contain any business logic, state, or complex JSX.

    ```tsx
    // src/app/page.tsx - GOOD EXAMPLE
    import { HomePage } from '@/features/home';

    export default function Home() {
      return <HomePage />;
    }
    ```

2.  **Feature Component (`src/features/feature-name/index.tsx`):** This is the primary component for a page. It composes the layout and contains the core logic for the feature.
    - Each feature folder (e.g., `src/features/home/`) must have an `index.tsx` file that serves as the main entry point and exports the feature component.
    - This component is responsible for fetching data (if it's a Server Component) and managing the state of the page.

3.  **Sub-components (`src/features/feature-name/components/`):** If a feature component becomes too large, break it down into smaller, manageable sub-components within a `components` folder inside the feature directory.

    ```
    src/features/home/
    ├── components/
    │   ├── HeroSection.tsx
    │   └── LatestNewsGrid.tsx
    └── index.tsx         // Main HomePage component that imports the above
    ```

## 3. Hooks and State Management

- **Custom Hooks:** All custom hooks must be placed in `src/hooks/` and should be prefixed with `use` (e.g., `useMarketData.ts`).
- **State Management:** Zustand is the designated library for global or cross-component client-side state. All Zustand stores must be located in the `src/store/` directory.
- **Data Fetching:**
  - Prioritize **React Server Components (RSC)** for data fetching whenever possible to improve performance.
  - For client-side data fetching, use `useEffect` for simple cases or a dedicated data-fetching library like `SWR` if complex caching or revalidation is needed.

## 4. Styling

- **Tailwind CSS:** All styling must be done using Tailwind CSS utility classes.
- **No Custom CSS:** Avoid writing separate `.css` files. If a specific style cannot be achieved with Tailwind, consider creating a custom utility class or component variant using Tailwind's plugin system.

By adhering to these guidelines, we can build a clean, scalable, and developer-friendly application.
