import autoAnimate from '@formkit/auto-animate'
import { MantineProvider } from '@mantine/core'
import { createTheme } from '@mui/material'
import { ThemeProvider } from '@mui/system'
import { useRouter } from 'next/router'
import { useEffect, useRef } from 'react'
import styled, { createGlobalStyle } from 'styled-components'

import ActionBox from './components/action-box/ActionBox'
import Header from './components/Header'
import IsolatedPost from './components/IsolatedPost'
import PostTimeline from './components/post/PostTimeline'
import SiteMeta from './components/SiteMeta'
import { UXProvider } from './context/UXContext'

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

const GlobalStyle = createGlobalStyle`
  body {
    font-family: 'Courier New'
  }
`
const MainContainer = styled.div`
    padding: 2em;
    display: flex;
    flex-direction: row;
    gap: 1em;
    height: 100vh;
`

const LeftRow = styled.div`
    display: flex;
    gap: 1em;
    flex-direction: column;
    width: 66vw;
`

const RightRow = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1em;
    width: 30vw;
    justify-content: space-between;
`

export default function IndexPage() {
    const router = useRouter()

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

    return (
        <MantineProvider theme={{ fontFamily: 'Courier' }} withGlobalStyles withNormalizeCSS>
            <ThemeProvider theme={theme}>
                <UXProvider>
                    <GlobalStyle />
                    <MainContainer>
                        <LeftRow ref={parent}>
                            <Header />
                            {
                                {
                                    single: <IsolatedPost slug={router.query.slug as string} />,
                                    tag: <PostTimeline tag={router.query.tag as string} />,
                                    user: <PostTimeline user={router.query.user as string} />,
                                    timeline: <PostTimeline />,
                                }[routerPath(router.asPath)]
                            }
                        </LeftRow>
                        <RightRow>
                            <SiteMeta />
                            <ActionBox />
                        </RightRow>
                    </MainContainer>
                </UXProvider>
            </ThemeProvider>
        </MantineProvider>
    )
}
