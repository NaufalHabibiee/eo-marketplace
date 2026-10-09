import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE_KEY, SUPABASE_URL } from "@/lib/supabase/env";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet, headers) => {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
      },
    },
  });

  // Refreshes an expiring session; must run before any redirect decision.
  const { data } = await supabase.auth.getClaims();
  const path = request.nextUrl.pathname;

  if (!data?.claims && path !== "/admin/login") {
    const url = request.nextUrl.clone();
    url.search = "";
    if (path.startsWith("/admin")) {
      url.pathname = "/admin/login";
    } else {
      url.pathname = "/masuk";
      url.searchParams.set("next", path);
    }
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/akun", "/akun/:path*"],
};
