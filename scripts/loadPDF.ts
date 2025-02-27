import { DataAPIClient } from "@datastax/astra-db-ts"
import { PuppeteerWebBaseLoader } from "@langchain/community/document_loaders/web/puppeteer"
import { OpenAI } from "openai"
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"

import "dotenv/config"


type SimilartityMetric = "dot_product" | "cosine" | "euclidean"

const  { ASTRA_DB_NAMESPACE, 
    ASTRA_DB_COLLECTION, 
    ASTRA_DB_API_ENDPOINT, 
    ASTRA_DB_APPLICATION_TOKEN, 
    OPEN_AI_API_KEY
} = process.env

const openai = new OpenAI({
    apiKey: OPEN_AI_API_KEY
})

const f1Data = [
    'https://en.wikipedia.org/wiki/Formula_One',
    'https://www.formula1.com/en/latest/all',
    'https://www.formula1.com/en/results.html/2024/races.html',
    'https://www.formula1.com/en/racing/2024.html',
    'https://en.wikipedia.org/wiki/List_of_Formula_One_drivers',
    'https://en.wikipedia.org/wiki/List_of_Formula_One_World_Drivers%27_Champions'
]


const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 512,
    chunkOverlap:100
})

/*PDF */


const loader = new PDFLoader("pdf/La-zona-muerta-Stephen-King.pdf")
console.log(loader)

const rawDoc = await loader.load();

console.log(rawDoc.slice(0, 5));


const splitDocs = await splitter.splitDocuments(rawDoc);

console.log(splitDocs.slice(0, 5));

/*PDF */



const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN)
const db = client.db(ASTRA_DB_API_ENDPOINT, {namespace: ASTRA_DB_NAMESPACE})



const createCollection = async(similarityMetric: SimilartityMetric = "dot_product") =>{
    const res = await db.createCollection(ASTRA_DB_COLLECTION,{
        vector:{
            dimension: 1536,
            metric:similarityMetric
        }
    })
    console.log(res)
}

const loadSampleData = async() => {
    const collection = await db.collection(ASTRA_DB_COLLECTION)
    for await ( const url of f1Data){
        const content = await scrapePage(url)
        const chunks = await splitter.splitText(content)
        for await (const chunk of chunks){
            const embedding = await openai.embeddings.create({
                model: "text-embedding-3-small",
                input: chunk,
                encoding_format: "float" 
           })

           const vector = embedding.data[0].embedding

           const res = await collection.insertOne({
            $vector: vector,
            text: chunk
           })
           console.log(res)
        }
    }
}

const scrapePage = async (url: string) => {
    const loader = new PuppeteerWebBaseLoader(url, {
        launchOptions: {
            headless: true
        },
        gotoOptions: {
            waitUntil: "domcontentloaded"
        },
        evaluate: async(page, browser) => {
           const result = await page.evaluate(() => document.body.innerHTML)
           await browser.close()
           return result
        }
    })
    return ( await loader.scrape())?.replace(/<[^>]*>?/gm, '')
}

//createCollection().then(() => loadSampleData())