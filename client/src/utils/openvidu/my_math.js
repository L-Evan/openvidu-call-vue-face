export function pow2 (number) {
  return Math.pow(number, 2)
}
export function delay (time) {
  return new Promise(resolve => {
    this.setTimeout(() => {
      resolve()
    }, time)
  })
  
} 