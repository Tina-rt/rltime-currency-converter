// content.js

// setTimeout(() => {

// }, 1000);
var cur_type = {
  en: ["$", "CA$", "A$", "£", "¥", "CN¥"],
  fr: ["€", "CHF", "kr", "kr", "kr", "zł", "Ft", "Kč"],
};
chrome.runtime.onMessage.addListener(async function (
  request,
  sender,
  sendResponse
) {
  // Execute your function here based on the received data
  convertWebPage(request.data);
  parseAmazonPrice();
  sendResponse({ success: "TRUE" });
  return true;
});
var converter = {};
fetch(
  "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/mga.json"
).then((data) => {
  // document.body.innerText = data;
  data.text().then((content) => {
    converter = JSON.parse(content)["mga"];
  });
});
function convert(currency, value) {
  if (currency == "$") {
    return value / converter["usd"];
  } else if (currency == "€") {
    return value / converter["eur"];
  } else if (Object.keys(converter).indexOf(currency.toLowerCase())) {
    return value / converter[currency.toLowerCase()];
  }
}

function format_str_price(price) {
  try {
    let real_price = price.match(/\d+(?:,|\.|\s)\d*/g)[0];
    let formattedNumber = new Intl.NumberFormat("en", {
      style: "currency",
      currency: "MGA",
    }).format(real_price.replace(",", "."));

    formattedNumber = formattedNumber.replace(",", "&nbsp;");
    formattedNumber = formattedNumber.toString().replace("MGA ", "");
    return formattedNumber;
  } catch {
    return price;
  }
}

async function convertWebPage(data_) {
  let pattern_price =
    /(?:[€$](?:\s|&nbsp;)??\d+[,.\s]?\d+)|(?:\d+(?:[.,\s]?\d+)?(?:\s|&nbsp;)?[€$])/gm;

  let html = document.body.innerHTML;
  console.log(html.match(/\&nbsp;/g));
  html = html.replace(/&nbsp;/g, "");
  let start = Date.now();
  // let data = html.match(
  //   /(?:(?:[$€£¥₹₽]+|USD|EUR|US|MGA)(?:\s{0,1}|&nbsp;)(?:\d{1,3}(?:(?:\s|,|\.|&nbsp;)?\d{1,3})*))|(?:(?:\d{1,3}(?:(?:\s|,|\.|&nbsp;)?\d{1,3})*)(?:\s{0,1}|&nbsp;)(?:[$€£¥₹₽]+|USD|EUR|US|MGA))/gm
  // );
  let data = html.match(pattern_price);
  let final_data;
  // console.log(document.body.innerHTML);
  if (data) {
    final_data = document.body.innerHTML;
    data.forEach((value) => {
      const pattern_number = /(?:\d{1,3}(?:[\s|,|.]?\d{1,3})*)/gm;
      const currency = value.match(/[$€£¥₹₽]|USD|EUR|US/gm)[0];

      const regex = new RegExp(pattern_number);
      if (regex.test(value)) {
        let number = value.match(regex)[0];
        if (cur_type.fr.indexOf(currency) >= 0) {
          number = number.replace(",", ".").replace(" ", "");
        } else if (cur_type.en.indexOf(currency) >= 0) {
          // console.log("Tonga");
          number = number.replace(",", "");
        }

        let result = convert(currency, parseFloat(number));
        // result = result.toFixed(2);
        result = new Intl.NumberFormat("fr", {
          style: "currency",
          currency: "MGA",
        }).format(result);

        final_data = final_data
          .replace(value, result)
          .replace(format_str_price(value), result);
      }
      console.log(format_str_price(value));
    });

    document.body.innerHTML = final_data;
  }
}

function parseAmazonPrice(target_) {
  let all_price = document.getElementsByClassName("a-price");
  for (let index = 0; index < all_price.length; index++) {
    const element = all_price[index];
    console.log(element);
    let price_whole = element.querySelector(".a-price-whole");
    if (price_whole) {
      let price_value = price_whole.textContent;
      let price_symbol = element.querySelector(".a-price-symbol");
      let price_fraction = element.querySelector(".a-price-fraction");
      price_value =
        parseInt(price_value) + parseInt(price_fraction.textContent) / 100;
      let converted_price = convert(price_symbol.textContent, price_value);
      let final_price_fraction =
        parseFloat((converted_price - parseInt(converted_price)).toFixed(2)) *
        100;
      price_whole.textContent = new Intl.NumberFormat("fr", {
        style: "currency",
        currency: "MGA",
      }).format(parseInt(converted_price));
      price_fraction.textContent = final_price_fraction;
      price_symbol.textContent = "";
    }
  }
}
