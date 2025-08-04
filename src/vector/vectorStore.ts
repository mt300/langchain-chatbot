// src/vector/vectorStore.ts
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/huggingface_transformers";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { Document } from "langchain/document";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { TextLoader as MarkdownLoader } from "langchain/document_loaders/fs/text"; // o mesmo loader pode ser usado para .md



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
        
        const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 500, chunkOverlap: 100 });
        const docs = await splitter.splitDocuments(rawDocs);
        const cleanDocs = cleanDocsMetadata(docs);
        const ids = cleanDocs.map((_doc: Document, index: number) => (index + 1).toString());
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