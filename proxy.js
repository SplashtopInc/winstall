import { NextResponse } from "next/server";

import { categoryQueryRedirectPath } from "./utils/categoryShelfPath.js";

export function proxy(request) {
  const url = request.nextUrl;
  if (url.pathname !== "/category") return NextResponse.next();

  const category = url.searchParams.get("category");
  const destination = categoryQueryRedirectPath(category);
  if (!destination) return NextResponse.next();

  url.pathname = destination;
  url.searchParams.delete("category");
  return NextResponse.redirect(url, 308);
}

export const config = {
  matcher: "/category",
};
