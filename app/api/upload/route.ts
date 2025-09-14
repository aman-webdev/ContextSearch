import { addDocumentToVectorStore, loadDocument } from "@/lib/services/langchain";
import saveFile from "@/lib/services/saveFileLocally";
import uploadFile from "@/lib/supabase/uploadFile";

export const POST = async(request: Request) => {
    try{
 const contentType = request.headers.get('content-type') || '';
    if(!contentType.includes('multipart/form-data')) {
        return new Response(JSON.stringify({error:'Invalid content type'}), { status: 400 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
    return new Response('No file uploaded', { status: 400 });
    }

    // const uploadFileRes = await uploadFile(file);
   const path =  await saveFile(file)

    //TODO: update this to filePath
    const {docs, additionalDocMetadata} = await loadDocument(path)
    console.log("got chunks", docs.length)
    await addDocumentToVectorStore(docs)

    return new Response(JSON.stringify({
        message : `File ${file.name} uploaded successfully`,
        metadata : additionalDocMetadata
    }),{status:201});

    }
    catch(err) {
        return new Response('Something went wrong', { status: 500 });
    }
   
}