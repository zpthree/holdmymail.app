import { goto } from "$app/navigation";

/** Build a URL for `path` filtered to the given tag names */
export function tagFilterHref(path: string, names: string[]): string {
  const params = new URLSearchParams();
  for (const name of names) params.append("tag", name);
  const query = params.toString();
  return query ? `${path}?${query}` : path;
}

/** Navigate to `path` filtered to the given tag names, keeping scroll/focus */
export function applyTagFilter(path: string, names: string[]) {
  return goto(tagFilterHref(path, names), {
    keepFocus: true,
    noScroll: true,
    replaceState: true,
  });
}
