/**
* Genrate random int
* @param min
* @param max
* @returns random int - min & max inclusive
*/

export const generateRandomNumber = (min: number, max: number) => {
  let myMin = Math.ceil(min)
  let myMax = Math.floor(max)
  return Math.floor(Math.random() * (myMax - myMin + 1)) + myMin;
}
