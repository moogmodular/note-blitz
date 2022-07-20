import { useMantineTheme } from '@mantine/core'
import { signOut } from 'next-auth/react'
import React, { useEffect, useRef, useState } from 'react'
import AvatarEditor from 'react-avatar-editor'
import { Controller, useForm } from 'react-hook-form'
import Resizer from 'react-image-file-resizer'

import { trpc } from '../../../utils/trpc'
import BorderedButton from '../BorderedButton'
import { TextField } from '@mui/material'

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
        <div className="flex h-full flex-col items-center justify-between">
            {meUserData ? (
                <>
                    <b>Edit me: {meUserData?.userName}</b>
                    <div className="break-all">{meUserData?.publicKey}</div>
                </>
            ) : null}
            <div className="flex h-full w-full flex-col justify-between" onSubmit={handleSubmit(onSubmit)}>
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
                        <TextField
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
                        <TextField
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
                <div className="flex-row">
                    <BorderedButton buttonText={'Submit'} action={handleSubmit(onSubmit)} />{' '}
                    <BorderedButton buttonText={'Logout'} action={handleLogout} />
                </div>
            </div>
        </div>
    )
}

export default EditUser
