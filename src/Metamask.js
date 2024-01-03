import App from "./App";
import {Result, ethers} from "ethers";
import { link } from "fs";
import { useState } from "react";
import "./metamask.css";
import ErrorMessage from "./ErrorMessage";
import TxList from "./TxList";

const Metamask = () => {

    const [errorMessage, setErrorMessage] = useState(null);
    const [defaultAccount, setDefaultAccount] = useState(null);
    const [userBalance, setUserBalance] = useState(null);

    const connectWallet = () => {
        if(window.ethereum) {
            window.ethereum.request({method: 'eth_requestAccounts'})
                .then(result => {
                    accountChanged ([result[0]])
                })
        } else {
            setErrorMessage('Install MetaMask Please!!!')
        }
    }


    const accountChanged = (accountName) => {
        setDefaultAccount(accountName)
        getUserBalance(accountName)
    }

    const getUserBalance = (accountAddress) => {
        window.ethereum.request({method: 'eth_getBalance', params: [String(accountAddress), "latest"]})
            .then(balance => {
                setUserBalance(ethers.formatEther(balance));
            })
    }




    const startPayment = async ({ setError, setTxs, ether, addr }) => {
        try {
            if (!window.ethereum)
                throw new Error("No crypto wallet found. Please install it.");

            await window.ethereum.send("eth_requestAccounts");
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            ethers.getAddress(addr);
            const tx = await signer.sendTransaction({
                to: addr,
                value: ethers.parseEther(ether)
            });
            console.log({ ether, addr });
            console.log("tx", tx);
            setTxs([tx]);
        } catch (err) {
            setError(err.message);
        }
    };



    const [error, setError] = useState();
    const [txs, setTxs] = useState([]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData(e.target);
        setError();
        await startPayment({
            setError,
            setTxs,
            ether: data.get("ether"),
            addr: data.get("addr")
        });
    };




    return (
        <div>
            <h1>
                Metamask Wallet connection
            </h1>

            <button onClick={connectWallet}>Connect Wallet</button>
            <h3>Address : {defaultAccount}</h3>
            <h3>Balance : {userBalance} ETH</h3>

            {errorMessage}



            <form className="m-4" onSubmit={handleSubmit}>
                <div className="credit-card w-full lg:w-1/2 sm:w-auto shadow-lg mx-auto rounded-xl bg-white">
                    <main className="mt-4 p-4">
                        <h1 className="text-xl font-semibold text-gray-700 text-center">
                            Send ETH payment
                        </h1>
                        <div className="">
                            <div className="my-3">
                                <input
                                    type="text"
                                    name="addr"
                                    className="input input-bordered block w-full focus:ring focus:outline-none"
                                    placeholder="Recipient Address"
                                />
                            </div>
                            <div className="my-3">
                                <input
                                    name="ether"
                                    type="text"
                                    className="input input-bordered block w-full focus:ring focus:outline-none"
                                    placeholder="Amount in ETH"
                                />
                            </div>
                        </div>
                    </main>
                    <footer className="p-4">
                        <button
                            type="submit"
                            className="btn btn-primary submit-button focus:ring focus:outline-none w-full"
                        >
                            Pay now
                        </button>
                        <ErrorMessage message={error} />
                        <TxList txs={txs} />
                    </footer>
                </div>
            </form>


        </div>
    )
}

export default Metamask;