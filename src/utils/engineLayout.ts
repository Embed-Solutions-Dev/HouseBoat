export interface EngineLayout {
  rows: number;
  topRow: number;
  bottomRow: number;
  tachometerSize: number;
}

export const getEnginesLayout = (count: number): EngineLayout => {
  if (count <= 4) {
    return {
      rows: 1,
      topRow: count,
      bottomRow: 0,
      // Gradual size reduction to fit within 1048px container
      // 2 engines = 310px, 3 = 285px, 4 = 244px (fits with 24px gaps)
      tachometerSize: count === 2 ? 375 : count === 3 ? 285 : 244,
    };
  } else if (count === 5) {
    return {
      rows: 2,
      topRow: 3,
      bottomRow: 2,
      tachometerSize: 245,
    };
  } else {
    // 6 engines
    return {
      rows: 2,
      topRow: 3,
      bottomRow: 3,
      tachometerSize: 245,
    };
  }
};
