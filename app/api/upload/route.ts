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

    const uploadFileRes = await uploadFile(file);

    return new Response(`File ${file.name} uploaded successfully at ${uploadFileRes}`,{status:201});

    }
    catch(err) {
        return new Response('Something went wrong', { status: 500 });
    }
   
}