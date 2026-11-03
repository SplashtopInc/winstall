const PUBLISHER_PREFIX = /^publisher:\s*(.+)$/i;
const TAG_PREFIX = /^tags:\s*(.+)$/i;

export function parsePublisherQuery(q) {
  const match = String(q || "").trim().match(PUBLISHER_PREFIX);
  if (!match) return null;
  const name = match[1].trim();
  return name || null;
}

export function parseTagQuery(q) {
  const match = String(q || "").trim().match(TAG_PREFIX);
  if (!match) return null;
  const tag = match[1].trim();
  return tag || null;
}

export function parseAppsListQuery(q) {
  const trimmed = String(q || "").trim();
  if (!trimmed) return { kind: "list" };

  const publisher = parsePublisherQuery(trimmed);
  if (publisher) return { kind: "publisher", publisher };

  const tag = parseTagQuery(trimmed);
  if (tag) return { kind: "tag", tag };

  return { kind: "search", q: trimmed };
}

export function listScopeKey(parsed) {
  if (!parsed || parsed.kind === "list") return "list";
  if (parsed.kind === "publisher") return `publisher:${parsed.publisher}`;
  if (parsed.kind === "tag") return `tag:${parsed.tag}`;
  return `search:${parsed.q}`;
}

export function publishersListPath(name, { offset = 0, limit = 60 } = {}) {
  return `/publishers/${encodeURIComponent(name)}?offset=${offset}&limit=${limit}`;
}

export function tagListPath(tag, { offset = 0, limit = 60 } = {}) {
  return `/apps/tags/${encodeURIComponent(tag)}?offset=${offset}&limit=${limit}`;
}

/** Browser URL for /apps with optional ?q= (encodes + and other specials). */
export function appsPagePath(query) {
  const q = String(query ?? "").trim();
  if (!q) return "/apps";
  const params = new URLSearchParams();
  params.set("q", q);
  return `/apps?${params.toString()}`;
}

export function publisherAppsPagePath(publisher) {
  const name = String(publisher ?? "").trim();
  if (!name) return "/apps";
  return appsPagePath(`publisher: ${name}`);
}

export function tagAppsPagePath(tag) {
  const name = String(tag ?? "").trim();
  if (!name) return "/apps";
  return appsPagePath(`tags: ${name}`);
}

export function appsListPath(query, { offset = 0, limit = 60 } = {}) {
  const parsed =
    query && typeof query === "object" && query.kind
      ? query
      : parseAppsListQuery(query);

  if (parsed.kind === "publisher") {
    return publishersListPath(parsed.publisher, { offset, limit });
  }

  if (parsed.kind === "tag") {
    return tagListPath(parsed.tag, { offset, limit });
  }

  if (parsed.kind === "search") {
    const params = new URLSearchParams();
    params.set("q", parsed.q);
    params.set("offset", String(offset));
    params.set("limit", String(limit));
    return `/apps/search?${params.toString()}`;
  }

  return `/apps?offset=${offset}&limit=${limit}`;
}
