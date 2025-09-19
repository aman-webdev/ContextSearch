import prisma from "@/lib/prisma";
import create256Hash from "@/lib/services/createHash";
import { SignJWT } from 'jose'
export const GET = async (request: Request) => {
  try {
    const agent = request.headers.get("user-agent")
     const ip = (request.headers.get('x-real-ip') ) || request.headers.get("x-forwarded-for")
    
     const sessionHash = create256Hash(`${ip}_${agent}`)

     const userExists = await prisma.user.findFirst({
       where : {
        sessionId : sessionHash
       }
    
     })


     if(userExists && userExists.type !== 'GUEST') {
      console.log('Registered user exists - redirect to login')
      return new Response(JSON.stringify({
        message: `Registered user exists. Please use /api/login`
      }), { status: 400 })
     }

     if(userExists && userExists.type === 'GUEST') {
      console.log('Existing guest user - refresh token')
      const secret = new TextEncoder().encode(process.env.JWT_SECRET_KEY || 'mysecret')
      const signedToken = await new SignJWT({
        id: userExists.id,
        sessionId: userExists.sessionId,
        type: userExists.type
      })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('1h')
      .sign(secret)

      return new Response(JSON.stringify({
        data: signedToken,
        message: "Guest session refreshed"
      }))
     }

     // Create new guest user
     const user = await prisma.user.create({
      data : {
        sessionId : sessionHash,
        type : "GUEST"
      }
     })

     const secret = new TextEncoder().encode(process.env.JWT_SECRET_KEY || 'mysecret')
     const signedToken = await new SignJWT({
       id: user.id,
       sessionId: user.sessionId,
       type: user.type
     })
     .setProtectedHeader({ alg: 'HS256' })
     .setExpirationTime('1h')
     .sign(secret)
     return new Response(JSON.stringify({data: signedToken, message : "New guest session established"}))


 
  } catch (err) {
    console.log("me endpoint error: ", err);
    return new Response("Something went wrong", { status: 500 });
  }
};