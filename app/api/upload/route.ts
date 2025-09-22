import prisma from "@/lib/prisma";
import { addDocumentToVectorStore, loadDocument } from "@/lib/services/langchain";
import saveFile from "@/lib/services/saveFileLocally";
// import uploadFile from "@/lib/supabase/uploadFile";

export const POST = async(request: Request) => {
    try{
        // Get user info from middleware
        const userId = request.headers.get("x-user-id");
        const userType = request.headers.get("x-user-type");

        if (!userId) {
            return new Response(JSON.stringify({ error: "Authentication required" }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const contentType = request.headers.get('content-type') || '';
        if(!contentType.includes('multipart/form-data')) {
            return new Response(JSON.stringify({error:'Invalid content type'}), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return new Response(JSON.stringify({ error: 'No file uploaded' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Check upload limits based on user type
        const uploadLimit = userType === 'GUEST' ? 15 : 50;
        const userUploadsCount = await prisma.uploadedDocuments.count({
            where: { userId: userId }
        });

        if (userUploadsCount >= uploadLimit) {
            return new Response(JSON.stringify({
                error: `Upload limit reached (${uploadLimit} uploads). ${userType === 'GUEST' ? 'Please register for more uploads.' : ''}`,
                limitReached: true
            }), {
                status: 429,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Validate file type - only PDF files allowed now
        const fileName = file.name.toLowerCase();
        if (!fileName.endsWith('.pdf')) {
            return new Response(JSON.stringify({
                error: 'Only PDF files are allowed. For subtitle files (SRT/VTT), please use the subtitle upload endpoint.'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Check if file already exists for this user
        const existingFile = await prisma.uploadedDocuments.findFirst({
            where: {
                userId: userId,
                source: file.name,
                documentType: 'FILE'
            }
        });

        if (existingFile) {
            return new Response(JSON.stringify({
                error: `File "${file.name}" already exists. Please choose a different file or rename it.`
            }), {
                status: 409,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // const uploadFileRes = await uploadFile(file);
        const path = await saveFile(file)

        //TODO: update this to filePath
        let docs, additionalDocMetadata;
        try {
            const result = await loadDocument(path, userId);
            docs = result.docs;
            additionalDocMetadata = result.additionalDocMetadata;
            console.log("got chunks", docs.length)
            await addDocumentToVectorStore(docs)
        } catch (loadError) {
            console.error('Error loading document:', loadError);
            return new Response(JSON.stringify({
                error: loadError instanceof Error ? loadError.message : 'Error processing PDF file'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const result = await prisma.uploadedDocuments.create({
            data: {
                documentType: 'FILE',
                source: additionalDocMetadata.source,
                ext: additionalDocMetadata.ext,
                userId: userId
            }
        })

        return new Response(JSON.stringify({
            message : `File ${file.name} uploaded successfully`,
            data : result
        }),{status:201});

    }
    catch(err) {
        console.error('Upload API error:', err);
        return new Response(JSON.stringify({
            error: 'Something went wrong'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
   
}