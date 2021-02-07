// imports
import landingPage from './landing/landing.page.svelte'
import loginPage from './login/login.page.svelte'
import logoutPage from './logout/logout.page.svelte'
import userPage from './user/user.page.svelte'
import appPage from './app/app.page.svelte'

// export
export default {
	Landing : landingPage,
	Login : loginPage,
	Logout : logoutPage,
	User : userPage,
	App : appPage
}

export const Landing = landingPage
export const Login = loginPage
export const Logout = logoutPage
export const User = userPage
export const App = appPage
