## 2024-05-24 - Accessibility for Icon-only Buttons
**Learning:** Icon-only buttons (like settings, close, send) are invisible to screen readers without `aria-label`. Standard pattern is `aria-label="Action"` on button and `aria-hidden="true"` on the icon.
**Action:** Always check `AppLayout` and Modals for icon-only buttons and apply this pattern.
