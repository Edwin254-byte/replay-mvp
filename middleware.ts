import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Check if user has MANAGER role for dashboard access
    const token = req.nextauth.token;

    if (req.nextUrl.pathname.startsWith("/dashboard")) {
      if (!token || token.role !== "MANAGER") {
        return NextResponse.redirect(new URL("/login", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*"],
};
