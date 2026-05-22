# Functional Category Tabs + Replace AI Summary with Useful Feature

## Background
The current GlobeNews dashboard has 5 category tags (Economy, Politics, Technology, Space, Environment) rendered as static `<span>` badges at the bottom. Meanwhile, the `NewsFilters` dropdown uses a different set of categories (`Space, Technology, General, Science, Business`). The "AI-Powered News Analyzer" score card and "Summary Briefing" card in `DashboardKPIs` are filler — they don't provide actionable value.

## Proposed Changes

### 1. Unify Categories & Make Tabs Functional

Replace the static span badges **and** the dropdown with a single, beautiful **tab bar** using the 5 categories:

| Category | API Source | Endpoint |
|---|---|---|
| **Space** | Spaceflight News API v4 (no key) | `https://api.spaceflightnewsapi.net/v4/articles/` |
| **Technology** | saurav.tech NewsAPI cache | `https://saurav.tech/NewsAPI/top-headlines/category/technology/us.json` |
| **Economy** | saurav.tech NewsAPI cache | `https://saurav.tech/NewsAPI/top-headlines/category/business/us.json` |
| **Politics** | MediaStack (free) OR saurav.tech general | `https://saurav.tech/NewsAPI/top-headlines/category/general/us.json` (filtered for politics keywords) |
| **Environment** | saurav.tech science + keyword filter | `https://saurav.tech/NewsAPI/top-headlines/category/science/us.json` (filtered for environment/climate keywords) |

> [!NOTE]
> All APIs are **free, no API key required**. The saurav.tech endpoint is a cached mirror of NewsAPI top headlines that's publicly available.

---

### 2. Replace "AI-Powered News Analyzer" + "Summary Briefing" → **Trending Keywords** + **Quick Stats**

The current 3-column KPI row has:
- **Col 1**: "AI-Powered News Analyzer" with a score and mini chart → **Replace** with **Trending Keywords** — extract top keywords from current articles and display them as an animated word cloud / tag list
- **Col 2**: Live News Feed (3 headlines) → **Keep as-is** (this is useful)
- **Col 3**: "Summary Briefing" static text → **Replace** with **Quick Stats** — show article count, unique sources, freshness (newest article age), and category breakdown

---

### Component Changes

#### [MODIFY] [constants.js](file:///c:/Users/penta/globenews/src/constants.js)
- Update `CATEGORIES` list to `['Economy', 'Politics', 'Technology', 'Space', 'Environment']` with mapping to API endpoints
- Add category → icon mapping
- Add category → color mapping for tab styling

#### [MODIFY] [App.jsx](file:///c:/Users/penta/globenews/src/App.jsx)
- Change `selectedCategory` default to `'Technology'`
- Update fetch logic with proper category → API mapping
- Add keyword extraction for Politics/Environment filtering
- Remove the static span tags section (lines 385-394)
- Pass `selectedCategory` + `setSelectedCategory` to a new `CategoryTabs` component

#### [NEW] [CategoryTabs.jsx](file:///c:/Users/penta/globenews/src/components/CategoryTabs.jsx)
- Beautiful horizontal tab bar with icons for each category
- Animated active indicator (sliding underline/glow)
- Shows article count badge per category
- Replaces both the dropdown in `NewsFilters` and the static span badges

#### [MODIFY] [NewsFilters.jsx](file:///c:/Users/penta/globenews/src/components/NewsFilters.jsx)
- Remove the category `<select>` dropdown (category switching moves to `CategoryTabs`)
- Keep search input, news site filter
- Make "Featured only" and "Has launch" only visible when Space is selected

#### [MODIFY] [DashboardKPIs.jsx](file:///c:/Users/penta/globenews/src/components/DashboardKPIs.jsx)
- **Col 1**: Replace "AI-Powered News Analyzer" with **Trending Keywords** — animated tag bubbles extracted from headlines
- **Col 3**: Replace "Summary Briefing" with **Quick Stats** — article count, unique sources, freshness indicator, category badge

#### [NEW] [utils/keywordExtractor.js](file:///c:/Users/penta/globenews/src/utils/keywordExtractor.js)
- Extract top trending keywords from article titles/summaries
- Filter stop words
- Return top 8-10 keywords with frequency counts

---

### Visual Design
- Each category tab gets a unique accent color (Economy=emerald, Politics=rose, Technology=violet, Space=cyan, Environment=amber)
- Active tab has a glowing animated underline + slight scale-up
- Trending keywords animate in with staggered fade-in using framer-motion
- Quick Stats use animated number counters

## Verification Plan

### Automated Tests
- Switch between all 5 categories and verify API calls succeed
- Verify keyword extraction produces meaningful results
- Check that the UI renders correctly in the browser

### Manual Verification
- Visual inspection of the category tabs, trending keywords, and quick stats via browser
