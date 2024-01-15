async function getUserZipCode() {
  try {
    const ipResponse = await fetch('https://api.ipify.org?format=json');
    const ipData = await ipResponse.json();
    const ip = ipData.ip;

    const locationResponse = await fetch(`https://ipapi.co/${ip}/json/`);
    const locationData = await locationResponse.json();
    const zipcode = locationData.postal;

    return zipcode;
  } catch (error) {
    console.error('Error fetching IP or location data:', error);
    return null;
  }
}

// 获取ip地址对应的邮编
getUserZipCode().then(zipcode => {
  if (zipcode) {
    console.log(`The zipcode for the user's IP is ${zipcode}`);
  } else {
    console.log('Unable to determine zipcode');
  }
});