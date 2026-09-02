const PUBLISHER_PREFIX = /^publisher:\s*(.+)$/i;
const FIELD_PREFIX = /^(name|tags|desc):\s*(.+)$/i;

export function parsePublisherQuery(q) {
  const match = String(q || "").trim().match(PUBLISHER_PREFIX);
  if (!match) return null;
  const name = match[1].trim();
  return name || null;
}

export function parseAppsListQuery(q) {
  const trimmed = String(q || "").trim();
  if (!trimmed) return { kind: "list" };

  const publisher = parsePublisherQuery(trimmed);
  if (publisher) return { kind: "publisher", publisher };

  const fieldMatch = trimmed.match(FIELD_PREFIX);
  if (fieldMatch) {
    const field = fieldMatch[1].toLowerCase();
    const value = fieldMatch[2].trim();
    if (!value) return { kind: "list" };
    return { kind: "search", q: value, field };
  }

  return { kind: "search", q: trimmed };
}

export function listScopeKey(parsed) {
  if (!parsed || parsed.kind === "list") return "list";
  if (parsed.kind === "publisher") return `publisher:${parsed.publisher}`;
  if (parsed.field) return `search:${parsed.field}:${parsed.q}`;
  return `search:${parsed.q}`;
}

export function suggestionQueryFromListQuery(q) {
  const parsed = parseAppsListQuery(q);
  if (parsed.kind === "publisher") return parsed.publisher;
  if (parsed.kind === "search") return parsed.q;
  return "";
}

export function publishersListPath(name, { offset = 0, limit = 60 } = {}) {
  return `/publishers/${encodeURIComponent(name)}?offset=${offset}&limit=${limit}`;
}

/** Browser URL for /apps with optional ?q= and ?page= (encodes + and other specials). */
export function appsPagePath(query, { page } = {}) {
  const q = String(query ?? "").trim();
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (page != null && page > 1) params.set("page", String(page));
  const search = params.toString();
  return search ? `/apps?${search}` : "/apps";
}

export function publisherAppsPagePath(publisher) {
  const name = String(publisher ?? "").trim();
  if (!name) return "/apps";
  return appsPagePath(`publisher: ${name}`);
}

export function appsListPath(query, { offset = 0, limit = 60 } = {}) {
  const parsed =
    query && typeof query === "object" && query.kind
      ? query
      : parseAppsListQuery(query);

  if (parsed.kind === "publisher") {
    return publishersListPath(parsed.publisher, { offset, limit });
  }

  if (parsed.kind === "search") {
    const params = new URLSearchParams();
    params.set("q", parsed.q);
    if (parsed.field) params.set(parsed.field, parsed.q);
    params.set("offset", String(offset));
    params.set("limit", String(limit));
    return `/apps/search?${params.toString()}`;
  }

  return `/apps?offset=${offset}&limit=${limit}`;
}
