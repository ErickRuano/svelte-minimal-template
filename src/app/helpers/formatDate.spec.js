import formatDate from './formatDate'

describe("formatDate function", () => {
    test("it should return a formatted date", () => {
      const input = new Date("Friday Jan 29 2021")
  
      const output = "Friday, January 29, 2021"
  
      expect(formatDate(input, "en-US")).toEqual(output);
  
    });
  });