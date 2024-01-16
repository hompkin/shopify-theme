function getCookieJson(cookieName) {
  const name = cookieName + "=";
  const decodedCookies = decodeURIComponent(document.cookie);
  const cookieArray = decodedCookies.split(';');

  for (let i = 0; i< cookieArray.length; i++) {
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
  date.setTime(date.getTime() + (expiredHours * 60 * 60 * 1000));
  const expires = "expires=" + date.toUTCString();

  document.cookie = cookieName + "=" + encodedJson + ";" + expires + ";path=/";
}



function getZipCodeCategory(countryCode, zipCode) {
  if (countryCode != "US") {
    return null;
  }
  const firstDigit = parseInt(zipCode.charAt(0), 10);

  if (firstDigit >= 90 && firstDigit <= 92) {
    return 1;
  } else if (firstDigit === 8 || firstDigit === 9) {
    return 2;
  } else if (firstDigit >= 5 && firstDigit <= 7) {
    return 3;
  } else {
    return 4;
  }
}

function getDeliveryTime(countryCode, category) {
  return "";
}

async function getUserDeliveryLocation() {
  try {
    const ipResponse = await fetch(
      "https://api.ipgeolocation.io/getip?format=json"
    );
    const ipData = await ipResponse.json();
    const ip = ipData.ip;
    const cacheKey = "user-delivery-location-key";
    console.log(`fetch ip=${ip}`);
    const location = getCookieJson(cacheKey);
    if (location) {
      return location;
    } else {
      const locResponse = await fetch(
        `https://service-e9wt99ba-1252698119.hk.tencentapigw.cn/release/get-location?user_ip=${ip}`
      );
      const json = await locResponse.json();
      const zipcode = json.zipcode;
      const city = json.city;
      console.log(`ip=${ip}, zipcode=${zipcode} city=${city}`);
      setCookieJson(cacheKey, json, 12);
      return json;
    }
  } catch (error) {
    console.error("Error fetching IP or location data:", error);
    return null;
  }
}

function removeHyphenAndNumbersAfter(inputString) {
  const hyphenIndex = inputString.indexOf("-");

  if (hyphenIndex !== -1) {
    return inputString.slice(0, hyphenIndex);
  } else {
    return inputString;
  }
}

function loadUserDeliveryTime(params) {
  console.log(`fetch ip=${params}`);
  getUserDeliveryLocation().then((json) => {
    const countryCode = json.country_code2;
    const city = json.city;
    const zipcode = json.zipcode;
    const category = getZipCodeCategory(countryCode, zipcode);
    const targetDeliveryTime = getDeliveryTime(countryCode, category);
  
    const deliveryTimeLayout = document.getElementById("delivery_time_layout_id");
    const addressTextView = document.getElementById("address_text_id");
    const deliveryTimeView = document.getElementById("delivery_time_id");
    const deliveryTimePrefixView = document.getElementById("delivery_time_prefix_id");
    deliveryTimeLayout.style.display = "flex";
  
    if (json) {
      deliveryTimePrefixView.textContent = "Delivered to";
      if (zipcode) {
        addressTextView.textContent = `${removeHyphenAndNumbersAfter(zipcode)}-${city}`;
      } else {
        addressTextView.textContent = city;
      }
  
      deliveryTimeView.textContent = `: ${targetDeliveryTime}`;
    } else {
      addressTextView.textContent = "";
      deliveryTimePrefixView.textContent = "Delivery time is";
      deliveryTimeView.textContent = " 4-6 weeks";
    }
  });
}
