import { addDocumentToVectorStore, splitTextToChunks } from '@/lib/services/langchain';
import { fetchTranscript } from 'youtube-transcript-plus';
import { Document } from "@langchain/core/documents";
import ytdl from "@distube/ytdl-core"
export const POST = async (request : Request) => {
    try{

        const contentType = request.headers.get("content-type") || ''
           if(!contentType.includes('application/json')) {
            return new Response(JSON.stringify({error:'Invalid content type'}), { status: 400 });
        }

        const body = await request.json()
        const {url} = body;
        if(!url || url.trim().length === 0)  return new Response(JSON.stringify({error:'URL is required'}), { status: 400 });
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

        return new Response(JSON.stringify({
            message: '',
            data : videoMetadata
        }))
    }
    catch(err : any) {
        console.log('youtube : Error ', err)
        return new Response(err.message || "Something went wrong")
    }
}