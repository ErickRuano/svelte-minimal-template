import authorizeRequestInterceptor from './authorize.request.interceptor'
import parseResponseInterceptor from './parse.response.interceptor'

export default {
    authorizeRequest : authorizeRequestInterceptor,
    parseResponse : parseResponseInterceptor
}

export const authorizeRequest = authorizeRequestInterceptor
export const parseResponse = parseResponseInterceptor