export const toSentenceCase = (str: string) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
export const toB64 = (s: string) => Buffer.from(s).toString("base64")