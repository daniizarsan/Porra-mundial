import { withAuth } from 'next-auth/middleware';

export default withAuth({
  pages: {
    signIn: '/login',
  },
});

export const config = {
  matcher: ['/dashboard/:path*', '/predictions/:path*', '/leaderboard/:path*', '/participants/:path*', '/admin/:path*', '/profile/:path*'],
};
