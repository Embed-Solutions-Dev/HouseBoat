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
      // Gradual size reduction: 2 engines = full size, 3 = slightly smaller, 4 = compact
      tachometerSize: count === 2 ? 310 : count === 3 ? 285 : 270,
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
