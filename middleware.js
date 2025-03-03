import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(request) {
  const token = request.cookies.get("accessToken");

  if (token) {
    try {
      const decodedToken = jwt.decode(token.value);

      // Check if the token is expired
      const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
      if (decodedToken && decodedToken.exp < currentTime) {
        // Token is expired, clear the cookie and redirect to login
        const response = NextResponse.redirect(new URL("/login", request.url));
        response.cookies.set("accessToken", "", { expires: new Date(0) });
        return response;
      }

      const fullName = decodedToken ? decodedToken.fullname : "";

      // Add fullName to the request headers
      const response = NextResponse.next();
      response.headers.set("x-fullname", fullName);
      return response;
    } catch (error) {
      console.error("Error decoding token:", error);
    }
  }

  const { pathname } = request.nextUrl;

  // ✅ Allow access to public routes (login, register)
  if (pathname === "/login" || pathname === "/register") {
    return NextResponse.next();
  }

  // ✅ Allow CSS, images, fonts, and static files
  if (
    pathname.startsWith("/_next/") || // Next.js internal files
    pathname.startsWith("/static/") || // Public static assets
    pathname.endsWith(".css") || // CSS files
    pathname.endsWith(".js") || // JS files
    pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|webp|woff|woff2|eot|ttf|otf)$/) // Fonts & images
  ) {
    return NextResponse.next();
  }

  // ✅ Redirect logged-out users back to login if they try accessing protected pages
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}
