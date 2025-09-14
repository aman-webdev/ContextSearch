import chat, { INIT_SYSTEM_PROMPT } from "@/lib/services/chat";
import { queryVectorStore, queryVectorStoreWithFilter } from "@/lib/services/langchain";


interface AdditionalMetadata {
    fileName: string;
    type: "DOCUMENT" | "WEBSITE";
    ext: string;
}

interface ChatRequest {
    query: string;
    additionalMetadata?: AdditionalMetadata;
}

export const POST = async(request: Request) => {
    try{
        const body = await request.json()
        const {query, additionalMetadata} = body as ChatRequest
        console.log(query,'query')
        console.log(additionalMetadata, 'additionalMetadata')

        if(!query || query.trim().length === 0) {
            return new Response(JSON.stringify({error:'Query is required'}), { status: 400 });
        }

        const retreivedDocs = additionalMetadata 
            ? await queryVectorStoreWithFilter(query, additionalMetadata)
            : await queryVectorStore(query)
        console.log('Retreived docs', retreivedDocs.length)
        

        // TODO: move this to DB

        console.log(retreivedDocs)
        // Format retrieved documents properly
        const contextContent = retreivedDocs.map((doc, index) => {
            const metadata = doc.metadata;
            const content = doc.pageContent;

            let sourceInfo = '';
            if (metadata.type === 'DOCUMENT') {
                sourceInfo = `[Document: ${metadata.fileName}]`;
            } else if (metadata.type === 'WEBSITE') {
                sourceInfo = `[Website: ${metadata.source || metadata.websiteURL}]`;
            } else if (metadata.type === 'YOUTUBE_TRANSCRIPT') {
                sourceInfo = `[YouTube: ${metadata.title} - ${metadata.source}]`;
            }

            return `${sourceInfo}\n${content}\n`;
        }).join('\n---\n');

        const SYSTEM_PROMPT = `${INIT_SYSTEM_PROMPT}

## Context Documents:
${contextContent}
`

        const chatResponse = await chat(query, [], SYSTEM_PROMPT)

        return new Response(JSON.stringify({data: chatResponse}), { status: 200 });

    }
    catch(err){
        console.log('chat : ',err)
        return new Response('Something went wrong', { status: 500 });
    }
 


}