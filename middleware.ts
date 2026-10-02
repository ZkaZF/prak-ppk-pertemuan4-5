import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "session";
const PROTECTED_PATHS = ["/dashboard"];
const AUTH_PATHS = ["/login", "/register"];

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;
    const hasSession = Boolean(req.cookies.get(SESSION_COOKIE)?.value);

    const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
    const isAuthPage = AUTH_PATHS.some((p) => pathname.startsWith(p));

    if (isProtected && !hasSession) {
        const url = req.nextUrl.clone();
        url.pathname = "/login";
        url.searchParams.set("redirect", pathname);
        return NextResponse.redirect(url);
    }

    if (isAuthPage && hasSession) {
        const url = req.nextUrl.clone();
        url.pathname = "/dashboard";
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard/:path*", "/login", "/register"],
};