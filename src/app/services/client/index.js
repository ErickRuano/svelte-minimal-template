import API from './api.js'
import { confirmPassword, forgotPassword, signIn } from './auth.service.js'


export default {
    instance : API.instance,
    auth : {
        confirmPassword,
        forgotPassword,
        signIn
    }
}