export const generateUID = (): number =>
  Number((Math.random() * 100000).toFixed(0));
