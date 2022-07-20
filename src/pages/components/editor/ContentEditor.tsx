import { useSession } from 'next-auth/react'
import { Delta, DeltaStatic, Sources } from 'quill'
import React, { useMemo, useState } from 'react'
import { UnprivilegedEditor } from 'react-quill'

import { trpc } from '../../../utils/trpc'
import RichTextEditor from '../common/RichText'

/* eslint-disable-next-line */
export interface ContentEditorProps {
    editorState: (editorDelta: DeltaStatic, editorHtml: string) => void
}

const ContentEditor = (props: ContentEditorProps) => {
    const { client } = trpc.useContext()
    const [value, onChange] = useState<string>('')
    const { data: session } = useSession()

    const mentions = useMemo(
        () => ({
            allowedChars: /^[A-Za-z\sÅÄÖåäö]*$/,
            mentionDenotationChars: ['@', '#'],
            source: async (searchTerm: string, renderList: any, mentionChar: string) => {
                const list =
                    mentionChar === '@'
                        ? await client.query('user:searchByName', { name: searchTerm }).then((res) =>
                              res!.map((user, index) => {
                                  return {
                                      id: index,
                                      value: user.userName,
                                  }
                              }),
                          )
                        : await client.query('taxonomy:searchByName', { name: searchTerm }).then((res) => {
                              const tagList = res!.map((tag, index) => {
                                  return {
                                      id: index + 1,
                                      value: tag.tagName,
                                  }
                              })

                              if (!searchTerm.includes('nb') && session?.user.role !== 'ADMIN') {
                                  tagList[0] = {
                                      id: -1,
                                      value: searchTerm,
                                  }
                              }

                              return tagList
                          })
                renderList(list)
            },
        }),
        [],
    )

    const editorChange = (value: string, delta: Delta, sources: Sources, editor: UnprivilegedEditor) => {
        const editorState = editor.getContents()
        onChange(value)
        props.editorState(editorState, value)
    }

    return (
        <div className="flex-1">
            <RichTextEditor
                value={value}
                onChange={editorChange}
                styles={{ root: { overflowY: 'scroll', overflowX: 'auto', height: '100%' } }}
                mentions={mentions}
            />
        </div>
    )
}

export default ContentEditor
