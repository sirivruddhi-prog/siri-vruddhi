export const HEADER_SCROLL_OFFSET = 88;

export const HOME_SECTION_IDS = [
  'stats',
  'teaser',
  'about',
  'spaces',
  'facilities',
  'reviews',
  'dining',
  'contact',
] as const;

export function scrollToSection(id: string, behavior: ScrollBehavior = 'smooth'): void {
  const el = document.getElementById(id);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - HEADER_SCROLL_OFFSET;
  window.scrollTo({ top: Math.max(0, top), behavior });
}

export function getActiveSection(sectionIds: readonly string[]): string {
  const marker = window.scrollY + HEADER_SCROLL_OFFSET + 120;
  let active = sectionIds[0] || '';
  for (const id of sectionIds) {
    const el = document.getElementById(id);
    if (el && el.offsetTop <= marker) {
      active = id;
    }
  }
  return active;
}

export function getScrollProgress(): number {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  if (scrollable <= 0) return 0;
  return Math.min(1, Math.max(0, window.scrollY / scrollable));
}
