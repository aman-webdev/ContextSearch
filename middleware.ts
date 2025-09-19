import {NextRequest, NextResponse} from "next/server"
import { jwtVerify } from "jose"

const authRules: Record<string, Record<string, boolean>> = {
    '/api/me': {
        'GET': false,    // No auth - creates guest sessions
    },
    '/api/chat': {
        'GET': true,     // Auth required - fetch user's chat history
        'POST': true     // Auth required - send messages (check limits)
    },
    '/api/upload': {
        'POST': true     // Auth required - upload files (check limits)
    },
    '/api/website': {
        'POST': true     // Auth required - process websites (check limits)
    },
    '/api/youtube': {
        'POST': true     // Auth required - process YouTube (check limits)
    },
    '/api/documents': {
        'GET': true      // Auth required - fetch user's documents
    },
    '/api/videos': {
        'GET': true      // Auth required - fetch user's videos
    },
    '/api/health': {
        'GET': false     // No auth - health check endpoint
    }
};

export async function middleware(request : NextRequest) {
    console.log('PATH: ',request.nextUrl.pathname,request.method)
    const path = request.nextUrl.pathname;
    const method = request.method

    const authPath = authRules[path]
    if(!authPath) return NextResponse.next()

    const isAuthRequired = authPath[method]
    if(!isAuthRequired) return NextResponse.next()

    const token = request.headers.get("authorization")
    const jwtToken = token?.split("Bearer ").pop()
    if(!jwtToken) return new NextResponse(JSON.stringify({message : "Invalid session"}),{status:401})

    try {
        // Convert secret to Uint8Array for jose
        const secret = new TextEncoder().encode(process.env.JWT_SECRET_KEY || 'mysecret')

        // Verify JWT token with jose
        const { payload } = await jwtVerify(jwtToken, secret)
        console.log('Verified user:', payload.id, payload.type)

        // Add user info to headers for API routes
        const requestHeaders = new Headers(request.headers)
        requestHeaders.set('x-user-id', payload.id as string)
        requestHeaders.set('x-user-type', payload.type as string)
        if (payload.sessionId) {
            requestHeaders.set('x-session-id', payload.sessionId as string)
        }

        return NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        })
    } catch (error) {
        console.error('JWT verification failed:', error)

        // Check if it's an expiration error
        const errorMessage = error instanceof Error ? error.message : String(error)
        if (errorMessage.includes('exp') || errorMessage.includes('expired')) {
            return new NextResponse(JSON.stringify({
                message: "Token expired",
                expired: true,
                redirect: "/api/me"
            }), {status:401})
        }

        return new NextResponse(JSON.stringify({
            message: "Invalid token"
        }), {status:401})
    }
}