// popup.js
document.getElementById("convert").addEventListener("click", function () {
  console.log("Reach");
  chrome.runtime.sendMessage({ data: "yourData" }, function (response) {
    console.log(response);
  });
});
var data_curr;
var rate_input = document.getElementById("rate-input");
var result = document.getElementById("converted-amount");
var from_cur = document.getElementById("from_cur");
var to_cur = document.getElementById("to_cur");
_init();
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

from_cur.addEventListener("change", async () => {
  await fetch_data(from_cur.value);
  convert_currencies();
});

to_cur.addEventListener("change", () => {
  convert_currencies();
});

rate_input.addEventListener("keyup", () => {
  convert_currencies();
});
