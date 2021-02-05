import authGuard from "./auth.guard";
import { pages } from "./../index";
import { wrap } from 'svelte-spa-router/wrap'

const routes = {
  // Unguarded routes
  // '/' : modules.PublicModule.Landing, // prod
  '/' : pages.Landing,
  '/login' : pages.Login,
  '/user' : pages.User,
  '/app' : pages.App
  
  // // Guarded routes
  // "/home": wrap({
  //   component: modules.HomeModule.Home,
  //   conditions: [authGuard]
  // })

};

export default routes;
