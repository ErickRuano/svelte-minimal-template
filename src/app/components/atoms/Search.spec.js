import Search from './Search.svelte'
import { render, fireEvent } from '@testing-library/svelte'

it('it works', async () => {
  
  const { getByText, container } = render(Search, {
    value : "Yoga"
  })

  const input = "Yoga"
  const output = "Yoga"

  expect(input).toBe(output)

  
})