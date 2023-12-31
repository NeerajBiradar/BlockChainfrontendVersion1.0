import React, { useEffect, useState } from "react";
import Web3 from 'web3';
import ABI from "../ABI/ABI";
import Address from "../ABI/Address";

const BugReport = () => {
    let [account, setAccount] = useState("");
    let [contractdata, setContractdata] = useState({});
    let [transactionHash, setTransactionHash] = useState("");
    let [isFormFilled, setIsFormFilled] = useState(false);
    let { ethereum } = window;
    let [from, setFrom] = useState('');
    let [to, setTo] = useState('');
    let [gas, setGas] = useState('');
    const info = JSON.parse(localStorage.getItem('Info'))

    useEffect(() => {
        async function Connection() {
            let accounts = await ethereum.request({ method: "eth_requestAccounts" });
            setAccount(accounts[0]);
            const web3 = new Web3(window.ethereum);
            
            let contract = new web3.eth.Contract(ABI, Address);
            setContractdata(contract);
        }
        Connection();
    }, []);

    const SendBugReport = async () => {
        const bug_title = document.getElementById("bug-title").value;
        const bug_description = document.getElementById("bug-description").value;
        if (isFormFilled) {
            const result = await contractdata.methods.ReciveBugReport(bug_title, bug_description).send({ from: account });
            setFrom(result.from);
            setTo(result.to);
            setTransactionHash(result.transactionHash);
            setGas(result.gasUsed);
        }
    };

    const handleFormChange = () => {
        const bug_title = document.getElementById("bug-title").value;
        const bug_description = document.getElementById("bug-description").value;
        if (bug_title && bug_description) {
            setIsFormFilled(true);
        } else {
            setIsFormFilled(false);
        }
    };

    const handleSubmit = async () => {
        const UserTransction = {
            account: account,
            id: transactionHash,
            description: 'Bug title : ' + document.getElementById('bug-title').value,
            from: from,
            to: to,
            gasUsed: gas,
            email: info.email,
            role: info.userType
        };

        const response = await fetch('http://localhost:2000/api/transcation', {
            method: 'POST',
            body: JSON.stringify(UserTransction),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const json = await response.json();
    };

    useEffect(() => {
        if (transactionHash) {
            const submitButton = document.getElementById("submit-button");
            if (submitButton) {
                submitButton.scrollIntoView({ behavior: "smooth" });
            }
        }
    }, [transactionHash]);

    return (
        <div className="container">
            <div className="row">
                <div className="col-12 mt-5">
                    <h1>Bug Description Form</h1>
                    <form action="#" method="POST" id="Bug-form-id">
                        <div className="form-group mt-3">
                            <label htmlFor="bug-title">Bug Title:</label>
                            <input type="text" className="form-control mt-1" id="bug-title" name="bug-title" onChange={handleFormChange} required />
                        </div>
                        <div className="form-group mt-3">
                            <label htmlFor="bug-description">Bug Description:</label>
                            <textarea className="form-control mt-1" id="bug-description" name="bug-description" rows="5" onChange={handleFormChange} required></textarea>
                        </div>
                    </form>
                    <button type="submit" className="btn btn-primary mt-2" onClick={SendBugReport} disabled={!isFormFilled}>Report Bug</button>
                </div>
            </div>
            {transactionHash && (
                <div className="row mt-5">
                    <div className="col-12">
                        <h2>Transaction Done</h2>
                        <p>Transaction Hash: {transactionHash}</p>
                        <button id="submit-button" type="submit" className="btn btn-primary mt-2" onClick={() => {
                            handleSubmit();
                            window.location.reload()
                        }}>Submit</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BugReport;
