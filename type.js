// Make sure you are running Node v18+ (or v22 like you are)
const url = "https://phonevalidation.abstractapi.com/v1/?api_key=fcea56060843447f9c6b501329f82179&phone=18573096996";

const carriers = [{
  "name": "alaska",
  "carrier": "Alaska",
  "sms": "sms.alaska-wireless.com",
  "mms": "msg.acsalaska.net"
}, {
  "name": "alltel",
  "carrier": "Alltel Wireless",
  "sms": "message.alltel.com",
  "mms": "mms.alltelwireless.com"
}, {
  "name": "att",
  "carrier": "AT&T Mobility",
  "sms": "txt.att.net",
  "mms": "mms.att.net"
}, {
  "name": "boost",
  "carrier": "Boost Mobile",
  "sms": "myboostmobile.com",
  "mms": "myboostmobile.com"
}, {
  "name": "cinglular",
  "carrier": "Cingular",
  "sms": "txt.att.net",
  "mms": "mms.att.net"
}, {
  "name": "cleartalk",
  "carrier": "Cleartalk",
  "sms": "sms.cleartalk.us"
}, {
  "name": "cricket",
  "carrier": "Cricket Wireless",
  "mms": "mms.cricketwireless.net"
}, {
  "name": "cspire",
  "carrier": "C Spire Wireless",
  "sms": "cspire1.com"
}, {
  "name": "metropcs",
  "carrier": "T-Mobile_MetroPCS",
  "sms": "tmomail.net",
  "mms": "tmomail.net"
}, {
  "name": "nextel",
  "carrier": "Sprint Nextel",
  "sms": "messaging.nextel.com"
}, {
  "name": "pageplus",
  "carrier": "Page Plus",
  "sms": "vtext.com",
  "mms": "vzwpix.com"
}, {
  "name": "projectfi",
  "carrier": "Google Project Fi",
  "sms": "msg.fi.google.com"
}, {
  "name": "republic",
  "carrier": "Republic Wireless",
  "sms": "text.republicwireless.com"
}, {
  "name": "sprint",
  "carrier": "Sprint",
  "sms": "messaging.sprintpcs.com",
  "mms": "pm.sprint.com"
}, {
  "name": "straighttalk",
  "carrier": "Straight Talk",
  "sms": "txt.att.net",
  "mms": "mms.att.net"
}, {
  "name": "ting",
  "carrier": "Ting",
  "sms": "message.ting.com"
}, {
  "name": "tmobile",
  "carrier": "T-Mobile",
  "sms": "tmomail.net",
  "mms": "tmomail.net"
}, {
  "name": "tracfone",
  "carrier": "Tracfone",
  "sms": "mmst5.tracfone.com",
  "mms": "mmst5.tracfone.com"
}, {
  "name": "uscellular",
  "carrier": "US Cellular",
  "sms": "email.uscc.net",
  "mms": "mms.uscc.net"
}, {
  "name": "verizon",
  "carrier": "Verizon Wireless",
  "sms": "vtext.com",
  "mms": "vzwpix.com"
}, {
  "name": "viaero",
  "carrier": "Viaero Wireless",
  "sms": "viaerosms.com",
  "mms": "mmsviaero.com"
}, {
  "name": "virgin",
  "carrier": "Virgin Mobile",
  "sms": "vmobl.com",
  "mms": "vmpix.com"
}];

/**
 * Find the SMS domain for a given carrier string (from API).
 * Matches on name, carrier, or substring (fuzzy).
 */
function getSmsDomainByCarrier(input) {
  if (!input) return null;
  const normalized = input.toLowerCase();

  // Exact match on name or carrier
  let carrier = carriers.find(c =>
    c.name.toLowerCase() === normalized ||
    (c.carrier && c.carrier.toLowerCase() === normalized)
  );
  if (carrier) return carrier.sms;

  // Fuzzy match (substring search)
  carrier = carriers.find(c =>
    (c.name && normalized.includes(c.name.toLowerCase())) ||
    (c.carrier && normalized.includes(c.carrier.toLowerCase().split(" ")[0])) // match first word
  );
  return carrier ? carrier.sms : null;
}

async function getPhoneData(url) {
  try {
    const response = await fetch(url);
    const data = await response.json();

    console.log(data);
    console.log("Carrier:", data.carrier);
    console.log("Line type:", data.type);

    // Get SMS domain using smart lookup
    const smsDomain = getSmsDomainByCarrier(data.carrier);
    console.log("SMS domain:", smsDomain);

  } catch (err) {
    console.error("Error fetching phone data:", err);
  }
}

// Run the test
getPhoneData(url);

module.exports = carriers;
