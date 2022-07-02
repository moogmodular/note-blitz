import { Group, MantineTheme, Text, useMantineTheme } from '@mantine/core'
import { Dropzone, DropzoneStatus, IMAGE_MIME_TYPE } from '@mantine/dropzone'
import { Button, TextField } from '@mui/material'
import { DeltaStatic } from 'quill'
import React, { useContext, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import Resizer from 'react-image-file-resizer'
import styled from 'styled-components'

import { trpc } from '../../../utils/trpc'
import { UXContext } from '../../context/UXContext'
import ContentEditor from '../editor/ContentEditor'

const NewPostContainer = styled.div`
    height: 100%;
    display: flex;
    flex-direction: column;
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
export interface NewPostProps {
    title: string
    data?: string
}

export const dropzoneChildren = (status: DropzoneStatus, theme: MantineTheme) => (
    <Group position="center" spacing="xl" style={{ minHeight: 100, pointerEvents: 'none' }}>
        <div>
            <Text size="xl" inline>
                Drag images here or click to select files
            </Text>
            <Text size="sm" color="dimmed" inline mt={7}>
                Attach as many files as you like, each file should not exceed 5mb
            </Text>
        </div>
    </Group>
)

const NewPost = (props: NewPostProps) => {
    const { state, dispatch } = useContext(UXContext)
    const { handleSubmit, control } = useForm()
    const [image, setImage] = useState('')

    const theme = useMantineTheme()

    const [contentState, setContentState] = useState<{ editorDelta: any; editorHtml: string }>({
        editorDelta: {},
        editorHtml: '',
    })

    const mutationCreate = trpc.useMutation(['post:create'])
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
        mutationCreate.mutate({
            ...data,
            headerImage: image,
            content: { deltaContent: contentState.editorDelta, htmlContent: contentState.editorHtml },
        })
        await utils.invalidateQueries(['post:getAll'])
    }

    return (
        <NewPostContainer>
            <b>{props.title}</b>
            <HeaderContainer>{props.data ? <i>{props.data}</i> : null}</HeaderContainer>
            <hr />
            <FormContainer onSubmit={handleSubmit(onSubmit)}>
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
                        <MinimalTextField
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
                        <MinimalTextField
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

                <Button onClick={handleSubmit(onSubmit)}>Submit</Button>
            </FormContainer>
        </NewPostContainer>
    )
}

export default NewPost
