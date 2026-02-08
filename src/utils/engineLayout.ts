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
      tachometerSize: count === 2 ? 310 : count === 3 ? 290 : 280,
    };
  } else if (count === 5) {
    return {
      rows: 2,
      topRow: 3,
      bottomRow: 2,
      tachometerSize: 240,
    };
  } else {
    // 6 engines
    return {
      rows: 2,
      topRow: 3,
      bottomRow: 3,
      tachometerSize: 240,
    };
  }
};
