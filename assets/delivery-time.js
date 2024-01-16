function getCookie(name) {
  const value = "; " + document.cookie;
  const parts = value.split("; " + name + "=");
  if (parts.length === 2) return parts.pop().split(";").shift();
}

function setCookie(name, value, hours) {
  const date = new Date();
  date.setTime(date.getTime() + hours * 60 * 60 * 1000);
  const expires = "; expires=" + date.toUTCString();
  document.cookie = name + "=" + value + expires + "; path=/";
}

async function getUserZipCode() {
  try {
    const ipResponse = await fetch(
      "https://api.ipgeolocation.io/getip?format=json"
    );
    const ipData = await ipResponse.json();
    const ip = ipData.ip;
    console.log(`fetch ip=${ip}`);
    const cachedZip = getCookie("zipcode-city");
    // debug
    if (false && cachedZip) {
      return cachedZip;
    } else {
      const locResponse = await fetch(
        `https://service-e9wt99ba-1252698119.hk.tencentapigw.cn/release/get-location?user_ip=${ip}`
      );
      const json = await locResponse.json();
      const zipcode = json.zipcode;
      const city = json.city;
      console.log(`ip=${ip}, zipcode=${zipcode} city=${city}`);
      const result = zipcode + city;
      setCookie("zipcode-city", result, 12);
      return result;
    }
  } catch (error) {
    console.error("Error fetching IP or location data:", error);
    return null;
  }
}

getUserZipCode().then((result) => {
  const addressText = document.getElementById("address_text_id");
  const deliveryTime = document.getElementById("delivery_time_id");
  const deliveryTimePrefix = document.getElementById("delivery_time_prefix_id");
  
  if (result) {
    deliveryTimePrefix.textContent = "Delivered to ";
    addressText.textContent = result;
    deliveryTime.textContent = "4-6 weeks"
  } else {
    addressText.textContent = "";
    if (deliveryTimePrefix) {
      deliveryTimePrefix.textContent = "Delivery time is ";
      deliveryTime.textContent = "4-6 weeks"
    }
  }
});
