import { addDocumentToVectorStore, splitTextToChunks } from '@/lib/services/langchain';
import { fetchTranscript } from 'youtube-transcript-plus';
import { Document } from "@langchain/core/documents";
import ytdl from "@distube/ytdl-core"
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
        const {videoDetails} = await ytdl.getInfo(url);
        

        const videoMetadata = {
            title : videoDetails.title,
            description : videoDetails.description,
            author : videoDetails.author.name,
            thumbnail : videoDetails.thumbnails[1].url,
            type : 'YOUTUBE_TRANSCRIPT',
            uploadedAt : Date.now(),
            source : url
        }

        const transcriptRes = await fetchTranscript(url);
        // console.log(transcriptRes,'txres')
        const transcript = (transcriptRes.map(t=>t.text)).join(" ")


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
                description : videoMetadata.description || '',
                title : videoMetadata.title,
                thumbnail : videoMetadata.thumbnail,
                uploadedDocumentId : result.id

            }
        })

        return new Response(JSON.stringify({
            message: '',
            data : {...result , video : videoResult}
        }))
    }
    catch(err : any) {
        console.log('youtube : Error ', err)
        return new Response(err.message || "Something went wrong")
    }
}