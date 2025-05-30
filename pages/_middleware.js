import { NextResponse } from 'next/server';

export async function middleware(req) {
    // Define public routes that don't require authentication
    const publicPaths = ['/login', '/register', '/'];
    const isPublic = publicPaths.some(path => req.nextUrl.pathname === path);

    // Get the authentication token (adjust based on your auth method)
    const token = req.cookies.get('token'); // Assuming token is stored in a cookie

    // If the route is not public and no token is present, redirect to login
    if (!isPublic && !token) {
        return NextResponse.redirect(new URL('/login', req.url));
    }

    // Add no-cache headers to prevent browser caching
    const response = NextResponse.next();
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;
}