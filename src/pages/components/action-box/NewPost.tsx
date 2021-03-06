import { Group, MantineTheme, Text, useMantineTheme } from '@mantine/core'
import { Dropzone, DropzoneStatus, IMAGE_MIME_TYPE } from '@mantine/dropzone'
import { Button, TextField } from '@mui/material'
import { DeltaStatic } from 'quill'
import React, { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import Resizer from 'react-image-file-resizer'

import { trpc } from '../../../utils/trpc'
import ContentEditor from '../editor/ContentEditor'
import BorderedButton from '../BorderedButton'

/* eslint-disable-next-line */
export interface NewPostProps {
    title: string
    data?: string
}

export const dropzoneChildren = (status: DropzoneStatus, theme: MantineTheme) => (
    <Group position="center" spacing="xl" style={{ minHeight: 100, pointerEvents: 'none' }}>
        <div>
            <Text size="xl" inline>
                Drag a file here or click to upload
            </Text>
        </div>
    </Group>
)

const NewPost = (props: NewPostProps) => {
    const { handleSubmit, control, setValue } = useForm<{ title: string; excerpt: string }>()
    const [image, setImage] = useState('')

    const theme = useMantineTheme()

    const [contentState, setContentState] = useState<{ editorDelta: any; editorHtml: string }>({
        editorDelta: {},
        editorHtml: '',
    })

    const mutationCreate = trpc.useMutation(['contentItem:create'])
    const utils = trpc.useContext()

    const onContentEditorChange = (editorDelta: DeltaStatic, editorHtml: string) => {
        setContentState({ editorDelta, editorHtml })
    }

    const resizeFile = (file: any) =>
        new Promise((resolve) => {
            Resizer.imageFileResizer(
                file,
                250,
                250,
                'JPEG',
                100,
                0,
                (uri) => {
                    resolve(uri)
                },
                'base64',
            )
        })

    const handleChange = async (data: any) => {
        const filePath = data[0]
        const image = await resizeFile(filePath)
        void setImage(image as string)
    }

    const onSubmit = async (data: { title: string; excerpt: string }) => {
        await mutationCreate.mutateAsync({
            ...data,
            headerImage: image,
            content: { deltaContent: contentState.editorDelta, htmlContent: contentState.editorHtml },
        })
        setValue('title', '')
        setValue('excerpt', '')
        void setImage('')
        setContentState({
            editorDelta: {},
            editorHtml: '',
        })
        await utils.invalidateQueries(['contentItem:getOpList'])
    }

    return (
        <div className="flex h-full flex-col items-center justify-between">
            <div>
                <b>{props.title}</b>
                {props.data ? <i>{props.data}</i> : null}
            </div>
            <div className="flex h-full flex-col justify-between" onSubmit={handleSubmit(onSubmit)}>
                {image ? (
                    <img src={image} alt="post header" width={'250px'} height={'250px'} />
                ) : (
                    <Dropzone
                        onDrop={(files) => handleChange(files)}
                        onReject={(files) => handleChange(files)}
                        accept={IMAGE_MIME_TYPE}
                    >
                        {(status) => dropzoneChildren(status, theme)}
                    </Dropzone>
                )}

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
                    rules={{ required: 'Title required', maxLength: { value: 100, message: 'Title too long' } }}
                />
                <Controller
                    name="excerpt"
                    control={control}
                    defaultValue=""
                    render={({ field: { onChange, value }, fieldState: { error } }) => (
                        <TextField
                            label="Excerpt"
                            variant="outlined"
                            multiline
                            minRows={2}
                            maxRows={5}
                            value={value}
                            onChange={onChange}
                            error={!!error}
                            helperText={error ? error.message : null}
                        />
                    )}
                    rules={{ required: 'Excerpt required' }}
                />
                <ContentEditor editorState={onContentEditorChange} />

                <BorderedButton buttonText="Submit" action={handleSubmit(onSubmit)} />
            </div>
        </div>
    )
}

export default NewPost
