
# 🎨 Integrating Multiple Themes into Frappe Gantt

This guide outlines how to install Frappe Gantt, fix the Vite CSS error, and include three theme styles (default, light, and dark).

---

## ✅ 1. Install Frappe Gantt

```bash
npm install frappe-gantt
```

---

## ✅ 2. Fix the CSS Import Error (Vite-Compatible)

### Option A: Use CDN in `public/index.html`
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/frappe-gantt/dist/frappe-gantt.css">
```

### Option B: Manual Import

1. Download `frappe-gantt.css` from:
   https://github.com/frappe/gantt/blob/release/src/styles/gantt.css

2. Place it in: `src/styles/frappe-gantt.css`

3. Import it manually:
```tsx
import '@/styles/frappe-gantt.css';
```

---

## 🎨 3. Include 3 Themes (Default, Light, Dark)

### Define Theme Containers
```html
<div id="gantt-container" class="gantt-container light-theme">
  <!-- Gantt chart will render here -->
</div>
```

### Theme Toggle Script
```js
function setTheme(theme) {
  const container = document.getElementById('gantt-container');
  container.classList.remove('light-theme', 'dark-theme');
  container.classList.add(\`\${theme}-theme\`);
}
```

### Add Theme Toggle Buttons
```html
<button onclick="setTheme('light')">Light Theme</button>
<button onclick="setTheme('dark')">Dark Theme</button>
```

---

## 🖌 4. Dark Theme CSS Example

```css
.dark-theme .gantt .grid-header {
  fill: #252525;
  stroke: #616161;
}
.dark-theme .gantt .grid-row {
  fill: #252525;
}
.dark-theme .gantt .grid-row:nth-child(even) {
  fill: #3e3e3e;
}
.dark-theme .gantt .row-line {
  stroke: #3e3e3e;
}
.dark-theme .gantt .tick {
  stroke: #616161;
}
.dark-theme .gantt .bar {
  fill: #616161;
  stroke: none;
}
.dark-theme .gantt .bar-progress {
  fill: #8a8aff;
}
.dark-theme .gantt .bar-label {
  fill: #ececec;
}
.dark-theme .gantt .arrow {
  stroke: #eee;
}
.dark-theme .gantt .popup-wrapper {
  background-color: #333;
}
.dark-theme .gantt .popup-wrapper .title {
  border-color: #8a8aff;
}
.dark-theme .gantt .popup-wrapper .pointer {
  border-top-color: #333;
}
```

---

## 🧠 5. Initialize Gantt Chart

```ts
import Gantt from 'frappe-gantt';

const tasks = [
  {
    id: 'Task 1',
    name: 'Design Phase',
    start: '2025-04-01',
    end: '2025-04-05',
    progress: 20,
  },
];

new Gantt('#gantt-container', tasks, {
  view_mode: 'Week',
  date_format: 'YYYY-MM-DD',
});
```

---

## ✅ Additional Recommendations

- Use `localStorage` to remember user's selected theme
- Use responsive design for mobile-friendly timelines
- Ensure accessibility with color contrast ratios

---
