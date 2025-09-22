import prisma from "@/lib/prisma";
import { addDocumentToVectorStore } from "@/lib/services/langchain";
import saveFile from "@/lib/services/saveFileLocally";
import loadSubtitleFile from "@/lib/services/loadsubtitles";

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
        const files = formData.getAll('files') as File[];

        if (!files || files.length === 0) {
            return new Response(JSON.stringify({ error: 'No files uploaded' }), { status: 400 });
        }

        // Check upload limits based on user type
        const uploadLimit = userType === 'GUEST' ? 15 : 50;
        const userUploadsCount = await prisma.uploadedDocuments.count({
            where: { userId: userId }
        });

        if (userUploadsCount + files.length > uploadLimit) {
            return new Response(JSON.stringify({
                error: `Upload limit would be exceeded. Current: ${userUploadsCount}, Trying to add: ${files.length}, Limit: ${uploadLimit}`,
                limitReached: true
            }), {
                status: 429,
            });
        }

        const results = [];

        // Process each subtitle file
        for (const file of files) {
            // Validate file type
            const fileName = file.name.toLowerCase();
            if (!fileName.endsWith('.srt') && !fileName.endsWith('.vtt')) {
                return new Response(JSON.stringify({
                    error: `Invalid file type: ${file.name}. Only SRT and VTT files are allowed.`
                }), { status: 400 });
            }

            // Check if subtitle file already exists for this user
            const existingFile = await prisma.uploadedDocuments.findFirst({
                where: {
                    userId: userId,
                    source: file.name,
                    documentType: 'SUBTITLE'
                }
            });

            if (existingFile) {
                return new Response(JSON.stringify({
                    error: `Subtitle file "${file.name}" already exists. Please choose a different file or rename it.`
                }), { status: 409 });
            }

            // Save file locally
            const filePath = await saveFile(file);

            // Load subtitle content using existing function
            let docs;
            try {
                docs = loadSubtitleFile(filePath);

                // Add metadata to each document
                const additionalMetadata = {
                    fileName: file.name,
                    uploadedAt: Date.now(),
                    type: "SUBTITLE",
                    ext: fileName.endsWith('.srt') ? '.srt' : '.vtt',
                    source: file.name,
                    userId
                };

                for (const doc of docs) {
                    doc.metadata = { ...doc.metadata, ...additionalMetadata };
                }

                console.log(`Processed ${docs.length} subtitle segments from ${file.name}`);

                // Add to vector store
                await addDocumentToVectorStore(docs);

            } catch (loadError) {
                console.error('Error loading subtitle file:', loadError);
                return new Response(JSON.stringify({
                    error: `Error processing ${file.name}: ${loadError instanceof Error ? loadError.message : 'Processing failed'}`
                }), { status: 400 });
            }

            // Save to database
            const result = await prisma.uploadedDocuments.create({
                data: {
                    documentType: "SUBTITLE",
                    source: file.name,
                    ext: fileName.endsWith('.srt') ? '.srt' : '.vtt',
                    userId: userId,
                    title: file.name
                }
            });

            results.push({
                file: file.name,
                segments: docs.length,
                data: result
            });
        }

        return new Response(JSON.stringify({
            message: `Successfully processed ${files.length} subtitle file(s)`,
            results: results
        }), { status: 201 });

    } catch(err) {
        console.error('Subtitle upload error:', err);
        return new Response(JSON.stringify({
            error: 'Something went wrong processing subtitle files'
        }), { status: 500 });
    }
};