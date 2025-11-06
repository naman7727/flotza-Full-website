# Styling Guide

<br><br>

## 🧩 Tailwind UI Guidelines

## 🌈 Color Theming (based on your `tailwind.config.js`)

| Alias                           | Description          | Tailwind Gray |
| ------------------------------- | -------------------- | ------------- |
| `text-color`                    | Body/paragraph text  | `gray-100`    |
| `subheading-color`              | Subtitles, hints     | `gray-200`    |
| `border-color`                  | Light borders        | `gray-300`    |
| `placeholder-color`             | Input placeholder    | `gray-400`    |
| `icon-color`                    | Icons                | `gray-500`    |
| `secondary-hover-color`         | Button hover         | `gray-600`    |
| `secondary-color`               | Secondary button bg  | `gray-700`    |
| `primary-color`                 | Primary button bg    | `gray-800`    |
| `scrollbar-color`               | Scrollbars, dark UI  | `gray-900`    |
| `background-color`              | Full dark background | `gray-950`    |
| `shadow-color` / `accent-color` | Highlights, shadows  | `gray-50`     |

---

## 🖱️ Buttons

### ✅ Primary Button

```html
<button class="bg-primary-color text-text-color px-4 py-2 rounded hover:bg-secondary-hover-color shadow-sm">
  Submit
</button>
```

### 🟨 Secondary Button

```html
<button class="bg-secondary-color text-text-color px-4 py-2 rounded hover:bg-secondary-hover-color border border-border-color">
  Cancel
</button>
```

---

## 🔡 Inputs

```html
<input
  type="text"
  placeholder="Enter name"
  class="bg-background-color text-text-color placeholder-placeholder-color border border-border-color px-3 py-2 rounded w-full"
/>
```

---

## ✅ Checkbox

```html
<label class="inline-flex items-center space-x-2">
  <input
    type="checkbox"
    class="form-checkbox text-primary-color bg-background-color border-border-color"
  />
  <span class="text-subheading-color">Accept terms</span>
</label>
```

---

## 🎚 Switch (Toggle)

```html
<label class="flex items-center cursor-pointer">
  <div class="relative">
    <input type="checkbox" class="sr-only peer" />
    <div class="w-10 h-5 bg-border-color peer-checked:bg-primary-color rounded-full transition-colors"></div>
    <div class="w-4 h-4 bg-accent-color absolute top-0.5 left-0.5 rounded-full peer-checked:translate-x-5 transition-transform"></div>
  </div>
  <span class="ml-3 text-subheading-color">Enable Notifications</span>
</label>
```

---

## 📅 Date Picker (Browser Default)

```html
<input
  type="date"
  class="bg-background-color text-text-color border border-border-color px-3 py-2 rounded"
/>
```

## 📆 DateTime Picker

```html
<input
  type="datetime-local"
  class="bg-background-color text-text-color border border-border-color px-3 py-2 rounded"
/>
```

---

## 🧪 Textarea

```html
<textarea
  rows="4"
  placeholder="Type your message..."
  class="bg-background-color text-text-color placeholder-placeholder-color border border-border-color px-3 py-2 rounded w-full"
/>
```

---

## 📎 File Input

```html
<input
  type="file"
  class="file:bg-primary-color file:text-text-color file:border-0 file:px-4 file:py-2 file:rounded file:cursor-pointer text-subheading-color"
/>
```

---

## 🧾 Typography

```html
<h1 class="text-2xl font-bold text-text-color">Heading 1</h1>
<h2 class="text-xl font-semibold text-subheading-color">Subheading</h2>
<p class="text-text-color mt-2">
  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
</p>
```

---

## 🌐 Scrollbar Styling

```css
/* tailwind.config.js enables it, then in your global CSS: */

::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-thumb {
  background-color: var(--tw-color-scrollbar-color); /* or manually #111827 */
  border-radius: 4px;
}
```

---

## ✨ Tips

* Always **use color aliases** like `bg-primary-color`, `text-placeholder-color`, etc., to maintain design consistency.
* Use `peer` and `group` classes for interactive states (e.g., showing validation when input is filled).
* Use utility-first styling for form controls but optionally extract components for reusability.
* Use `@apply` in your CSS if you want cleaner templates.


