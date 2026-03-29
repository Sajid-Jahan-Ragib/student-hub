# Developer's Quick Reference Guide

## Project Overview

This is a fully dynamic React + Vite + Tailwind CSS application. All data comes from JSON files, making it easy to update without touching code.

---

## Quick Navigation

### Running the Project

```bash
# Development
cd student-hub && npm run dev

# Production Build
npm run build

# Preview Build
npm run preview
```

### Project Root

```
/home/ragib/BUBT Annex/student-hub/
```

---

## Key Concepts

### 1. Global State Management

**Location**: `src/context/AppContext.jsx`

All data is centrally managed:

```jsx
// Use in any component
const { user, results, fees, routines, ... } = useAppContext();
```

**Available Data**:

- `user` - Profile information
- `results` - Academic performance
- `fees` - Financial data
- `courses` - Course catalog + courseNameMap
- `routines` - Class schedule
- `calendarEvents` - Academic events
- `attendance` - Attendance records
- `downloads` - Resources
- `presentCourses` - Active courses
- `pendingCourses` - Pending courses

### 2. Data Files Location

```
public/data/
├── user.json
├── results.json
├── fees.json
├── courses.json
├── routines.json
├── calendar.json
├── attendance.json
├── downloads.json
├── present-courses.json
└── pending-courses.json
```

**Update Data**: Modify JSON files directly. App automatically loads on startup.

### 3. Component Structure

```
src/components/
├── Navigation/        # Hero, SideMenu
├── Dashboard/         # Home page
├── Profile/          # Profile page
├── Results/          # Results page
├── Fees/             # Fees page
├── Courses/          # All course pages
├── Attendance/       # Attendance page
├── Routines/         # Routines page
├── Calendar/         # Calendar page
├── Downloads/        # Downloads page
├── Modals/           # ClassModal, EventModal
└── Common/           # Reusable components
```

---

## Common Tasks

### Adding New Data

1. **Create JSON file** in `public/data/`
2. **Update AppContext** in `src/context/AppContext.jsx`:

   ```jsx
   const [newData, setNewData] = useState([]);

   // In loadAllData()
   const newDataResponse = await fetchData('/data/new-data.json');
   if (newDataResponse?.newData) setNewData(newDataResponse.newData);

   // In value object
   newData,
   ```

3. **Use in component**:
   ```jsx
   const { newData } = useAppContext();
   ```

### Adding a New Page

1. **Create component** in `src/components/YourPage/YourPage.jsx`
2. **Import in App.jsx**:
   ```jsx
   import { YourPage } from './components/YourPage/YourPage';
   ```
3. **Add to renderScreen()**:
   ```jsx
   case 'yourpage':
     return <YourPage />;
   ```
4. **Add menu item** in `src/components/Navigation/SideMenu.jsx`:
   ```jsx
   { screen: 'yourpage', label: 'Your Page' }
   ```

### Updating Styling

**Option 1: CSS Variables** (Recommended for colors/sizes)

```css
/* In src/index.css */
:root {
  --primary: #1d92ff;
  --accent: #f7a600;
  /* etc */
}
```

**Option 2: Tailwind Classes** (For responsive design)

```jsx
<div className="px-4 py-2 bg-primary text-white rounded-lg">Content</div>
```

**Option 3: Inline Styles** (For dynamic values)

```jsx
<div style={{ color: getGradeColor(grade) }}>Content</div>
```

---

## File Organization

### Must-Know Locations

| Purpose          | Location                     |
| ---------------- | ---------------------------- |
| Main app         | `src/App.jsx`                |
| Entry point      | `src/main.jsx`               |
| Global styles    | `src/index.css`              |
| State management | `src/context/AppContext.jsx` |
| Custom hooks     | `src/hooks/useAppContext.js` |
| Date utilities   | `src/utils/dateUtils.js`     |
| Data parsing     | `src/utils/dataParser.js`    |
| React components | `src/components/`            |
| Data files       | `public/data/`               |
| Build config     | `vite.config.js`             |
| Tailwind config  | `tailwind.config.js`         |

---

## Utility Functions

### Date Utilities (`src/utils/dateUtils.js`)

```javascript
// Format date
formatDate(date); // Returns: "Sunday, March 23, 2026, 10:23:16 AM"

// Get Today's Code
getTodayCode(); // Returns: "MON", "TUE", etc.

// Get Today's Classes
getTodaysClasses(routines); // Returns: classes for today

// Get Running Events
getRunningEventsToday(calendarEvents); // Returns: events running

// Format Course Label
formatCourseLabel(code, courseNameMap);
// Returns: "Course Name (CODE)"
```

### Data Utilities (`src/utils/dataParser.js`)

```javascript
// Fetch JSON Data
fetchData('/data/user.json'); // Returns: parsed JSON

// Format Currency
formatCurrency(57580); // Returns: "57,580 ৳"

// Grade Colors
getGradeColor('high'); // Returns: '#d1fae5'
getGradeTextColor('high'); // Returns: '#065f46'
```

---

## Component API Reference

### Common Components

```jsx
// Card
<Card variant="default|notice|classes" onClick={fn}>
  Content
</Card>

// Button
<Button onClick={fn} className="custom-class">
  Click Me
</Button>

// Tile
<Tile icon="icon_name" label="Label" onClick={fn} />

// TopBar
<TopBar title="Page Title" onBack={() => setCurrentScreen('home')} />

// SectionTitle
<SectionTitle eyebrow="SUBTITLE" title="Main Title" />

// EmptyState
<EmptyState message="No data available" />
```

---

## Color System

### CSS Variables (from `index.css`)

```css
--primary: #1d92ff /* Main blue */ --primary-strong: #1770d4 /* Darker blue */ --accent: #f7a600
  /* Orange */ --bg: #f6f7fb /* Light background */ --card: #ffffff /* White cards */
  --text: #0f1623 /* Text color */ --muted: #5d6b86 /* Secondary text */;
```

### Grade Badges

```
High (3.0+):  Green background  (#d1fae5) / Green text (#065f46)
Mid (2.0-3.0): Yellow background (#fef3c7) / Yellow text (#92400e)
Low (<2.0):   Red background    (#fee2e2) / Red text (#991b1b)
```

### Status Indicators

```
Due/Error:  Red (#991b1b)
OK/Paid:    Green (#065f46)
Pending:    Yellow (#92400e)
```

---

## Responsive Design

### Breakpoints (via Tailwind)

```jsx
// Mobile First (default)
<div className="w-full">Mobile</div>

// Tablet and up
<div className="md:w-1/2 lg:w-1/3">Responsive</div>

// Using CSS variables with clamp()
<div style={{
  width: 'clamp(100px, 10vw, 150px)' // Min, preferred, max
}}>
  Fluid width
</div>
```

---

## Adding a Feature

### Example: Add Exam Scores

1. **Create JSON file** - `public/data/exam-scores.json`

   ```json
   {
     "exams": [{ "course": "ACC 2102", "theory": 75, "practical": 80 }]
   }
   ```

2. **Update AppContext**

   ```jsx
   const [examScores, setExamScores] = useState([]);

   // In loadAllData()
   const scoresData = await fetchData('/data/exam-scores.json');
   if (scoresData?.exams) setExamScores(scoresData.exams);
   ```

3. **Create Component** - `src/components/ExamScores/ExamScores.jsx`

   ```jsx
   import { useAppContext } from '../../hooks/useAppContext';

   export function ExamScores() {
     const { examScores, setCurrentScreen } = useAppContext();

     return (
       <div className="page-container">
         <TopBar title="Exam Scores" onBack={() => setCurrentScreen('home')} />
         {/* Render exam data */}
       </div>
     );
   }
   ```

4. **Add to App.jsx**

   ```jsx
   case 'exams': return <ExamScores />;
   ```

5. **Add Menu Item**
   ```jsx
   { screen: 'exams', label: 'Exam Scores' }
   ```

---

## Debugging

### Common Issues

**Data not loading?**

- Check JSON filename in `public/data/`
- Verify fetch path in `AppContext.jsx`
- Check browser console for errors

**Component not rendering?**

- Verify import statement
- Check case in screen name (must match exactly)
- Ensure component exports properly

**Styling looks wrong?**

- Check CSS variable names
- Verify Tailwind classes
- Clear `.next` or `dist` and rebuild

### Enable Debug Logging

In `src/context/AppContext.jsx`:

```jsx
console.log('Loading data...');
// Check what loaded
console.log(userData, resultsData, etc.);
```

---

## Deployment

### Build for Production

```bash
npm run build
# Creates dist/ folder with optimized files
```

### Deploy to Server

```bash
# Copy contents of dist/ folder to server
# Or use your hosting platform's deploy command
```

### Environment Variables

Create `.env` file:

```
VITE_API_URL=https://api.example.com
```

Access in code:

```javascript
const apiUrl = import.meta.env.VITE_API_URL;
```

---

## Performance Tips

1. **Lazy Load Images**

   ```jsx
   <img loading="lazy" src="..." alt="..." />
   ```

2. **Memoize Components**

   ```jsx
   export const MyComponent = React.memo(({ data }) => (...))
   ```

3. **Use useCallback**

   ```jsx
   const handleClick = useCallback(() => {
     // handler logic
   }, [dependency]);
   ```

4. **Code Splitting**
   ```jsx
   const Component = lazy(() => import('./Component'));
   ```

---

## Support & Resources

- **React Docs**: https://react.dev
- **Vite Docs**: https://vitejs.dev
- **Tailwind Docs**: https://tailwindcss.com
- **Material Symbols**: https://fonts.google.com/icons

---

**Last Updated**: March 23, 2026  
**Status**: Production Ready  
**Version**: 1.0.0
