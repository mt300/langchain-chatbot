// src/vector/vectorStore.ts
import { Chroma } from "@langchain/community/vectorstores/chroma";
// import {  MarkdownHeaderTextSplitter } from "langchain/text_splitter";
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/huggingface_transformers";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { Document } from "langchain/document";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { TextLoader as MarkdownLoader } from "langchain/document_loaders/fs/text"; // o mesmo loader pode ser usado para .md
import fs from 'fs'


export const embeddings = new HuggingFaceTransformersEmbeddings({
  model: "Xenova/multilingual-e5-small",
//   url: "http://localhost:11434/",
});
// const client = new ChromaClient({ path: "http://localhost:8000", ssl: false });
export const vectorStore = new Chroma(embeddings, {
  clientParams: { 
    host: "localhost",
    port: 8000,
    ssl: false,
  },
  collectionName: "a-test-collection-v2",
});

export async function markdownHeaderSplitter(rawDocs: Document[]) {
  const newDocs: Document[] = [];

  for (const doc of rawDocs) {
    const lines = doc.pageContent.replace(/\r\n/g, "\n").split("\n");

    let currentH1 = "";
    let currentH2 = "";
    let currentH3 = "";
    let currentChunk = "";

    const flushChunk = () => {
      if (currentChunk.trim() === "") return;
      newDocs.push(new Document({
        pageContent: currentChunk.trim(),
        metadata: {
          ...doc.metadata,
          h1: currentH1 || null,
          h2: currentH2 || null,
          h3: currentH3 || null
        }
      }));
      currentChunk = "";
    };

    for (const line of lines) {
      const match = line.match(/^\s*(#{1,3})\s+(.*)$/); // detecta # até ###

      if (match) {
        // Antes de mudar de header, salva o chunk anterior
        flushChunk();

        const level = match[1]?.length ?? 0;
        const text = match[2]?.trim() ?? '';

        if (level === 1) {
          currentH1 = text;
          currentH2 = "";
          currentH3 = "";
        } else if (level === 2) {
          currentH2 = text;
          currentH3 = "";
        } else if (level === 3) {
          currentH3 = text;
        }

        // O novo chunk já começa com o header encontrado
        currentChunk = line + "\n";

      } else {
        currentChunk += line + "\n";
      }
    }

    flushChunk();
  }

  return newDocs;
}


export function cleanDocsMetadata(docs: Document[]) {
  return docs.map((doc) => {
    const cleanMetadata: Record<string, string | number | boolean | null> = {};

    // Transfere apenas campos válidos
    for (const [key, value] of Object.entries(doc.metadata)) {
      if (
        typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean" ||
        value === null
      ) {
        cleanMetadata[key] = value;
      }
    }

    return {
      ...doc,
      metadata: cleanMetadata,
    };
  });
}
// Isso aqui inicia o database vector store
export async function initVectorStore() {
    try {
        const loader = new DirectoryLoader("./documents", {
            ".pdf": (path:string) => new PDFLoader(path),
            ".md": (path:string) => new MarkdownLoader(path),
        });

        const rawDocs = await loader.load();
        
        const docs = await markdownHeaderSplitter(rawDocs);
        const cleanDocs = cleanDocsMetadata(docs);
        const ids = cleanDocs.map((_doc: Document, index: number) => (index + 1).toString());
        // salvar embeddings + docs em json
        const dump = cleanDocs.map((doc, i) => ({
          id: ids[i],
          content: doc.pageContent,
          metadata: doc.metadata,
        }));
        console.log('Ola')
        fs.writeFileSync("embeddings_dump.json", JSON.stringify(dump, null, 2));

        await vectorStore.delete({ filter: { id: { $ne: "0" } } }); // Deleta os documentos existentes, se houver
        await vectorStore.addDocuments(cleanDocs, { ids });
        console.log('Vector store initialized.');

    } catch (error) {
        console.error("Error on vector store:", error);
    }
}

export async function queryVectorStore(query: string, k: number = 4) {
    try {
        const queryEmbedding = await embeddings.embedQuery(query);
        
        // @ts-expect-error - ignorar erro de tipo propositalmente
        const results = await vectorStore.similaritySearchVectorWithScore([queryEmbedding], k);
        const result = []
        for (const [doc, score] of results) {
            result.push({
                similarity: score.toFixed(3),
                content: doc.pageContent,
                metadata: doc.metadata
            });
        }
        result.sort((a, b) => parseFloat(a.similarity) - parseFloat(b.similarity));
        return result;
    } catch (error) {
        console.error("Error querying vector store:", error);
        throw error;
    }
  }