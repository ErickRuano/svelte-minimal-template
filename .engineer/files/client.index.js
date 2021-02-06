import API from './api.js'
import { confirmPassword, forgotPassword, signIn, self } from './auth.service.js'
{{#each schema}}
import {{id}} from './{{{id}}}.service.js'
{{/each}}

export default {
    instance : API.instance,
    auth : {
        confirmPassword,
        forgotPassword,
        signIn,
        self
    },
    {{#each schema}}
    {{id}}{{#if @last}}{{else}},{{/if}}
    {{/each}}
}