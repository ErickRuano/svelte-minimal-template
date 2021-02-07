import authGuard from "./auth.guard";
import { pages } from "./../index";
import { wrap } from 'svelte-spa-router/wrap'

const routes = {
  // Unguarded routes
  // '/' : modules.PublicModule.Landing, // prod
  '/' : pages.Login,
  '/login' : pages.Login,
  '/logout' : pages.Logout,
  '/user' : wrap({ 
    component : pages.User,
    conditions : [authGuard]
  }),
  '/app' : wrap({ 
    component : pages.App,
    conditions : [authGuard]
  })
  
  // // Guarded routes
  // "/home": wrap({
  //   component: modules.HomeModule.Home,
  //   conditions: [authGuard]
  // })

};

export default routes;
