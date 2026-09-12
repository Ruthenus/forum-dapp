// JSON ABI контракту Forum (з artifacts після hardhat compile)
// https://docs.soliditylang.org/en/latest/abi-spec.html
// Використання: new web3.eth.Contract(abi, address)
// https://docs.web3js.org/libdocs/Contract

const abi = [
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "content",
          "type": "string"
        }
      ],
      "name": "create_post",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "idx",
          "type": "uint256"
        }
      ],
      "name": "get_post",
      "outputs": [
        {
          "components": [
            {
              "internalType": "string",
              "name": "content",
              "type": "string"
            },
            {
              "internalType": "address",
              "name": "author",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "timestamp",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "like",
              "type": "uint256"
            }
          ],
          "internalType": "struct Forum.Post",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "get_posts",
      "outputs": [
        {
          "components": [
            {
              "internalType": "string",
              "name": "content",
              "type": "string"
            },
            {
              "internalType": "address",
              "name": "author",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "timestamp",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "like",
              "type": "uint256"
            }
          ],
          "internalType": "struct Forum.Post[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "hasLiked",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "idx",
          "type": "uint256"
        }
      ],
      "name": "like_post",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];