// popup.js
document.getElementById("convert").addEventListener("click", function () {
  // console.log("Reach");
  chrome.runtime.sendMessage({ data: "yourData" }, function (response) {
    console.log(response);
  });
});

var btn_convert = document.getElementById('convert');
var data_curr;
var rate_input = document.getElementById("rate-input");
var result = document.getElementById("converted-amount");
var from_cur = document.getElementById("from_cur");
var to_cur = document.getElementById("to_cur");

var rate_one_html = document.getElementById("rate-1");
var rate_two_html = document.getElementById("rate-2");

_init();

chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  const currentUrl = tabs[0].url;
  const isAmazon = currentUrl.includes("amazon") || currentUrl.includes("www.shein");
  if (!isAmazon){
    btn_convert.classList.add("disabled");
    btn_convert.style.cursor = "not-allowed";
    const error = document.getElementById('error');
    error.textContent = 'This extension only works on Amazon.';
  }
});

function format_curr(value, to_cur) {
  return new Intl.NumberFormat("fr", {
    style: "currency",
    currency: to_cur,
  }).format(value);
}

function _init() {
  fetch_data(from_cur.value);
  result.innerText = format_curr(0, to_cur.value);
}

async function fetch_data(from_cur) {
  let response = await fetch(
    `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${from_cur.toLowerCase()}.json`
  );
  let temp_data = await response.json();
  data_curr = temp_data[from_cur.toLowerCase()];
}

function convert_currencies() {
  console.log(data_curr);
  let result_temp = (
    +rate_input.value * data_curr[to_cur.value.toLowerCase()]
  ).toFixed(2);

  result.innerText = new Intl.NumberFormat("fr", {
    style: "currency",
    currency: to_cur.value,
  }).format(result_temp);
}

async function update_rate_display() {
  console.log(data_curr);
  if (!data_curr) {
    await fetch_data(from_cur.value);
  };
  rate_one_html.innerText = `1 ${from_cur.value} = ${data_curr[to_cur.value.toLowerCase()].toFixed(2)} ${to_cur.value}`;
  rate_two_html.innerText = `1 ${to_cur.value} = ${(1/data_curr[to_cur.value.toLowerCase()]).toFixed(2)} ${from_cur.value}`;
}

update_rate_display();

from_cur.addEventListener("change", async () => {
  await fetch_data(from_cur.value);
  convert_currencies();
  update_rate_display();
});

to_cur.addEventListener("change", () => {
  convert_currencies();
  update_rate_display();
});

rate_input.addEventListener("keyup", () => {
  convert_currencies();
});


