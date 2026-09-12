// Адреса контракту з консолі після деплою
const contract_address = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

let current_account;  // поточна адреса MetaMask
let web3;             // екземпляр Web3
let contract;         // екземпляр контракту
let listenersAttached = false;  // щоб не дублювати addEventListener


// Ініціалізація після побудови DOM
// https://developer.mozilla.org/en-US/docs/Web/API/Document/DOMContentLoaded_event
document.addEventListener("DOMContentLoaded", () => {
  const connection_btn = document.getElementById("connection_btn");
  if (connection_btn) {
    connection_btn.addEventListener("click", connectWallet);
  }

  // window.ethereum — injected provider MetaMask (EIP-1193)
  // https://docs.metamask.io/wallet/reference/provider-api/
  if (window.ethereum) {
    // https://docs.web3js.org/
    web3 = new Web3(window.ethereum);

    // Контракт за ABI та адресою
    // https://docs.web3js.org/libdocs/Contract
    contract = new web3.eth.Contract(abi, contract_address);

    // Підписка на зміну акаунта в гаманці
    // https://docs.metamask.io/metamask-connect/evm/reference/provider-api#accountschanged
    window.ethereum.on("accountsChanged", (accounts) => {
      if (!accounts || accounts.length === 0) {
        alert("Акаунти не знайдено");
        return;
      }
      current_account = accounts[0];
      enterToDapp();
    });
  } else {
    alert("Установіть MetaMask або інший Web3-провайдер");
  }
});


// Запит доступу до акаунтів
// https://docs.metamask.io/metamask-connect/evm/reference/json-rpc-api/eth_requestAccounts/
const connectWallet = async (e) => {
  if (!window.ethereum) {
    alert("Установіть MetaMask або інший Web3-провайдер");
    return;
  }

  try {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    if (!accounts || !Array.isArray(accounts) || accounts.length === 0) {
      alert("Акаунти не знайдено");
      return;
    }

    current_account = accounts[0];
    enterToDapp();
    if (e && e.target) e.target.style.display = "none";
  } catch (error) {
    alert("Помилка підключення. Див. консоль.");
    console.error("Connect error:", error);
  }
};


// Скорочення адреси: 0x1234...abcd
const shortAddress = (addr) => {
  if (!addr) return "";
  return addr.slice(0, 6) + "..." + addr.slice(-4);
};


// UI після auth + одноразове навішування listeners
const enterToDapp = () => {
  const account_lbl = document.getElementById("account_lbl");
  if (account_lbl) {
    account_lbl.textContent = shortAddress(current_account);
    account_lbl.title = current_account;  // повна адреса при наведенні
    account_lbl.classList.add("visible");
  }

  const dapp = document.getElementById("dapp");
  if (dapp) dapp.classList.remove("hidden");

  // Захист від дублювання addEventListener при accountsChanged
  // https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
  if (!listenersAttached) {
    const makePost_btn = document.getElementById("makePost_btn");
    const search_btn = document.getElementById("search_btn");
    const refresh_btn = document.getElementById("refresh_btn");

    if (makePost_btn) makePost_btn.addEventListener("click", makePost);
    if (search_btn) search_btn.addEventListener("click", searchPost);
    if (refresh_btn) refresh_btn.addEventListener("click", loadPosts);

    listenersAttached = true;
  }

  loadPosts();
};


// Unix timestamp (сек) -> локальний час
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleString
const formatTimestamp = (ts) => {
  const date = new Date(Number(ts) * 1000);
  return date.toLocaleString("uk-UA", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

// Захист від XSS: текст як textContent, не як HTML
// https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent
const escapeHtml = (text) => {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
};


// Рендер картки; web3 може повертати як масив, так і об’єкт залежно від ABI
const renderPost = (post, id) => {
  const author = post.author || post[1];
  const content = post.content || post[0];
  const timestamp = post.timestamp || post[2];
  const likes = post.like !== undefined ? post.like : post[3];

  return `
    <div class="post">
      <div class="post-header">
        <span class="post-id">#${id}</span>
      </div>
      <div class="post-content">${escapeHtml(content)}</div>
      <div class="post-meta">
        <span title="${author}">${shortAddress(author)}</span>
        <span>${formatTimestamp(timestamp)}</span>
        <button class="btn-like" data-id="${id}" title="Вподобати">
          ❤ ${likes}
        </button>
      </div>
    </div>
  `;
};

// Делегування click на динамічно створені .btn-like
const attachLikeButtons = () => {
  document.querySelectorAll(".btn-like").forEach((btn) => {
    btn.addEventListener("click", () => likePost(btn.dataset.id));
  });
};


// eth_call: get_posts()
const loadPosts = async () => {
  const list = document.getElementById("posts_list");
  if (!list) return;

  list.innerHTML = `<p class="loading">Завантаження постів...</p>`;

  try {
    const posts = await contract.methods.get_posts().call();

    if (!posts || posts.length === 0) {
      list.innerHTML = `<p class="empty">Постів ще немає. Будьте першим!</p>`;
      return;
    }

    // Новіші зверху
    const reversed = [...posts].map((p, i) => ({ post: p, id: i })).reverse();
    list.innerHTML = reversed.map(({ post, id }) => renderPost(post, id)).join("");
    attachLikeButtons();  // тільки після вставки HTML
  } catch (error) {
    console.error("Load posts error:", error);
    list.innerHTML = `<p class="error">Не вдалося завантажити пости. 
    Перевірте мережу та адресу контракту</p>`;
  }
};

// eth_sendTransaction: create_post(string)
// gas — штучно завищений ліміт для тестової мережі Hardhat,
// щоб уникнути помилок при виконанні транзакції
// https://docs.web3js.org/guides/migration_ethers/#sending-transactions
const makePost = async () => {
  const textarea = document.getElementById("post_content");
  const btn = document.getElementById("makePost_btn");
  if (!textarea) return;

  const postText = textarea.value.trim();
  if (!postText) {
    alert("Напишіть текст поста!");
    return;
  }

  try {
    if (btn) {
      btn.disabled = true;
      btn.textContent = "Публікація...";
    }

    await contract.methods.create_post(postText).send({
      from: current_account,
      gas: 500000,
    });

    textarea.value = "";
    await loadPosts();
  } catch (error) {
    console.error("Post creation error:", error);
    alert("Помилка: " + (error.message || error));
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = "Опублікувати";
    }
  }
};


// eth_call: get_post(uint256)
const searchPost = async () => {
  const input = document.getElementById("search_id");
  const result = document.getElementById("search_result");
  if (!input || !result) return;

  const id = input.value.trim();
  if (id === "" || isNaN(Number(id)) || Number(id) < 0) {
    result.innerHTML = `<p class="error">Введіть коректний ID (невід'ємне число)</p>`;
    return;
  }

  result.innerHTML = `<p class="loading">Пошук...</p>`;

  try {
    const post = await contract.methods.get_post(id).call();
    result.innerHTML = renderPost(post, id);
    attachLikeButtons();
  } catch (error) {
    console.error("Search error:", error);
    result.innerHTML = `<p class="error">Пост #${id} не знайдено</p>`;
  }
};


// eth_sendTransaction: like_post(uint256)
const likePost = async (id) => {
  if (!current_account) {
    alert("Спочатку підключіть гаманець!");
    return;
  }

  try {
    await contract.methods.like_post(id).send({
      from: current_account,
      gas: 300000,
    });
    await loadPosts();

    // Оновити картку в блоці пошуку, якщо шукали цей ID
    const searchInput = document.getElementById("search_id");
    if (searchInput && searchInput.value.trim() === String(id)) {
      const post = await contract.methods.get_post(id).call();
      const result = document.getElementById("search_result");
      if (result) {
        result.innerHTML = renderPost(post, id);
        attachLikeButtons();
      }
    }
  } catch (error) {
    console.error("Like error:", error);
    const msg = error.message || String(error);
    if (msg.includes("Уже вподобано") || msg.includes("Already liked")) {
      alert("Ви вже вподобали цей пост!");
    } else {
      alert("Помилка вподобайки: " + msg);
    }
  }
};