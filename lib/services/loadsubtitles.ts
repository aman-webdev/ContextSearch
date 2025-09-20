import { Document } from "@langchain/core/documents";
import { parse } from "@plussub/srt-vtt-parser";
import { Entry } from "@plussub/srt-vtt-parser/dist/types";
import fs from "fs";
import path from "path";


// langchain native subtitle loader doesnt return docs with timestamp
const loadSubtitleFile = (filePath: string) => {
  const { entries } = parse(
    fs
      .readFileSync(filePath) // or '.srt'
      .toString()
  );


  const langChainDocs = entries.map((ent) => {
    const { text, ...otherProps } = ent;
    return new Document({
      pageContent: text,
      metadata: {
        source: path.basename(filePath),
        ...otherProps,
      },
    });
  });

  return langChainDocs

};

export default loadSubtitleFile;
