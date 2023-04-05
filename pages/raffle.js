import Head from "next/head"
import Image from "next/image"
import styles from "../styles/Home.module.css"
import { Form, useNotification, Button } from "web3uikit"
import { useMoralis, useWeb3Contract } from "react-moralis"
import { ethers } from "ethers"
import raffleAbi from "../constants/RafflePersonalizado.json"
import networkMappingRaffle from "../constants/networkMappingRaflle.json"

import { useEffect, useState } from "react"

export default function Raffle() {
    const { chainId, account, isWeb3Enabled } = useMoralis()
    const chainString = chainId ? parseInt(chainId).toString() : "31337"
    const raffleAddress = chainId ? networkMappingRaffle[chainString].RafflePersonalizado[0] : null
    const dispatch = useNotification()
    const [rondaActual, setRondaActual] = useState("0")
    const entranceFee = ethers.utils.parseEther("0.0032369315488695")

    const { runContractFunction } = useWeb3Contract()

    const handleWithdrawSuccess = () => {
        dispatch({
            type: "success",
            message: "Se compro el billete de loteria",
            position: "topR",
        })
    }

    async function setupUI() {
        const returnRondaActual = await runContractFunction({
            params: {
                abi: raffleAbi,
                contractAddress: raffleAddress,
                functionName: "obtenerActualRondaLoteria",
            },
            onError: (error) => console.log(error),
        })
        if (returnRondaActual) {
            setRondaActual(returnRondaActual.toString())
        }
    }

    async function comprandoBillete(data) {
        const numeroTicket = data.data[0].inputResult
        console.log("Comprando... numero jugado: " + numeroTicket)

        await runContractFunction({
            params: {
                abi: raffleAbi,
                contractAddress: raffleAddress,
                functionName: "enterRaffle",
                params: {
                    numTicket: numeroTicket,
                },
                msgValue: entranceFee,
            },
            onError: (error) => console.log(error),
            onSuccess: () => handleWithdrawSuccess,
        })
    }

    useEffect(() => {
        setupUI()
    }, [rondaActual, account, isWeb3Enabled, chainId])

    return (
        <div className={styles.container}>
            <h1>Estamos en la ronda # ${rondaActual}</h1>
            <Form
                onSubmit={comprandoBillete}
                data={[
                    {
                        name: "numero de ticket",
                        type: "number",
                        inputWidth: "20%",
                        value: "",
                        key: "numTicket",
                    },
                ]}
                title="Loteria basica, digita un numero y compra un billete"
                id="Main Form"
            />
        </div>
    )
}
