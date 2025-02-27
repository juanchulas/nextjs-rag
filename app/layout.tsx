import "./global.css"

export const metadata = {
    title: "DENTSU - Bayer",
    description: "Información sobre Gynocanesten"
}

const RootLayout = ({ children }) =>{
    return (
        <html lang = "es">
            <body>{children}</body>
        </html>
    )
}

export default RootLayout