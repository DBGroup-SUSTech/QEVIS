export const LayoutConfig = {
  marginTop: 40,
  marginLeft: 20,
  marginRight: 20,
  vertexContainerHeight: 14,
  vertexHeight: 11,
  width: 1000,
  height: 800,
  // stepColors: ["#1F77B4", "#FFA556",
  //   "#2CA02C", "#9467BD", "#EE6545"],
  // stepColors: [
  //   "rgba(69,108,164,0.51)",
  //   "rgba(179,62,68,0.53)",
  //   "rgba(117,74,138,0.47)",
  //   "rgba(36,150,172,0.49)",
  //   "rgba(142,161,200,0.56)",
  // ],
  stepColors2: [
    "rgba(181,123,203,0.46)",
    "rgba(224,143,146,0.45)",
    "rgba(85,98,172,0.55)",
    "rgba(245,224,150,0.73)",
    "rgba(194,228,195,0.73)",
  ],
  stepColors3: [
    "rgba(346, 70, 94,1)",
    "rgba(255, 209, 102,0.51)",
    "rgba(6, 214, 160,0.85)",
    "rgba(17, 138, 178,0.73)",
    "rgba(7, 59, 76,0.23)",
  ],
  stepColors4: [
    "rgba(38, 70, 83,1)",
    "rgba(42, 157, 143,1)",
    "rgba(233, 196, 106,1)",
    "rgba(244, 162, 97,1)",
    "rgba(231, 111, 81, 1)",
  ],
  stepColors: [
    "rgba(203,213,232,1)",
    "rgba(179,226,205,1)",
    "rgba(253,205,172,1)",
    // "rgba(244,202,228,1)",
    // "rgba(230,245,201, 1)",

  ],
  outlierColors: ["#d92b2b", "#3469f8", "#e8e8e8"],
  stepName: {
    'Map': ["Initialization", "Input", "Processor", "Sink", "Spill"],
    'Reducer': ["Initialization", "Shuffle", "Processor", "Sink", "Spill"],
  },
  gapPixel: 30,

  /* Task list view */
  unitHeight: 25,
  detailHeight: 80,

  /* Task matrix view */
  padding: 14,    // px

}
