// imports
import landingPage from './landing/landing.page.svelte'
import loginPage from './login/login.page.svelte'
{{#each schema}}
import {{id}}Page from './{{id}}/{{id}}.page.svelte'
{{/each}}

// export
export default {
	Landing : landingPage,
	Login : loginPage,
	{{#each schema}}
	{{displayName}} : {{id}}Page{{#if @last}}{{else}},{{/if}}
	{{/each}}
}

export const Landing = landingPage
export const Login = loginPage
{{#each schema}}
export const {{displayName}} = {{id}}Page
{{/each}}