import fs from "fs"
import path from "path"

if(!fs.existsSync(path.join(process.cwd(), '/tmp'))) {
    console.log(`saveFileLocally: /tmp does not exist, creating...`)
    fs.mkdirSync(path.join(process.cwd(), '/tmp'))
    console.log(`saveFileLocally: /tmp created`)
}

const saveFile = async (file: File, pathToStore?: string, dir?: string) => {
    const buffer = await file.arrayBuffer()
    const data = new Uint8Array(buffer)
    const filePath =  path.join(process.cwd(), dir || '/tmp', pathToStore || '', `${file.name}`)
    console.log(`saveFileLocally: Saving file at ${filePath}`)
    fs.writeFileSync(filePath, data)
    console.log(`saveFileLocally: File saved at ${filePath}`)

}


export default saveFile