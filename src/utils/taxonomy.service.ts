import { DeltaStatic } from 'quill'

export const extractMentionsFromDelta = (delta: DeltaStatic) => {
    const mentions = delta.ops?.filter((op) => Boolean(op.insert?.mention)).map((op) => op.insert?.mention) as {
        index: string
        denotationChar: string
        id: string
        value: string
    }[]

    const mentionedTags = mentions?.filter((mention) => mention.denotationChar === '#')
    const mentionedUsers = mentions?.filter((mention) => mention.denotationChar === '@')

    return { mentionedTags, mentionedUsers }
}
