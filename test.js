var HDWalletProvider = require("truffle-hdwallet-provider");

var mnemonic = "conduct donate crystal rain wreck improve battle able unveil knock mixture cherry";

var provider = new HDWalletProvider(mnemonic, "https://ropsten.infura.io/", 42);

console.log(provider);