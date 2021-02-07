import authGuard from "./auth.guard";
import { pages } from "./../index";
import { wrap } from 'svelte-spa-router/wrap'

const routes = {
  // Unguarded routes
  // '/' : modules.PublicModule.Landing, // prod
  '/' : pages.Login,
  '/login' : pages.Login,
  '/logout' : pages.Logout,
  {{#each schema}}
  '/{{id}}' : wrap({ 
    component : pages.{{displayName}},
    conditions : [authGuard]
  }){{#if @last}}{{else}},{{/if}}
  {{/each}}
  
  // // Guarded routes
  // "/home": wrap({
  //   component: modules.HomeModule.Home,
  //   conditions: [authGuard]
  // })

};

export default routes;
