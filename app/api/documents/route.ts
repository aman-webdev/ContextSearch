import { DocumentType } from "@/lib/generated/prisma";
import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";

export const GET = async (request: NextRequest) => {
  try {
    // Get user info from middleware
    const userId = request.headers.get("x-user-id");

    if (!userId) {
      return new Response(JSON.stringify({
        success: false,
        error: "Authentication required"
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');

    let documents;

    if (type) {
      documents = await prisma.uploadedDocuments.findMany({
        where: {
          documentType: type as unknown as DocumentType,
          userId: userId  // Only get documents for this user
        },
        orderBy: {
          uploadedAt: 'desc'
        },
        include: {
          video: true
        }
      });
    } else {
      documents = await prisma.uploadedDocuments.findMany({
        where: {
          userId: userId  // Only get documents for this user
        },
        orderBy: {
          uploadedAt: 'desc'
        },
        include: {
          video: true
        }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      data: documents
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error fetching documents:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch documents'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// export const DELETE = async (request: NextRequest) => {
//   try {
//     const { id } = await request.json();

//     if (!id) {
//       return new Response(JSON.stringify({
//         success: false,
//         error: 'Document ID is required'
//       }), {
//         status: 400,
//         headers: { 'Content-Type': 'application/json' }
//       });
//     }

//     await prisma.uploadedDocuments.delete({
//       where: { id }
//     });

//     return new Response(JSON.stringify({
//       success: true,
//       message: 'Document deleted successfully'
//     }), {
//       status: 200,
//       headers: { 'Content-Type': 'application/json' }
//     });

//   } catch (error) {
//     console.error('Error deleting document:', error);
//     return new Response(JSON.stringify({
//       success: false,
//       error: 'Failed to delete document'
//     }), {
//       status: 500,
//       headers: { 'Content-Type': 'application/json' }
//     });
//   }
// };