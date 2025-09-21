import { addDocumentToVectorStore, splitTextToChunks } from '@/lib/services/langchain';
import { getYoutubeVideoTranscript } from 'youtube-transcript-generator';
import { Document } from "@langchain/core/documents";
import ytv from "ytv"
import prisma from '@/lib/prisma';
export const POST = async (request : Request) => {
    try{
        // Get user info from middleware
        const userId = request.headers.get("x-user-id");
        const userType = request.headers.get("x-user-type");

        if (!userId) {
            return new Response(JSON.stringify({ error: "Authentication required" }), {
                status: 401,
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
            });
        }

        const contentType = request.headers.get("content-type") || ''
           if(!contentType.includes('application/json')) {
            return new Response(JSON.stringify({error:'Invalid content type'}), { status: 400 });
        }

        const body = await request.json()
        const {url} = body;
        if(!url || url.trim().length === 0)  return new Response(JSON.stringify({error:'URL is required'}), { status: 400 });

        // Check if YouTube video already exists for this user
        const existingVideo = await prisma.uploadedDocuments.findFirst({
            where: {
                userId: userId,
                source: url,
                documentType: 'YOUTUBE_TRANSCRIPT'
            }
        });

        if (existingVideo) {
            return new Response(JSON.stringify({
                error: `YouTube video "${url}" already exists. This video has already been processed.`
            }), { status: 409 });
        }
        let videoDetails;
        try {
            // Set working directory to /tmp for serverless environments
            const originalCwd = process.cwd();
            process.chdir('/tmp');

            try {
                // Configure ytdl with options to avoid bot detection
                videoDetails = await ytv.get_info(url);
                
            } finally {
                // Always restore original working directory
                process.chdir(originalCwd);
            }
        } catch (videoError) {
            console.log('Video info fetch failed:', videoError);
            throw new Error('Unable to fetch video information. Video may be private or restricted.');
        }

        const videoMetadata = {
            title : videoDetails.title,
            author : videoDetails.channel_name,
            thumbnail : videoDetails.small_thumbnail || '',
            type : 'YOUTUBE_TRANSCRIPT',
            uploadedAt : Date.now(),
            source : url
        }

        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));

        let transcriptRes;
        let transcript;

        try {
            transcript = await getYoutubeVideoTranscript(url);
        } catch (transcriptError) {
            console.log('Transcript fetch failed:', transcriptError);
            throw new Error('Unable to fetch transcript. This video may not have captions available or may be restricted.');
        }


        const transcriptDoc = new Document({
            pageContent : transcript,
            metadata : {
            
                ...videoMetadata
            }
        })
        const textChunks = await splitTextToChunks([transcriptDoc])

        await addDocumentToVectorStore(textChunks)

         const result = await prisma.uploadedDocuments.create({
        data: {
            documentType: 'YOUTUBE_TRANSCRIPT',
            source: videoMetadata.source,
            userId: userId,
        }
    })

      const videoResult = await prisma.video.create({
            data: {
                author : videoMetadata.author,
                title : videoMetadata.title,
                description: null,
                thumbnail : videoMetadata.thumbnail,
                uploadedDocumentId : result.id

            }
        })

        return new Response(JSON.stringify({
            message: '',
            data : {...result , video : videoResult}
        }))
    }
    catch(err: unknown) {
        console.log('youtube : Error ', err)
        return new Response(err instanceof Error ? err.message : "Something went wrong")
    }
}