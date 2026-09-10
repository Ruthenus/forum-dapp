const contract_address = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
let current_account;
let web3;
let contract;

document.addEventListener("DOMContentLoaded", () => {
  const connection_btn = document.getElementById("connection_btn");
  if (connection_btn) connection_btn.addEventListener("click", connectWallet);

  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    contract = new web3.eth.Contract(abi, contract_address);

    window.ethereum.on("accountsChanged", (accounts) => {
      if (accounts.length === 0) {
        alert("Accounts not found");
        return;
      }
      current_account = accounts[0];
      enterToDapp();
    });
  } else {
    alert("Please install web3 provider");
  }
});

const connectWallet = async (e) => {
  if (window.ethereum) {
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (!accounts || !Array.isArray(accounts) || accounts.length === 0) {
        alert("Accounts not found");
        return;
      }

      current_account = accounts[0];
      enterToDapp();
      e.target.hidden = true;
    } catch (error) {
      alert("Connect to DApp error. See logs");
      console.error("Connect error:", error);
    }
  } else {
    alert("Please install web3 provider");
  }
};

const enterToDapp = () => {
  const account_lbl = document.getElementById("account_lbl");
  if (account_lbl) {
    account_lbl.hidden = false;
    account_lbl.style.color = "darkgreen";
    account_lbl.textContent = current_account;
  }

  const makePost_btn = document.getElementById("makePost_btn");
  makePost_btn.hidden = false;
  makePost_btn.addEventListener("click", makePost);
};

const makePost = async () => {
  try {
    const postText = "Hello, world. My first post in blockchain";

    await contract.methods.create_post(postText).send({ from: current_account });

    const posts = await contract.methods.get_posts().call();
    console.log("Posts:", posts);
  } catch (error) {
    console.error("Post creation error:", error);
  }
};
