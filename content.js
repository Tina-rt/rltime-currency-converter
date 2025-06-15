// content.js

// setTimeout(() => {

// }, 1000);
var cur_type = {
  en: ['$', 'CA$', 'A$', '£', '¥', 'CN¥'],
  fr: ['€', 'CHF', 'kr', 'kr', 'kr', 'zł', 'Ft', 'Kč']
};
var converter = {};
fetch('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/mga.json').then(
  (data) => {
    // document.body.innerText = data;
    data.text().then((content) => {
      converter = JSON.parse(content)['mga'];
    });
  }
);
chrome.runtime.onMessage.addListener(async function (request, sender, sendResponse) {
  // Execute your function here based on the received data
  // convertWebPage(request.data);
  if (converter == {}) {
    await fetch(
      'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/mga.json'
    ).then((data) => {
      data.text().then((content) => {
        converter = JSON.parse(content)['mga'];
      });
    });
  }
  parseAmazonPrice();
  parseSheinPrice();
  sendResponse({ success: 'TRUE' });
  return true;
});

function convert(currency, value) {
  if (currency == '$') {
    return value / converter['usd'];
  } else if (currency == '€') {
    return value / converter['eur'];
  } else if (Object.keys(converter).indexOf(currency.toLowerCase())) {
    return value / converter[currency.toLowerCase()];
  }
}

function format_str_price(price) {
  try {
    let real_price = price.match(/\d+(?:,|\.|\s)\d*/g)[0];
    let formattedNumber = new Intl.NumberFormat('en', {
      style: 'currency',
      currency: 'MGA'
    }).format(real_price.replace(',', '.'));

    formattedNumber = formattedNumber.replace(',', '&nbsp;');
    formattedNumber = formattedNumber.toString().replace('MGA ', '');
    return formattedNumber;
  } catch {
    return price;
  }
}



function parseLocalizedNumber(str) {
  str = str.replace(/\s|&nbsp;/g, '');
  const hasComma = str.includes(',');
  const hasDot = str.includes('.');

  let locale = 'en';

  if (hasComma && hasDot) {
    const lastComma = str.lastIndexOf(',');
    const lastDot = str.lastIndexOf('.');

    locale = lastComma > lastDot ? 'fr' : 'en';
  } else if (hasComma && !hasDot) {
    locale = 'fr';
  }

  let normalized = str;

  if (locale === 'fr') {
    // In French: dot is thousand sep, comma is decimal
    normalized = str.replace(/\./g, '').replace(',', '.');
  } else {
    // In English: comma is thousand sep, dot is decimal
    normalized = str.replace(/,/g, '');
  }

  const parsed = parseFloat(normalized);
  return isNaN(parsed) ? null : parsed;
}

function parseAmazonPrice(target_) {
  // Parse in product detail page
  let all_price = document.getElementsByClassName('a-price');
  let price_fraction_val = 0;
  for (let index = 0; index < all_price.length; index++) {
    const element = all_price[index];
    console.log(element);
    let price_whole = element.querySelector(`span[class*="whole"]`);
    if (price_whole) {
      let price_value = price_whole.textContent;
      let price_symbol = element.querySelector('.a-price-symbol');
      const price_fraction = element.querySelector('.a-price-fraction');

      if (price_fraction && price_fraction.textContent) {
        price_fraction_val = price_fraction.textContent;
      }
      price_value = parseLocalizedNumber(price_value) + price_fraction_val / 100;
      let converted_price = convert(price_symbol.textContent, price_value);
      console.log(converted_price, price_symbol, price_fraction);
      let final_price_fraction =
        parseFloat((converted_price - parseInt(converted_price)).toFixed(2)) * 100;
      if (converted_price){

        price_whole.textContent = new Intl.NumberFormat('fr', {
          style: 'currency',
          currency: 'MGA'
        }).format(parseInt(converted_price));
      }
      if (price_fraction && final_price_fraction) {
        price_fraction.textContent = final_price_fraction.toFixed(0);
      }
      price_symbol.textContent = '';
    }
  }

  // parse in discover page
  let all_price_discover = document.querySelectorAll('.a-size-base.a-color-price');
  for (let index = 0; index < all_price_discover.length; index++) {
    const element = all_price_discover[index];
    const price_element = element.querySelector('span');
    if (price_element) {
      let price_value = price_element.textContent;
      let price_symbol_matches = price_value.match(/[$€£¥₹₽]|USD|EUR|US/gm);
      if (price_symbol_matches.length > 0) {
        price_symbol = price_symbol_matches[0];
      } else {
        break;
      }

      let price_number = price_value.match(/\d+(?:,|\.|\s)\d*/g)[0];
      console.log(parseLocalizedNumber(price_number), price_symbol);
      let converted_price = convert(price_symbol, parseLocalizedNumber(price_number));
      price_element.textContent = new Intl.NumberFormat('fr', {
        style: 'currency',
        currency: 'MGA'
      }).format(parseInt(converted_price));
    }
  }

  // Parse the lowest price shown
  let all_price_lowest = document.querySelectorAll(
    '.a-price.a-text-price span[aria-hidden="true"], .a-size-mini.a-color-tertiary.a-text-strike'
  );
  for (let index = 0; index < all_price_lowest.length; index++) {
    const element = all_price_lowest[index];
    let price_value = element.textContent.match(/\d+(?:,|\.|\s)\d*/g)[0];
    const price_symbol_matches = element.textContent.match(/[$€£¥₹₽]|USD|EUR|US/gm);
    if (price_symbol_matches && price_symbol_matches.length > 0) {
      price_symbol = price_symbol_matches[0];
    } else {
      break;
    }
    const price_value_float = parseLocalizedNumber(price_value);
    const converted_price = convert(price_symbol, price_value_float);
    console.log('Lowest price', converted_price, price_symbol, price_value_float);
    element.textContent = new Intl.NumberFormat('fr', {
      style: 'currency',
      currency: 'MGA'
    }).format(converted_price);
  }
}

function parseSheinPrice(){
  let all_price = document.querySelectorAll('.product-item__camecase-wrap span');
  for (let index = 0; index < all_price.length; index++) {
    const element = all_price[index];
    let price_value = element.textContent;
    let price_symbol_matches = price_value.match(/[$€£¥₹₽]|USD|EUR|US/gm);
    if (price_symbol_matches.length > 0) {
      price_symbol = price_symbol_matches[0];
    } else {
      break;
    }
    let price_number = price_value.match(/\d+(?:,|\.|\s)\d*/g)[0];
    console.log(parseLocalizedNumber(price_number), price_symbol);
    let converted_price = convert(price_symbol, parseLocalizedNumber(price_number));
    element.textContent = new Intl.NumberFormat('fr', {
      style: 'currency',
      currency: 'MGA'
    }).format(converted_price);
  }
}
