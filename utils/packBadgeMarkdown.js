export function buildPackBadgeMarkdown(shareUrl) {
  const origin = new URL(shareUrl).origin;
  return `[![Open in winstall](${origin}/badge.svg)](${shareUrl})`;
}
