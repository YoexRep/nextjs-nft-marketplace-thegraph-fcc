import { useState, useEffect } from "react"
import { useWeb3Contract, useMoralis } from "react-moralis"
import nftMarketplaceAbi from "../constants/NftMarketplace.json"
import nftAbi from "../constants/BasicNft.json"
import Image from "next/image"
import { Card, useNotification } from "web3uikit"
import { ethers } from "ethers"
import UpdateListingModal from "./UpdateListingModal"

//Funcion para truncar las direcciones de las wallet, y que se vean asi Axdf...58z9
const truncateStr = (fullStr, strLen) => {
    if (fullStr.length <= strLen) return fullStr

    const separator = "..."
    const seperatorLength = separator.length
    const charsToShow = strLen - seperatorLength
    const frontChars = Math.ceil(charsToShow / 2)
    const backChars = Math.floor(charsToShow / 2)
    return (
        fullStr.substring(0, frontChars) +
        separator +
        fullStr.substring(fullStr.length - backChars)
    )
}

//Creamos un componente NFTBoX, el cual recibe, varios parametros
export default function NFTBox({ price, nftAddress, tokenId, marketplaceAddress, seller }) {
    //Hock web3 para usar los objetos web3 y account
    const { isWeb3Enabled, account } = useMoralis()

    //Creamos un hoock para manejar el estado de la imagen
    const [imageURI, setImageURI] = useState("")
    const [tokenName, setTokenName] = useState("")
    const [tokenDescription, setTokenDescription] = useState("")
    const [showModal, setShowModal] = useState(false)
    const hideModal = () => setShowModal(false)

    //Dispatch para mostrar alertas de transaccicones
    const dispatch = useNotification()

    //Llamamos con web3contract a una funcion tokenUri, le pasamos los parametros como abi, y address ,los cuales obtenemos de nuestra carpeta constants,
    //Esta funcion tonkeUri recibe un parametro, tokenId, y este lo obtuvimos de los parametros pasados a el componente.
    const { runContractFunction: getTokenURI } = useWeb3Contract({
        abi: nftAbi,
        contractAddress: nftAddress,
        functionName: "tokenURI",
        params: {
            tokenId: tokenId,
        },
    })

    const { runContractFunction: buyItem } = useWeb3Contract({
        abi: nftMarketplaceAbi,
        contractAddress: marketplaceAddress,
        functionName: "buyItem",
        msgValue: price,
        params: {
            nftAddress: nftAddress,
            tokenId: tokenId,
        },
    })

    async function updateUI() {
        //obtenemos el tokenUri
        const tokenURI = await getTokenURI()
        console.log(`The TokenURI is ${tokenURI}`)

        //Aqui haremos un replaces de para usar el gateway de IPFS, debido a que todavia los navegadores no leen imagenes de IPFS, se debe de leer a traves de un gateway, pero esto esta centralizado
        if (tokenURI) {
            // IPFS Gateway: A server that will return IPFS files from a "normal" URL.
            const requestURL = tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/")

            //Obtenemos del objeto IPFS el cual contiene el atributo IMage
            const tokenURIResponse = await (await fetch(requestURL)).json()

            //Obtenemos el URL de la image desde nuestro objeto IPFS
            const imageURI = tokenURIResponse.image

            //hacemos un poco de trampa y agregamos el gateway ipfs para poder visualizar la imagen, si necesidad de extencion o brave
            const imageURIURL = imageURI.replace("ipfs://", "https://ipfs.io/ipfs/")

            //Aqui simplemente actualizamos los hooks
            setImageURI(imageURIURL)
            setTokenName(tokenURIResponse.name)
            setTokenDescription(tokenURIResponse.description)
        }
        // get the tokenURI
        // using the image tag from the tokenURI, get the image
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUI()
        }
    }, [isWeb3Enabled])

    const isOwnedByUser = seller === account || seller === undefined
    const formattedSellerAddress = isOwnedByUser ? "you" : truncateStr(seller || "", 15)

    const handleCardClick = () => {
        //Si es del usuario
        isOwnedByUser
            ? setShowModal(true)
            : buyItem({
                  onError: (error) => console.log(error),
                  onSuccess: () => handleBuyItemSuccess(),
              })
    }

    const handleBuyItemSuccess = () => {
        dispatch({
            type: "success",
            message: "Item bought!",
            title: "Item Bought",
            position: "topR",
        })
    }

    //Todo lo presentando aqui es html y javascript, usando el paradigma de react
    return (
        <div>
            <div>
                {imageURI ? (
                    <div>
                        {/*Este es el modola cuando hacemos clic en los nfts, por defecto lo ponemos que no se vea*/}
                        <UpdateListingModal
                            isVisible={showModal}
                            tokenId={tokenId}
                            marketplaceAddress={marketplaceAddress}
                            nftAddress={nftAddress}
                            onClose={hideModal}
                        />
                        {/*Componente importado de web3uikit para colocar tarjetas de marcos*/}
                        <Card
                            title={tokenName}
                            description={tokenDescription}
                            onClick={handleCardClick}
                        >
                            <div className="p-2">
                                <div className="flex flex-col items-end gap-2">
                                    <div>#{tokenId}</div>
                                    <div className="italic text-sm">
                                        Owned by {formattedSellerAddress}
                                    </div>
                                    {/*Componente image de nextjs para renderizar imagenes */}
                                    <Image
                                        loader={() => imageURI}
                                        src={imageURI}
                                        height="200"
                                        width="200"
                                    />
                                    <div className="font-bold">
                                        {ethers.utils.formatUnits(price, "ether")} ETH
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                ) : (
                    <div>Loading...</div>
                )}
            </div>
        </div>
    )
}
