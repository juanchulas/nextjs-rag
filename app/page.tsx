"use client"
import Image from "next/image"
import Logo from "./assets/logo_bayer.png"
import { useChat } from "ai/react"
//import { Message } from "ai"
import Bubble from "./components/Bubble"
import LoadingBubble  from "./components/LoadingBubble"
import PromptSuggestionsRow from "./components/PromptSuggestionsRow"

const Home = () => {
    const {append, isLoading, messages, input, handleInputChange, handleSubmit } =useChat()

    const noMessages = !messages || messages.length === 0
    const handlePrompt = (promptText) =>{
        const msg ={
            id:crypto.randomUUID,
            content:promptText,
            role:"user"
        }
        append(msg)
    }

    return (
        <main>
            <Image src={Logo} alt="Bayer" width="250" />
            <section className={noMessages ? "": "pupulated"}>
                {noMessages ?(
                    <>
                        <p className="starter-text">
                        Información sobre Bayer
                        </p>
                        <br/>
                        <PromptSuggestionsRow onPromptClick={handlePrompt}/>
                    </>
                ) : (
                    <>
                        {messages.map((message, index) => <Bubble key={`message-${index}`} message={message}/>)}
                        {isLoading && <LoadingBubble/>}
                    </>
                )}
            </section>
            <form onSubmit={ handleSubmit }>
                    <input className="question-box" onChange={handleInputChange} value={input} placeholder="preguntame"/>
                    <input type="submit" value="enviar" />
                </form>
        </main>
    )
}



export default Home