import autoAnimate from '@formkit/auto-animate'
import { MantineProvider } from '@mantine/core'
import { createTheme } from '@mui/material'
import { ThemeProvider } from '@mui/system'
import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'

import ActionBox from './components/action-box/ActionBox'
import Header from './components/Header'
import IsolatedPost from './components/IsolatedPost'
import PostTimeline from './components/post/PostTimeline'
import SiteMeta from './components/SiteMeta'
import UXProvider from './context/UXContext'
import useMediaQuery from './hooks/useMediaQuery'

const theme = createTheme({
    typography: {
        fontFamily: 'Courier New',
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: `
        @font-face {
          font-family: 'Courier New';
        }
      `,
        },
    },
})

export default function IndexPage() {
    const router = useRouter()
    const [expanded, setExpanded] = useState(false)
    const isBreakpoint = useMediaQuery(1536)

    const parent = useRef(null)

    useEffect(() => {
        parent.current && autoAnimate(parent.current)
    }, [parent])

    const routerPath = (path: any): string => {
        const subPath = path.split('/')[2]
        if (!subPath) {
            return 'timeline'
        }
        return path.split('/')[2]
    }

    const handleExpand = (): void => {
        setExpanded(!expanded)
    }

    return (
        <MantineProvider theme={{ fontFamily: 'Courier New' }} withGlobalStyles withNormalizeCSS>
            <ThemeProvider theme={theme}>
                <UXProvider>
                    <div className="flex h-screen w-screen flex-col gap-6 p-8 font-serif 2xl:flex-row">
                        <div className="flex w-full flex-col gap-6 2xl:w-2/3" ref={parent}>
                            <Header />
                            {
                                {
                                    single: <IsolatedPost slug={router.query.slug as string} />,
                                    tag: <PostTimeline tag={router.query.tag as string} />,
                                    user: <PostTimeline user={router.query.user as string} />,
                                    timeline: <PostTimeline />,
                                }[routerPath(router.asPath)]
                            }
                        </div>
                        {isBreakpoint ? (
                            <div
                                className="fixed left-0 right-0 bottom-0 flex w-full items-center justify-center border-2 border border-t-black bg-white"
                                onClick={handleExpand}
                            >
                                {expanded ? (
                                    <div>
                                        <div>REMOVE!</div>
                                        <ActionBox />
                                    </div>
                                ) : (
                                    <div>EXPAND!</div>
                                )}
                            </div>
                        ) : (
                            <div className="flex w-full flex-col gap-6 2xl:w-1/3">
                                <SiteMeta />
                                <ActionBox />
                            </div>
                        )}
                    </div>
                </UXProvider>
            </ThemeProvider>
        </MantineProvider>
    )
}
