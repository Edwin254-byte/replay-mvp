import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req) {
    // Additional logic can be added here
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
