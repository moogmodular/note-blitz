import autoAnimate from '@formkit/auto-animate'
import React, { useEffect, useRef, useState } from 'react'
import PayIn from './PayIn'
import { trpc } from '../../../utils/trpc'
import PayOut from './PayOut'
import { TextField } from '@mui/material'
import { Controller, useForm } from 'react-hook-form'

/* eslint-disable-next-line */
export interface InOutProps {}

const InOut = (props: InOutProps) => {
    const { handleSubmit, control, setValue, getValues } = useForm<{ amount: string; withdrawalAmount: number }>()
    const [inOrOut, setInOrOut] = useState('none')
    const parent = useRef(null)

    const utils = trpc.useContext()
    const { data: dataBalance } = trpc.useQuery(['user:myBalance'])

    useEffect(() => {
        parent.current && autoAnimate(parent.current)
    }, [parent])

    const handleDone = async () => {
        await utils.invalidateQueries(['user:myBalance'])
        setInOrOut('none')
    }
    const doInvoice = () => {
        setInOrOut('in')
    }

    return (
        <div className="flex h-full flex-col items-center justify-around" ref={parent}>
            <div>my current balance: {dataBalance}</div>
            <div className="text-red-500">for now do not use this site for transactions above 100 sats</div>
            <div className="text-red-500">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                </svg>
            </div>
            <div className="mt-32 flex flex-row gap-14">
                <div className="flex flex-col gap-4">
                    <div
                        onClick={doInvoice}
                        className="w-34 flex h-20 flex-col items-center justify-center rounded-lg border border-gray-400 transition ease-in-out hover:shadow-xl"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 13l-7 7-7-7m14-8l-7 7-7-7" />
                        </svg>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"
                            />
                        </svg>
                    </div>
                    <Controller
                        name="amount"
                        control={control}
                        defaultValue={'20'}
                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                            <TextField
                                label="Invoice amount"
                                className="w-34"
                                variant="outlined"
                                value={value}
                                onChange={onChange}
                                error={!!error}
                                helperText={error ? error.message : null}
                            />
                        )}
                        rules={{ required: 'Amount required', max: 100 }}
                    />
                </div>
                <div className="flex flex-col gap-4">
                    <div
                        onClick={() => setInOrOut('out')}
                        className="w-34 flex h-20 flex-col items-center justify-center rounded-lg border border-gray-400 transition ease-in-out hover:shadow-xl"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 11l7-7 7 7M5 19l7-7 7 7" />
                        </svg>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"
                            />
                        </svg>
                    </div>
                    <Controller
                        name="withdrawalAmount"
                        control={control}
                        defaultValue={20}
                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                            <TextField
                                label="Withdraw"
                                className="w-34"
                                variant="outlined"
                                disabled={true}
                                value={dataBalance}
                                onChange={onChange}
                                error={!!error}
                                helperText={error ? error.message : null}
                            />
                        )}
                    />
                </div>
            </div>

            {
                {
                    in: <PayIn inDone={handleDone} amount={parseInt(getValues('amount'))} />,
                    out: <PayOut inDone={handleDone} />,
                    none: <div>chose to pay in or withdraw...</div>,
                }[inOrOut]
            }
        </div>
    )
}

export default InOut
