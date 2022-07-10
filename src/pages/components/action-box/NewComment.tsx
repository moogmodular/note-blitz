import { Button, TextField } from '@mui/material'
import { DeltaStatic } from 'quill'
import React, { useContext, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import styled from 'styled-components'

import { trpc } from '../../../utils/trpc'
import { ActionBoxAction, UXContext } from '../../context/UXContext'
import ContentEditor from '../editor/ContentEditor'

const NewCommentContainer = styled.div`
    display: flex;
    flex-direction: column;
    height: 100%;
`

const FormContainer = styled.div`
    display: flex;
    flex-direction: column;
    height: 100%;
`

const HeaderContainer = styled.div`
    display: flex;
    flex-direction: row;
`

const MinimalTextField = styled(TextField)({
    marginBottom: '0.5em',
    '& .MuiFormLabel-root': {
        fontFamily: 'Courier New',
    },
    '& .MuiInputBase-input': {
        fontFamily: 'Courier New',
    },
    '& label.Mui-focused': {
        color: 'black',
        borderRadius: '0',
    },
    '& .MuiInput-underline:after': {
        borderBottomColor: 'green',
    },
    '& .MuiOutlinedInput-root': {
        '& fieldset': {
            borderColor: 'black',
            borderRadius: '0',
        },
        '&:hover fieldset': {
            borderColor: 'black',
            borderRadius: '0',
        },
        '&.Mui-focused fieldset': {
            borderColor: 'black',
            borderRadius: '0',
        },
    },
})

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
        <NewCommentContainer>
            <HeaderContainer>
                <b>{props.title}</b>
                {props.data ? <i>{props.data}</i> : null}
            </HeaderContainer>
            <hr />
            <FormContainer onSubmit={handleSubmit(onSubmit)}>
                <Controller
                    name="title"
                    control={control}
                    defaultValue=""
                    render={({ field: { onChange, value }, fieldState: { error } }) => (
                        <MinimalTextField
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
                <Button onClick={handleSubmit(onSubmit)}>Submit</Button>
            </FormContainer>
        </NewCommentContainer>
    )
}

export default NewComment
