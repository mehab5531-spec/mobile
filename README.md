now I am vibe coding a mobile app for android and iOS so I want a prompt
for this app idea
stories app, nothing fancy, nice looking carousel and a list of categories of stories each category has a poster, name. within it are stories and each story has an author name and its content in markdown will be loaded off supabase the first time ever the app is set up, later the stories will be stored on the device forever offline, the advantage of supabas that "weekly interval checkout" if I updated the stories, in the supabase db it is reflected whenever the user connects with a nice loader and again updated on device
the app has theme, free frameworks, lightweight, customizable, stories are in markdown, no images within, only posters and no auth
 mobile app for Android and iOS with the following specifications:

## Core Functionality
Build a stories reading app with these features:
- Beautiful carousel component showcasing featured stories on home screen
- Grid/list view of story categories, each with poster image and category name
- Story reader with markdown rendering and smooth scrolling
- Offline-first architecture with Supabase sync
- Dark/light theme toggle with system preference detection
- No authentication required

## Data Structure
Create these data models:
- Categories: id, name, poster_url, created_at, updated_at
- Stories: id, title, author, content (markdown), category_id, poster_url, created_at, updated_at

## Technical Stack
Use these free, lightweight libraries:
- React Native CLI (no Expo)
- NativeWind for styling (Tailwind CSS for React Native)
- React Navigation v6 for navigation
- React Native Async Storage for offline data persistence
- Supabase JS client for data sync
- React Native Markdown Display for story content
- React Native Fast Image for optimized image loading
- React Native Reanimated for smooth animations

## UI/UX Requirements
Design a clean, modern interface with:
- Home screen with horizontal carousel of featured stories
- Categories grid with 2 columns showing poster + name
- Story detail screen with author name, title, and markdown content
- Smooth animations and transitions
- Pull-to-refresh for manual sync
- Loading states with skeleton screens
- Theme switcher in settings

## Data Flow Logic
Implement this sync strategy:
1. On first app launch: Download all categories and stories from Supabase
2. Store everything in AsyncStorage for offline access
3. Weekly automatic sync: Check Supabase for updated_at timestamps
4. If updates found: Download only changed data with progress indicator
5. Merge updates with local storage
6. Always serve content from local storage first (offline-first)

## File Structure
Create this project structure:
src/
├── components/
│ ├── Carousel.js
│ ├── CategoryCard.js
│ ├── StoryCard.js
│ ├── MarkdownReader.js
│ ├── ThemeToggle.js
│ └── LoadingSpinner.js
├── screens/
│ ├── HomeScreen.js
│ ├── CategoriesScreen.js
│ ├── CategoryStoriesScreen.js
│ ├── StoryReaderScreen.js
│ └── SettingsScreen.js
├── services/
│ ├── supabaseClient.js
│ ├── storageService.js
│ └── syncService.js
├── utils/
│ ├── dateHelpers.js
│ └── themeHelpers.js
└── contexts/
└── ThemeContext.js

text

## Key Features to Implement
Essential functionality:
- Horizontal scrollable carousel on home screen showing 3-5 featured stories
- Category grid with touch feedback and poster images
- Story reader with markdown formatting (headers, paragraphs, lists, emphasis)
- Smooth page transitions with native-like animations
- Theme persistence across app restarts
- Offline mode indicator in status bar
- Pull-to-refresh gesture for manual sync
- Background sync every 7 days with notification
- Error handling for network failures
- Image caching for posters

## Styling Guidelines
Use NativeWind classes for:
- Responsive design with proper spacing (p-4, m-2, gap-3)
- Modern color scheme with theme variables
- Typography hierarchy (text-2xl font-bold, text-gray-600)
- Card layouts with rounded corners and shadows
- Smooth animations (transition-all duration-300)

## State Management
Keep it simple with:
- useState for local component state
- useContext for theme management
- AsyncStorage for data persistence
- No complex state management library needed

## Performance Optimizations
Ensure smooth performance:
- FlatList with getItemLayout for large story lists
- Image lazy loading with placeholder
- Markdown parsing optimization
- Memory management for large text content
- Efficient re-renders with React.memo where needed

Generate the complete working app with all files, proper navigation setup, Supabase integration, and offline functionality. Make it production-ready with proper error handling and user feedback.
🎯 Additional Context for Better Results
Add this to your prompt for enhanced output:

text
## Design References
Create a UI similar to:
- Medium app for clean story reading experience
- Apple News for category organization
- Pocket for offline functionality
- Use modern iOS/Android design patterns

## Supabase Schema
Create these tables:
-- Categories table
create table categories (
id uuid default gen_random_uuid() primary key,
name text not null,
poster_url text not null,
created_at timestamp default now(),
updated_at timestamp default now()
);

-- Stories table
create table stories (
id uuid default gen_random_uuid() primary key,
title text not null,
author text not null,
content text not null, -- markdown content
category_id uuid references categories(id),
poster_url text not null,
created_at timestamp default now(),
updated_at timestamp default now()
);



env
EXPO_PUBLIC_SUPABASE_URL
EXPO_PUBLIC_SUPABASE_ANON_KEY
