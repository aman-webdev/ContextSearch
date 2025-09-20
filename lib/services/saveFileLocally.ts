import fs from "fs"
import path from "path"

// Use absolute /tmp path for serverless environments
const TMP_DIR = '/tmp'

// Ensure tmp directory exists
if(!fs.existsSync(TMP_DIR)) {
    console.log(`saveFileLocally: ${TMP_DIR} does not exist, creating...`)
    fs.mkdirSync(TMP_DIR, { recursive: true })
    console.log(`saveFileLocally: ${TMP_DIR} created`)
}

const saveFile = async (file: File, pathToStore?: string, dir?: string) => {
    const buffer = await file.arrayBuffer()
    const data = new Uint8Array(buffer)

    // Use absolute /tmp path instead of relative to process.cwd()
    const baseDir = dir || TMP_DIR
    const filePath = path.join(baseDir, pathToStore || '', `${file.name}`)

    console.log(`saveFileLocally: Saving file at ${filePath}`)
    fs.writeFileSync(filePath, data)
    console.log(`saveFileLocally: File saved at ${filePath}`)
    return filePath
}


export default saveFile