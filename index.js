require('dotenv').config();
const express = require('express');
const app = express();
const fileUpload = require('express-fileupload');
app.use(
    fileUpload({
        extended:true
    })
)
app.use(express.static(__dirname));
app.use(express.json());
const path = require("path");
const ethers = require('ethers');

var port = 3000;

const API_URL = process.env.API_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

const {abi} = require('./artifacts/contracts/Voting.sol/Voting.json');
const provider = new ethers.providers.JsonRpcProvider(API_URL);

const signer = new ethers.Wallet(PRIVATE_KEY, provider);

const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
})

app.get("/index.html", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
})

app.post("/vote", async (req, res) => {
    var vote1 = req.body.vote1;
    var vote2 = req.body.vote2;
    var vote3 = req.body.vote3;
    console.log(vote1, vote2, vote3);

    async function storeDataInBlockchain(vote1, vote2, vote3) {
        console.log("Adding votes in the contract...");
        const tx1 = await contractInstance.addVote(vote1);
        const tx2 = await contractInstance.addVote(vote2);
        const tx3 = await contractInstance.addVote(vote3);
        await Promise.all([tx1.wait(), tx2.wait(), tx3.wait()]);
    }

    const bool = await contractInstance.getVotingStatus();
    if (bool == true) {
        await storeDataInBlockchain(vote1, vote2, vote3);
        res.send("The votes have been registered in the smart contract");
    }
    else {
        res.send("Voting is finished");
    }
});

app.listen(port, function () {
    console.log("App is listening on port 3000")
});
