import prisma from "@/lib/prisma";
import { addDocumentToVectorStore, loadDocument } from "@/lib/services/langchain";
import saveFile from "@/lib/services/saveFileLocally";
import uploadFile from "@/lib/supabase/uploadFile";

export const POST = async(request: Request) => {
    try{
        // Get user info from middleware
        const userId = request.headers.get("x-user-id");
        const userType = request.headers.get("x-user-type");

        if (!userId) {
            return new Response(JSON.stringify({ error: "Authentication required" }), {
                status: 401,
            });
        }

        const contentType = request.headers.get('content-type') || '';
        if(!contentType.includes('multipart/form-data')) {
            return new Response(JSON.stringify({error:'Invalid content type'}), { status: 400 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return new Response('No file uploaded', { status: 400 });
        }

        // Check upload limits based on user type
        const uploadLimit = userType === 'GUEST' ? 5 : 50;
        const userUploadsCount = await prisma.uploadedDocuments.count({
            where: { userId: userId }
        });

        if (userUploadsCount >= uploadLimit) {
            return new Response(JSON.stringify({
                error: `Upload limit reached (${uploadLimit} uploads). ${userType === 'GUEST' ? 'Please register for more uploads.' : ''}`,
                limitReached: true
            }), {
                status: 429,
            });
        }

    // const uploadFileRes = await uploadFile(file);
   const path =  await saveFile(file)

    //TODO: update this to filePath
    const {docs, additionalDocMetadata} = await loadDocument(path)
    console.log("got chunks", docs.length)
    await addDocumentToVectorStore(docs)

    const result = await prisma.uploadedDocuments.create({
        data: {
            documentType : additionalDocMetadata.type,
            source : additionalDocMetadata.fileName,
            ext : additionalDocMetadata.ext,
            userId : userId
        }
    })


    return new Response(JSON.stringify({
        message : `File ${file.name} uploaded successfully`,
        data : result
    }),{status:201});

    }
    catch(err) {
        return new Response('Something went wrong', { status: 500 });
    }
   
}