import supabaseClient from "@/lib/supabase/client"
const uploadFileBucket = process.env.SUPABASE_BUCKET_NAME || 'files'

const baseURL = `${process.env.SUPABASE_PROJECT_URL || ''}/storage/v1/object/public/${uploadFileBucket}`

const uploadFile = async(file : File) => {
    try{
        const { data, error } = await supabaseClient.storage.from(uploadFileBucket).upload(`${file.name}`, file, {
            upsert : true,
            
        })
        if(error) throw error;
        const uploadedFileURL = `${baseURL}/${data?.path}`
        console.log(`uploadFile : File Uploaded At: ${uploadedFileURL}`)
        return uploadedFileURL;
    }
    catch(err) {
        console.log('uploadFile : Error uploading ', err)
        throw err
    }
}

export default uploadFile