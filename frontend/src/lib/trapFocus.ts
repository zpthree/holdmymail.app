export function trapFocus(e: KeyboardEvent, modalId: string): void {
  const isTabPressed = e.key === "Tab" || e.keyCode === 9;

  if (!isTabPressed) {
    return;
  }

  const focusableSelector =
    'button, [href], input, select, textarea, iframe, [tabindex]:not([tabindex="-1"])';
  const modal = document.getElementById(modalId);
  if (!modal) return;

  const focusableContent =
    modal.querySelectorAll<HTMLElement>(focusableSelector);
  if (focusableContent.length === 0) return;

  const firstFocusableElement: HTMLElement =
    modalId === "mobile-nav-wrapper"
      ? (document.querySelector<HTMLElement>(".toggleMobileNav") ??
        focusableContent[0])
      : focusableContent[0];
  const lastFocusableElement: HTMLElement =
    focusableContent[focusableContent.length - 1];

  if (e.shiftKey) {
    if (document.activeElement === firstFocusableElement) {
      lastFocusableElement.focus();
      e.preventDefault();
    }
  } else if (
    document.activeElement === lastFocusableElement ||
    !modal.contains(document.activeElement)
  ) {
    firstFocusableElement.focus();
    e.preventDefault();
  }
}
