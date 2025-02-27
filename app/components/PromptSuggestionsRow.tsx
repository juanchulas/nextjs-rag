import PromptSuggestionButton from "./PromptSuggestionButton"

const PromptSuggestionsRow = ({onPromptClick}) =>{
    const prompts =[
        "¿qué cuidados de tu zona intima que recomienda gynocanesten?",
        "¿Cómo aplicar el óvulo tratamiento 1 día?",
        "¿Cuándo consultar al médico antes de usar el óvulo vaginal?",
        "¿Qué puede estar sucediendo en tu cuerpo si tienes flujo blanco?",
        "¿Cómo tratar la infección vaginal?",
        "¿Cómo evitar la infección vaginal por hongos?"
    ]

    return(
        <div className="prompt-suggestion-row">
            {prompts.map((prompt, index) => 
            <PromptSuggestionButton 
            key={`suggestion-${index}`}
            text={prompt}
            onClick={() => onPromptClick(prompt)}
            />)}
        </div>
    )
}

export default PromptSuggestionsRow