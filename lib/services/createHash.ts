import { createHash } from "crypto"

const create256Hash =  (str : string) => {
    console.log(str,'strng')
    const hash = createHash("sha256").update(str).digest('base64')
    return hash
}

export default create256Hash