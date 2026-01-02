## 2024-05-23 - Chat Input Accessibility
**Learning:** Icon-only buttons (like Send) are invisible to screen readers without explicit `aria-label`. Dynamic labels (e.g., "Send" vs "Sending...") provide critical feedback for async actions that visual users get from spinners.
**Action:** Always pair `aria-label` with dynamic state for submit buttons. Use `title` as a lightweight tooltip for mouse users.
