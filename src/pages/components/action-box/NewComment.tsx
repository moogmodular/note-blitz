import { DeltaStatic } from 'quill'
import React, { useContext, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'

import { trpc } from '../../../utils/trpc'
import { ActionBoxAction, UXContext } from '../../context/UXContext'
import ContentEditor from '../editor/ContentEditor'
import BorderedButton from '../BorderedButton'
import { TextField } from '@mui/material'

/* eslint-disable-next-line */
export interface NewCommentProps {
    title: string
    data?: string
}

const NewComment = (props: NewCommentProps) => {
    const { state } = useContext(UXContext)
    const { handleSubmit, control } = useForm<{ title: string; content: string }>()
    const [contentState, setContentState] = useState<{ editorDelta: any; editorHtml: string }>({
        editorDelta: {},
        editorHtml: '',
    })

    const mutationReplyToContentItem = trpc.useMutation(['contentItem:replyTo'])
    const utils = trpc.useContext()

    const onContentEditorChange = (editorDelta: DeltaStatic, editorHtml: string) => {
        setContentState({ editorDelta, editorHtml })
    }

    const onSubmit = async (data: { title: string; content: string }) => {
        if (state.actionBoxState.actionBoxAction === ActionBoxAction.doReplyToPost) {
            await mutationReplyToContentItem.mutateAsync({
                title: data.title,
                content: { deltaContent: contentState.editorDelta, htmlContent: contentState.editorHtml },
                contentItemId: props.data!,
            })
            await utils.invalidateQueries(['contentItem:getTreeById'])
        } else if (state.actionBoxState.actionBoxAction === ActionBoxAction.doReplyToComment) {
            await mutationReplyToContentItem.mutateAsync({
                title: data.title,
                content: { deltaContent: contentState.editorDelta, htmlContent: contentState.editorHtml },
                contentItemId: props.data!,
            })
            await utils.invalidateQueries(['contentItem:getTreeById'])
        }
    }

    return (
        <div className="flex h-full flex-col items-center justify-between">
            <div>
                <b>{props.title}</b>
                {props.data ? <i>{props.data}</i> : null}
            </div>
            <div className="flex h-full flex-col justify-between" onSubmit={handleSubmit(onSubmit)}>
                <Controller
                    name="title"
                    control={control}
                    defaultValue=""
                    render={({ field: { onChange, value }, fieldState: { error } }) => (
                        <TextField
                            label="Title"
                            variant="outlined"
                            value={value}
                            onChange={onChange}
                            error={!!error}
                            helperText={error ? error.message : null}
                        />
                    )}
                    rules={{ required: 'Title required' }}
                />
                <ContentEditor editorState={onContentEditorChange} />
                <BorderedButton buttonText="Submit" action={handleSubmit(onSubmit)} />
            </div>
        </div>
    )
}

export default NewComment
