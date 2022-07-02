import { useMantineTheme } from '@mantine/core'
import { Dropzone, IMAGE_MIME_TYPE } from '@mantine/dropzone'
import { Button, TextField } from '@mui/material'
import { signOut } from 'next-auth/react'
import React, { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import Resizer from 'react-image-file-resizer'
import styled from 'styled-components'

import { trpc } from '../../../utils/trpc'
import { dropzoneChildren } from './NewPost'

const EditUserContainer = styled.div`
    display: flex;
    flex-direction: column;
    height: 100%;
    justify-content: space-between;
`

const HeaderContainer = styled.div`
    word-wrap: break-word;
    max-width: 80%;
    text-align: center;
`

const FormContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1em;
    height: 100%;
`

const StyledButton = styled(Button)`
    background: transparent;
    font-size: 1rem;
    border: 2px solid #000000;
    border-radius: 0;
    color: #000000;
    margin-top: 1em;
    padding: 0.25em 1em;
`

const MinimalTextField = styled(TextField)({
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
export interface EditUserProps {}

const EditUser = (props: EditUserProps) => {
    const { handleSubmit, control, setValue } = useForm()
    const theme = useMantineTheme()

    const [image, setImage] = useState('')

    const mutationEditUser = trpc.useMutation(['user:edit'])
    const { data: meUserData } = trpc.useQuery(['user:getMe'])

    useEffect(() => {
        setImage(meUserData?.profileImage as string)
        setValue('userName', meUserData?.userName)
        setValue('profileImage', meUserData?.profileImage)
        setValue('bio', meUserData?.bio)
    }, [])

    const onSubmit = async (data: { userName?: string; bio?: string }) => {
        mutationEditUser.mutate({ userName: data.userName, profileImage: image, bio: data.bio })
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

    const handleLogout = () => {
        void signOut()
    }

    const handleChange = async (data: any) => {
        const filePath = data[0]
        const image = await resizeFile(filePath)
        void setImage(image as string)
    }

    return (
        <EditUserContainer>
            {meUserData ? (
                <>
                    <b>Edit me: {meUserData?.userName}</b>
                    <HeaderContainer>{meUserData?.publicKey}</HeaderContainer>
                    <hr />
                </>
            ) : null}

            <FormContainer onSubmit={handleSubmit(onSubmit)}>
                {image ? (
                    <img src={image} alt="post header" width={'250px'} height={'250px'} onClick={() => setImage('')} />
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
                    name="userName"
                    control={control}
                    defaultValue=""
                    render={({ field: { onChange, value }, fieldState: { error } }) => (
                        <MinimalTextField
                            label="User name"
                            variant="outlined"
                            value={value}
                            onChange={onChange}
                            error={!!error}
                            helperText={error ? error.message : null}
                        />
                    )}
                />
                <Controller
                    name="bio"
                    control={control}
                    defaultValue=""
                    render={({ field: { onChange, value }, fieldState: { error } }) => (
                        <MinimalTextField
                            label="Bio"
                            multiline
                            minRows={5}
                            maxRows={20}
                            variant="outlined"
                            value={value}
                            onChange={onChange}
                            error={!!error}
                            helperText={error ? error.message : null}
                        />
                    )}
                />
                <StyledButton onClick={handleSubmit(onSubmit)}>Submit</StyledButton>
                <StyledButton onClick={handleLogout}>Logout</StyledButton>
            </FormContainer>
        </EditUserContainer>
    )
}

export default EditUser
