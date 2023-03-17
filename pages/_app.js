import "../styles/globals.css"
import { MoralisProvider } from "react-moralis"
import Header from "../components/Header"
import Head from "next/head"
import { NotificationProvider } from "web3uikit"
import { ApolloProvider, ApolloClient, InMemoryCache } from "@apollo/client"

const client = new ApolloClient({
    cache: new InMemoryCache(),
    uri: process.env.NEXT_PUBLIC_SUBGRAPH_URL,
})

function MyApp({ Component, pageProps }) {
    return (
        <div>
            <Head>
                <title>NFT Marketplace</title>
                <meta name="description" content="NFT Marketplace" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            {/*Componente de moralis para que funcionen los hook y componentes de moralis, y el servidor de moralis, aunque ya este no funcion*/}
            <MoralisProvider initializeOnMount={false}>
                {/*A raiz de moralis server ya no funciona se usara el ApolloProvider que es El provider para The graph*/}
                <ApolloProvider client={client}>
                    {/*Notificacion provider es el componente de web3uikit para las notificaciones */}
                    <NotificationProvider>
                        <Header />
                        <Component {...pageProps} />
                    </NotificationProvider>
                </ApolloProvider>
            </MoralisProvider>
        </div>
    )
}

export default MyApp
