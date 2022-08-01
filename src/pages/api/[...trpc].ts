import { createOpenApiNextHandler } from 'trpc-openapi'
import { createRestContext, restRouter } from '../../server/router/restRouter'

export default createOpenApiNextHandler({
    router: restRouter,
    // @ts-ignore
    createRestContext,
})
