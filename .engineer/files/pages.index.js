// imports
import landingPage from './landing/landing.page.svelte'
import loginPage from './login/login.page.svelte'
import logoutPage from './logout/logout.page.svelte'
{{#each schema}}
import {{id}}Page from './{{id}}/{{id}}.page.svelte'
{{/each}}

// export
export default {
	Landing : landingPage,
	Login : loginPage,
	Logout : logoutPage,
	{{#each schema}}
	{{displayName}} : {{id}}Page{{#if @last}}{{else}},{{/if}}
	{{/each}}
}

export const Landing = landingPage
export const Login = loginPage
export const Logout = logoutPage
{{#each schema}}
export const {{displayName}} = {{id}}Page
{{/each}}