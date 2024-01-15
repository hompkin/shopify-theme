async function getUserZipCode() {
    try {
      const ipResponse = await fetch('https://api64.ipify.org?format=json');
      const ipData = await ipResponse.json();
      const ip = ipData.ip;
      const apiKey='8f6e7f9fc6a04c8c86c257a7e1b913cd'
      const cachedIp = localStorage.getItem('user_ip');
      const state_prov = localStorage.getItem('state_prov');
      if (false && cachedIp === ip && state_prov) {
        console.log(`use local cache. cachedIp=${cachedIp} state_prov=${state_prov}`)
        return state_prov;
      } else {
        localStorage.setItem('user_ip', ip);
        const locationResponse = await fetch(`https://api.ipgeolocation.io/ipgeo?apiKey=${apiKey}&ip=${ip}`);
        const locationData = await locationResponse.json();
        const state_prov = locationData.state_prov;
        localStorage.setItem('state_prov', state_prov);
        return state_prov;
      }

    } catch (error) {
      console.error('Error fetching IP or location data:', error);
      return null;
    }
}

// 获取ip地址对应的邮编
getUserZipCode().then(state_prov => {
  if (state_prov) {
    console.log(`The state_prov for the user's IP is ${state_prov}`);
  } else {
    console.log('Unable to determine state_prov');
  }
});