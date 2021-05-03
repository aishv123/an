'use strict'

const IPFS = require('ipfs');  // importing IPFS package
const abi = require('./assets/ContractAbi.json'); // ABIs are stored in a seperate JSON file. Importing ABIs


var node;
var account;

window.addEventListener('load', async () => {
  if (typeof window.ethereum !== 'undefined') {
    console.log("MetaMask is Available :) !");
  }
  // Modern DApp browsers
  if (window.ethereum) {
    window.web3 = new Web3(ethereum);
    // To prevent the page reloading when the MetaMask network changes
    ethereum.autoRefreshOnNetworkChange = false;
    // To Capture the account details from MetaMask
    const accounts = await ethereum.enable();
    account = accounts[0];
  }
  // Legacy DApp browsers
  else if (window.web3) {
    //window.web3 = new Web3(web3.currentProvider);
    window.web3 = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io/v3/cbd9dc11b30147e9a2cc974be655ef7c"));
  }
  // Non-DApp browsers
  else {
    console.log('Non-Ethereum browser detected. Please install MetaMask');
  }
});

const contractaddress = '0xC4Bd9ef7C851450EdaEB6dbAE59d52e28D9181EC';

function setDetails() {
  const myContract = new web3.eth.Contract(abi, contractaddress, { from: account, gasPrice: '5000000', gas: '5000000' });

  const payload = {
    name: document.getElementById("name").value,
    dob: document.getElementById("birthday").value,
    gender: document.getElementById("gender").value,
    cnumber: document.getElementById("contact_no").value,
    email: document.getElementById("email_id").value,
    bgroup: document.getElementById("bloodgroup").value,
    city: document.getElementById("city").value,
    state: document.getElementById("state").value,
    accountId: document.getElementById('accountid').value,
    privateKey: document.getElementById('privatekey').value,
    userId: Math.floor(Math.random() * 10000000).toString(), // Generates a random number and will be converted in the string format as string variable is declared in the contract
  };

  myContract.methods.contactNum(payload.cnumber).call(function (err, result) {
    // calls contactNum from the contract to check for duplicate entries in Phone No 
    if (err) { console.log(err); }
    if (!result) {
      myContract.methods.emailId(payload.email).call(async function (err, result) {
        // calls email ID field from the contract to check for duplicate entries in Email 
        if (err) { console.log(err); }
        if (!result) {
          const cid = await createCid(JSON.stringify(payload));

          myContract.methods.setUserDetails(
            payload.userId, 
            payload.cnumber, 
            payload.email,
            payload.accountId,
            cid
          ).send(function (err, result) {
            if (err) { console.log(err); }
            if (result) {
              document.getElementById("result").innerHTML = result; //Prints the transaction ID genenrated once confirmed on metamask 
              document.getElementById("result2").innerHTML = payload.userId; //Prints the Random number generated as Amrita ID
              document.getElementById("result3").innerHTML = cid; //Prints the Random number generated as Amrita ID
            }
          });
        } else {
          alert('Email used'); // Shows Alert if email already exists 
        }
      })
    } else {
      alert('Contact Number used'); //Pop up alert if contact number already exists
    }
  })
}
function showAccountId() {
  // Function called in to retrieve the information
  const myContract = new web3.eth.Contract(abi, contractaddress);
  const userId = document.getElementById("user_id").value;
  console.log(userId)
  myContract.methods.getaccountId(userId).call(function (err, result) {
    if (err) { console.log(err); }
    if (result) {
      console.log(result)
      //Displays the information captured from the set details 
      document.getElementById("get_accountid").innerHTML = result;
    }
  });
}

async function showAllDetails() {
  const secretId = document.getElementById("secret_id").value;
  const val = await getObject(secretId);
  const details = JSON.parse(val);

  document.getElementById("get_name").innerHTML = details.name;
  document.getElementById("get_dob").innerHTML = details.dob;
  document.getElementById("get_gender").innerHTML = details.gender;
  document.getElementById("get_number").innerHTML = details.cnumber;
  document.getElementById("get_email").innerHTML = details.email;
  document.getElementById("get_bloodgroup").innerHTML = details.bgroup;
  document.getElementById("get_state").innerHTML = details.state;
  document.getElementById("get_city").innerHTML = details.city;
  document.getElementById("get_privatekey").innerHTML = details.privateKey;
  document.getElementById("get_accountid").innerHTML = details.accountId;
}

async function createCid(payload) {
  console.log(payload);
  const fileAdded = await node.add(payload)
  return (fileAdded.cid.toString());
}

async function getObject(cid) {
  let content;
  for await (const buf of node.cat(cid)) {
    content = new TextDecoder("utf-8").decode(buf);
  }
  console.log(content);
  return content;
}

async function start() {
  node = await IPFS.create(); //Creates a IPFS node 

  if (window.location.href.includes('registration')) {
    document.getElementById('submitBtnIndex').addEventListener("click", () => setDetails());
  } else if (window.location.href.includes('verify')) {
    document.getElementById('getDetailsBtn').addEventListener("click", () => showAccountId());
  } else if (window.location.href.includes('secret')) {
    document.getElementById('getDetailsBtn').addEventListener("click", () => showAllDetails());
  }
}

start(); //Initial Start of the program