function getCookieJson(cookieName) {
  const name = cookieName + "=";
  const decodedCookies = decodeURIComponent(document.cookie);
  const cookieArray = decodedCookies.split(";");

  for (let i = 0; i < cookieArray.length; i++) {
    let cookie = cookieArray[i].trim();

    if (cookie.indexOf(name) === 0) {
      const jsonString = cookie.substring(name.length, cookie.length);
      const jsonData = JSON.parse(jsonString);
      return jsonData;
    }
  }

  return null;
}

function setCookieJson(cookieName, jsonData, expiredHours) {
  const jsonString = JSON.stringify(jsonData);
  const encodedJson = encodeURIComponent(jsonString);

  const date = new Date();
  date.setTime(date.getTime() + expiredHours * 60 * 60 * 1000);
  const expires = "expires=" + date.toUTCString();

  document.cookie = cookieName + "=" + encodedJson + ";" + expires + ";path=/";
}

function getZipCodeCategory(countryCode, zipCode) {
  const firstDigit = parseInt(zipCode.charAt(0), 10);

  if (firstDigit >= 90 && firstDigit <= 92) {
    return "1";
  } else if (firstDigit === 8 || firstDigit === 9) {
    return "2";
  } else if (firstDigit >= 5 && firstDigit <= 7) {
    return "3";
  } else {
    return "4";
  }
}

function getDeliveryTime(countryCode, zipcode, config) {
  if (countryCode != "US") {
    if (config.hasOwnProperty(countryCode)) {
      return config[`${countryCode}`];
    } else {
      return config["XXX"];
    }
  } else {
    const category = getZipCodeCategory(countryCode, zipcode);
    return config[`${countryCode}`][`${category}`];
  }
  return null;
}

async function getUserDeliveryLocation() {
  try {
    const cacheKey = "user-delivery-location-key";
    const location = getCookieJson(cacheKey);
    if (location) {
      return location;
    } else {
      const locResponse = await fetch(
        `https://service-e9wt99ba-1252698119.hk.tencentapigw.cn/release/get-location`
      );
      const json = await locResponse.json();
      const zipcode = json.zipcode;
      const city = json.city;
      console.log(`fetch zipcode=${zipcode} city=${city}`);
      setCookieJson(cacheKey, json, 12);
      return json;
    }
  } catch (error) {
    console.error("Error fetching IP or location data:", error);
    return null;
  }
}

function removeAfter(inputString, index) {
  const hyphenIndex = inputString.indexOf(index);

  if (hyphenIndex !== -1) {
    return inputString.slice(0, hyphenIndex);
  } else {
    return inputString;
  }
}

function removeBefore(inputString, index) {
  const hyphenIndex = inputString.indexOf(index);

  if (hyphenIndex !== -1) {
    return inputString.slice(hyphenIndex + 1);
  } else {
    return inputString;
  }
}

function loadUserDeliveryTime(country_options, params) {
  getUserDeliveryLocation().then((json) => {
    refreshView(country_options, params, json);
  });
}

function refreshView(country_options, params, json) {
  const countryCode = json.country_code2;
  const city = json.city;
  const zipcode = json.zipcode;
  console.log(`countryCode=${countryCode} zipcode=${zipcode} city=${city}`);
  const targetDeliveryTime = getDeliveryTime(countryCode, zipcode, params);

  const deliveryTimeContainer = document.getElementById("delivery_time_layout_id");
  const addressTextView = document.getElementById("address_text_id");
  const sureIcon = document.getElementById("sure_icon_id");
  const deliveryTimeView = document.getElementById("delivery_time_id");
  const deliveryTimePrefixView = document.getElementById("delivery_time_prefix_id");
  var countrySelect = document.getElementById("country-select");
  var country = "";
  for (let index = 0; index < country_options.option_country.length; index++) {
    const name = country_options.option_country[index];
    if (countrySelect && name.endsWith(countryCode)) {
      countrySelect.selectedIndex = index;
      country = name;
    }
  }
  if (params.hasOwnProperty(countryCode)) {
    deliveryTimePrefixView.textContent = params.prefix_title;

    if (zipcode && city) {
      addressTextView.textContent = `${removeAfter(zipcode, "-")}-${city}`;
    } else if (zipcode) {
      addressTextView.textContent = `${country}-${removeAfter(zipcode,"-")}`;
    } else if (city) {
      addressTextView.textContent = city;
    } else {
      addressTextView.textContent = country;
    }

    deliveryTimeView.textContent = `: ${targetDeliveryTime}`;
  } else {
    addressTextView.textContent = "";
    deliveryTimePrefixView.textContent = params.prefix_title_unknown;
    deliveryTimeView.textContent = params.XXX;
    // 显示选择框出来
    const deliveryTimeUpdateLayout = document.getElementById("delivery-time-update-container");
    const deliveryTimeExpeditedLayout = document.getElementById("delivery-time-expedited-container");
    if (deliveryTimeUpdateLayout) {
      deliveryTimeUpdateLayout.style.display = "flex";
    }
    if (deliveryTimeExpeditedLayout) {
      deliveryTimeExpeditedLayout.style.display = "flex";
    }
  }

  const clickFun = function () {
    const deliveryTimeUpdateLayout = document.getElementById("delivery-time-update-container");
    const deliveryTimeExpeditedLayout = document.getElementById("delivery-time-expedited-container");
    if (deliveryTimeUpdateLayout) {
      deliveryTimeUpdateLayout.style.display = "flex";
    }
    if (deliveryTimeExpeditedLayout) {
      deliveryTimeExpeditedLayout.style.display = "flex";
    }
  };
  addressTextView.addEventListener("click", clickFun);

  sureIcon.addEventListener("click",clickFun);
  
}


document.addEventListener("DOMContentLoaded", function () {
  const buttonElement = document.querySelector('button[id="button-body"]');
  document.getElementById('contact_us_id').addEventListener('click', function() {
  buttonElement?.click();
  console.log(buttonElement);
  });

  var countrySelect = document.getElementById("country-select");

  if (countrySelect) {
    countrySelect.addEventListener("change", onCountryChange);
  }

  var zipcodeInput = document.getElementById("zipcode-input");
  if (zipcodeInput) {
    zipcodeInput.addEventListener("input", onInputChange);
  }

});

function onClickUpdate(params) {
  console.log("onClickUpdate");
  const cacheKey = "user-delivery-location-key";
  var countrySelect = document.getElementById("country-select");
  var zipcodeInput = document.getElementById("zipcode-input");

  const json = JSON.parse(`{"country_code2":"${removeBefore(countrySelect.value," ")}", "zipcode":"${zipcodeInput.value}"}`);
  console.log("onClickUpdate:", json);
  setCookieJson(cacheKey, json, 12);
  refreshView(params, json);
}

function onInputChange(event) {
  var countrySelect = document.getElementById("country-select");
  var zipcodeInput = document.getElementById("zipcode-input");
  var updateButton = document.getElementById("update-button");
  if (countrySelect.value == "🇺🇸 US") {
    if (zipcodeInput.value) {
      updateButton.disabled = "";
    } else {
      updateButton.disabled = "disabled";
    }
  }
}

function onCountryChange(event) {
  console.log("Selected country:", event.target.value);
  var zipcodeInput = document.getElementById("zipcode-input");
  var updateButton = document.getElementById("update-button");

  zipcodeInput.value = "";
  if (event.target.value == "🇺🇸 US") {
    zipcodeInput.disabled = "";
    updateButton.disabled = "disabled";
  } else {
    updateButton.disabled = "";
    zipcodeInput.disabled = "disabled";
  }
}
