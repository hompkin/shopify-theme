function getCookie(name) {
    const value = '; ' + document.cookie;
    const parts = value.split('; ' + name + '=');
    if (parts.length === 2) return parts.pop().split(';').shift();
  }

function setCookie(name, value, hours) {
  const date = new Date();
  date.setTime(date.getTime() + (hours * 60 * 60 * 1000));
  const expires = '; expires=' + date.toUTCString();
  document.cookie = name + '=' + value + expires + '; path=/';
}

async function getUserZipCode() {
    try {
      const ipResponse = await fetch('https://api64.ipify.org?format=json');
      const ipData = await ipResponse.json();
      const ip = ipData.ip;
      const cachedZip = getCookie('state_prov');

      if (false && cachedZip) {
        return cachedZip;
      } else {
        const locResponse = await fetch(`https://service-e9wt99ba-1252698119.hk.tencentapigw.cn/release/get-location?user_ip=${ip}`);
        const json = await locResponse.json();
        const state_prov=json.state_prov;
        console.log(`ip=${ip}, state_prov=${state_prov} json=${json}`);
        setCookie('state_prov', state_prov, 1); // 缓存邮编 1 天
        return state_prov;
      }

    } catch (error) {
      console.error('Error fetching IP or location data:', error);
      return null;
    }
}

  // getUserZipCode().then(zipcode => {
  //   const placeholder = document.getElementById('zipcode-placeholder');
  //   if (zipcode) {
  //     placeholder.textContent = `The zipcode for the user's IP is ${zipcode}`;
  //   } else {
  //     placeholder.textContent = 'Unable to determine zipcode';
  //   }
  // });