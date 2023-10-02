import { ethers } from "./ethers-5.6.esm.min.js"
import { abi, contractAddress } from "./constants.js"
const connectButton = document.getElementById("connectButton")
const fundButton = document.getElementById("fundButton")
const balanceButton = document.getElementById("balanceButton")
const withdrawButton = document.getElementById("withdrawButton")
connectButton.onclick = connect
fundButton.onclick = fund
balanceButton.onclick = getBalance
withdrawButton.onclick = withdraw
console.log(ethers)
async function connect() {
    if (typeof window.ethereum !== "undefined") {
        console.log("hi there metamask!!!!")
        //to connect to metamask.Metamask pops up
        try {
            await window.ethereum.request({ method: "eth_requestAccounts" })
        } catch (error) {
            console.log(error)
        }
        console.log("connected")
        //document.getElementById("connectButton").innerHTML = "connected!"
        document.innerHTML = "connected!"
    } else {
        // document.getElementById("connectButton").innerHTML =
        //    "Please install metamask!"
        document.innerHTML = "Please install metamask!"
    }
}
async function getBalance() {
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const balance = await provider.getBalance(contractAddress)
        console.log(ethers.utils.formatEther(balance))
    }
}
async function fund(ethAmount) {
    //for executing on local hardhat network we hard code it
    ethAmount = document.getElementById("ethAmount").value
    console.log(`funding with ${ethAmount}....`)
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        console.log(signer)
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const transactionResponse = await contract.fund({
                value: ethers.utils.parseEther(ethAmount),
            })
            await listenForTransactionMine(transactionResponse, provider)
            console.log("Done...!")
        } catch (error) {
            console.log(error)
        }
    }
}

async function withdraw() {
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const transactionResponse = await contract.withdraw()
            await listenForTransactionMine(transactionResponse, provider)
        } catch (error) {
            console.log(error)
        }
    }
}
//listen for the transaction to be mined
function listenForTransactionMine(transactionResponse, provider) {
    console.log(`Mining${transactionResponse.hash}....`)
    //listen for this transaction to finish
    return new Promise((resolve, reject) => {
        provider.once(transactionResponse.hash, (transactionReceipt) => {
            console.log(
                `completed with ${transactionReceipt.confirmations} confirmations`,
            )
            resolve()
        })
    }) //because we want to get transactonResponse hash first
}
