import { DataAPIClient } from "@datastax/astra-db-ts"
import { PuppeteerWebBaseLoader } from "@langchain/community/document_loaders/web/puppeteer"
import { OpenAI } from "openai"

import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"

import "dotenv/config"


type SimilartityMetric = "dot_product" | "cosine" | "euclidean"

const  { ASTRA_DB_NAMESPACE, 
    ASTRA_DB_COLLECTION, 
    ASTRA_DB_API_ENDPOINT, 
    ASTRA_DB_APPLICATION_TOKEN, 
    OPEN_AI_API_KEY
} = process.env

const openai = new OpenAI({ apiKey: OPEN_AI_API_KEY})

const dentsu = [
    'https://www.gynocanesten.com.co/quiz-sintomas-vaginales/',
    'https://www.gynocanesten.com.co/salud-intima/',
    'https://www.gynocanesten.com.co/productos/gynocanesten-crema-vaginal-tratamiento-de-3-dias/',
    'https://www.gynocanesten.com.co/productos/gynocanesten-ovulo-vaginal-tratamiento-de-1-dia/',
    'https://www.gynocanesten.com.co/salud-intima/',
    'https://www.gynocanesten.com.co/preguntas-frecuentes/',
    'https://www.gynocanesten.com.co/salud-intima/flujo-blanco/',
    'https://www.gynocanesten.com.co/salud-intima/candidiasis/',
    'https://www.gynocanesten.com.co/salud-intima/vaginosis-bacteriana/',
    'https://www.gynocanesten.com.co/salud-intima/la-candidiasis-y-el-tratamiento-en-pareja/',
    'https://www.gynocanesten.com.co/salud-intima/mantener-la-calma-una-forma-de-evitar-la-candidiasis/',
    'https://www.gynocanesten.com.co/salud-intima/6-tips-para-evitar-una-infeccion-vaginal-por-hongos/',
    'https://www.gynocanesten.com.co/salud-intima/6-tips-para-evitar-una-infeccion-vaginal-por-hongos/',
    'https://www.gynocanesten.com.co/salud-intima/infecciones-vaginales-en-cifras/',
    'https://www.gynocanesten.com.co/salud-intima/como-tratar-la-infeccion-vaginal/'
]

const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN)
const db = client.db(ASTRA_DB_API_ENDPOINT, {namespace: ASTRA_DB_NAMESPACE})

const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 512,
    chunkOverlap:100
})

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
    for await ( const url of dentsu){
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

createCollection().then(() => loadSampleData())