import jwt from 'jsonwebtoken';
import prisma from './prisma';

interface AuthResult {
  success: boolean;
  user?: {
    id: string;
    type: string;
    sessionId?: string;
    email?: string;

  };
  error?: string;
}

export async function authenticateRequest(request: Request): Promise<AuthResult> {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        success: false,
        error: 'No authorization token provided'
      };
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY || 'mysecret') as {id: string; userType: string};

    // Get user from database to ensure they still exist
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (!user) {
      return {
        success: false,
        error: 'User not found'
      };
    }

    // Return user info
    return {
      success: true,
      user: {
        id: user.id,
        type: user.type,
        sessionId: user.sessionId || undefined,
        email: user.email || undefined
      }
    };

  } catch (error) {
    console.error('Auth error:', error);
    return {
      success: false,
      error: 'Invalid or expired token'
    };
  }
}

// Helper function for easy usage in API routes
export function withAuth(handler: (request: Request, user: {id: string; userType: string; sessionId?: string; email?: string}) => Promise<Response>) {
  return async (request: Request) => {
    const authResult = await authenticateRequest(request);

    if (!authResult.success) {
      return new Response(JSON.stringify({
        error: authResult.error
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (authResult.user) {
      return handler(request, {
        id: authResult.user.id,
        userType: authResult.user.type,
        sessionId: authResult.user.sessionId,
        email: authResult.user.email
      });
    } else {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  };
}