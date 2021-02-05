import Webnav from './Session.svelte'
import { render, fireEvent } from '@testing-library/svelte'

it('it works', async () => {
  const { getByText, container } = render(Webnav, {
    title : "APP",
    user : {
      picture : "https://avatars.dicebear.com/4.5/api/bottts/eranda.svg",
      displayName : "Eranda"
    }
  })

  

  
  const input = 0
  const output = 0
  

  expect(input).toBe(output)

})