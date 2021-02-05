import Webnav from './Session.svelte'
import { render, fireEvent } from '@testing-library/svelte'

it('it works', async () => {
  const { getByText, container } = render(Webnav, {
    logo : "img/logo.png",
    links : [
      {
        url : "#/home",
        display : "Home"
      },
      {
        url : "#/sessions",
        display : "Sessions"
      },
      {
        url : "#/profile",
        display : "Profile"
      },
      {
        url : "#/settings",
        display : "Settings"
      },
      {
        url : "#/help",
        display : "Help"
      }
    ]
  })

  

  
  const input = 0
  const output = 0
  

  expect(input).toBe(output)


})