import { useMantineTheme } from '@mantine/core'
import { Button, TextField } from '@mui/material'
import { signOut } from 'next-auth/react'
import React, { useEffect, useRef, useState } from 'react'
import AvatarEditor from 'react-avatar-editor'
import { Controller, useForm } from 'react-hook-form'
import Resizer from 'react-image-file-resizer'
import styled from 'styled-components'

import { trpc } from '../../../utils/trpc'

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
    const editor = useRef(null)

    const [image, setImage] = useState('')

    const mutationEditUser = trpc.useMutation(['user:edit'])
    const { data: meUserData } = trpc.useQuery(['user:getMe'])
    const utils = trpc.useContext()

    useEffect(() => {
        setImage(meUserData?.profileImage as string)
        setValue('userName', meUserData?.userName)
        setValue('profileImage', meUserData?.profileImage)
        setValue('bio', meUserData?.bio)
    }, [])

    const onSubmit = async (data: { userName?: string; bio?: string }) => {
        const base64Image = await resizeFile(image)
        await mutationEditUser.mutateAsync({ userName: data.userName, profileImage: base64Image, bio: data.bio })
        await utils.invalidateQueries(['user:getMe'])
    }

    const resizeFile = (file: any) =>
        new Promise<string>((resolve) => {
            Resizer.imageFileResizer(
                file,
                250,
                250,
                'JPEG',
                100,
                0,
                (uri) => {
                    resolve(uri as string)
                },
                'base64',
            )
        })

    const handleLogout = () => {
        void signOut()
    }

    const handleNewImage = (e: any) => {
        console.log(e)
        setImage(e.target.files[0])
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
                <div>
                    <AvatarEditor ref={editor} width={250} height={250} image={image} />
                    <br />
                    New File:
                    <input name="newImage" type="file" onChange={handleNewImage} />
                </div>
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
