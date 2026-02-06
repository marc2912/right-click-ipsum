const SOURCE_PARAGRAPHS = [
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  "Curabitur pretium tincidunt lacus. Nulla gravida orci a odio. Nullam varius, turpis et commodo pharetra, est eros bibendum elit, nec luctus magna felis sollicitudin mauris. Integer in mauris eu nibh euismod gravida. Duis ac tellus et risus vulputate vehicula. Donec lobortis risus a elit. Etiam tempor. Ut ullamcorper, ligula ut dictum pharetra, nisi nunc fringilla magna, in commodo elit erat nec turpis. Ut pharetra auctor nunc.",
  "Praesent dapibus, neque id cursus faucibus, tortor neque egestas augue, eu vulputate magna eros eu erat. Aliquam erat volutpat. Nam dui mi, tincidunt quis, accumsan porttitor, facilisis luctus, metus. Phasellus ultrices nulla quis nibh. Quisque a lectus. Donec consectetuer ligula vulputate sem tristique cursus. Nam nulla quam, gravida non, commodo a, sodales sit amet, nisi.",
  "Pellentesque fermentum dolor. Aliquam quam lectus, facilisis auctor, ultrices ut, elementum vulputate, nunc. Sed lacus. Donec lectus. Donec elit diam, faucibus id, tincidunt et, porttitor vel, justo. Sed molestie vestibulum urna. Nunc dignissim risus id metus. Cras ornare tristique elit. Vivamus vestibulum ntulla nec ante. Praesent placerat risus quis eros.",
  "Fusce pellentesque suscipit nibh. Integer vitae libero ac risus egestas placerat. Vestibulum commodo felis quis tortor. Ut aliquam sollicitudin leo. Cras iaculis ultricies nulla. Donec quis dui at dolor tempor interdum. Vivamus molestie gravida turpis. Aenean sit amet magna vel magna fringilla fermentum. Donec sit amet nulla sed arcu pulvinar ultricies commodo id ligula.",
  "Maecenas malesuada elit lectus felis, malesuada ultricies. Curabitur et ligula. Ut molestie a, ultricies porta urna. Vestibulum commodo volutpat a, convallis ac, laoreet enim. Phasellus fermentum in, dolor. Pellentesque facilisis. Nulla imperdiet sit amet magna. Vestibulum dapibus, mauris nec malesuada fames ac turpis velit, rhoncus eu, luctus et interdum adipiscing wisi. Aliquam erat ac ipsum.",
  "Morbi vel lectus in quam fringilla rhoncus. Mauris enim leo, rhoncus sed, vestibulum sit amet, cursus id, turpis. Integer aliquet, massa id lobortis convallis, tortor risus dapibus augue, vel accumsan tellus nisi eu orci. Mauris lacinia sapien quis libero. Nullam sit amet turpis. Donec a orci et ipsum pharetra faucibus. Ut euismod sapien eu dui.",
  "Nam mollis tristique neque. Nunc in risus sed urna placerat posuere. Fusce faucibus aliquet turpis. Phasellus id libero eget magna fermentum sollicitudin. Sed tincidunt mattis varius. Nunc sodales dignissim purus. Cras mollis semper risus. Nunc sem augue, gravida vel, pellentesque a, placerat a, est. Aenean hendrerit sem quis nibh. Nunc vel lacus."
];

// Parse paragraphs into sentences
function parseSentences(paragraph) {
  return paragraph
    .split(/\.\s+/)
    .map((s) => (s.endsWith(".") ? s : s + "."))
    .filter((s) => s.length > 1);
}

const ALL_SENTENCES = SOURCE_PARAGRAPHS.flatMap(parseSentences);

// Build a mapping from sentence index to paragraph index
const SENTENCE_TO_PARAGRAPH = [];
let sentenceIndex = 0;
for (let pIdx = 0; pIdx < SOURCE_PARAGRAPHS.length; pIdx++) {
  const count = parseSentences(SOURCE_PARAGRAPHS[pIdx]).length;
  for (let i = 0; i < count; i++) {
    SENTENCE_TO_PARAGRAPH[sentenceIndex++] = pIdx;
  }
}

export function generateIpsum(type, randomize) {
  const startIdx = randomize
    ? Math.floor(Math.random() * ALL_SENTENCES.length)
    : 0;

  if (type === "1-sentence" || type === "2-sentences") {
    const count = type === "1-sentence" ? 1 : 2;
    const sentences = [];
    for (let i = 0; i < count; i++) {
      sentences.push(ALL_SENTENCES[(startIdx + i) % ALL_SENTENCES.length]);
    }
    return sentences.join(" ");
  }

  if (type === "1-paragraph" || type === "2-paragraphs") {
    const count = type === "1-paragraph" ? 1 : 2;
    const startParagraph = SENTENCE_TO_PARAGRAPH[startIdx];
    const paragraphs = [];
    for (let i = 0; i < count; i++) {
      paragraphs.push(
        SOURCE_PARAGRAPHS[(startParagraph + i) % SOURCE_PARAGRAPHS.length]
      );
    }
    return paragraphs.join("\n\n");
  }

  return "";
}
