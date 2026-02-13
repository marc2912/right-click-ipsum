// Fake data generators for smart field suggestions
// Uses window.__rci namespace (content scripts can't use ES modules)
(function () {
  const firstNames = [
    "Jane", "Marcus", "Priya", "Liam", "Sofia", "Kenji",
    "Amara", "Diego", "Mei", "Oliver", "Fatima", "Noah",
  ];

  const lastNames = [
    "Smith", "Patel", "Nakamura", "Garcia", "Chen", "Williams",
    "Kim", "Andersen", "Okafor", "Martinez", "Johansson", "Ali",
  ];

  const cities = [
    "Springfield", "Portland", "Madison", "Riverside",
    "Fairview", "Georgetown", "Arlington", "Lakewood",
  ];

  const states = [
    "CA", "NY", "TX", "FL", "IL", "PA", "OH", "GA", "WA", "CO",
  ];

  const streets = [
    "Main St", "Oak Ave", "Maple Dr", "Cedar Ln",
    "Park Blvd", "Elm St", "Washington Ave", "Lake Rd",
  ];

  const units = [
    "Apt 4B", "Suite 200", "Unit 12", "Floor 3", "#301", "Apt 7",
  ];

  const companies = [
    "Velora Systems", "Crestpoint Digital", "Nimbus & Hart", "Oxbow Industries",
    "Pinecrest Labs", "Quartex Solutions", "Brightfield Analytics", "Sablerock Engineering",
    "Dawnline Creative", "Ferrocast Manufacturing", "Kitebridge Consulting", "Lumara Health",
    "Thornwell Capital", "Peregrine Dynamics", "Cobalt Fern Studio", "Ridgewater Technologies",
    "Arcloom Software", "Brassworth Holdings", "Sunvale Robotics", "Glenhaven Partners",
    "Tidesmith Media", "Voltera Group", "Ironpeak Logistics", "Crestwave Audio",
    "Plumstead Ventures", "Oakmere Financial", "Skyward Provisions", "Netherwood Research",
    "Copperline Design", "Starboard Freight", "Maplecroft Security", "Fathom Data",
    "Greenspire Energy", "Holloway Biotech", "Caliber Point AI", "Duskfall Interactive",
    "Rivervane Publishing", "Stonelathe Collective", "Quilmere Architects", "Aethon Cloud",
    "Pinwheel Brands", "Cruxpoint Advisors", "Brindlewood Farms", "Zephyra Networks",
    "Goldmark Insurance", "Wickham Aerospace", "Trelliswork HR", "Cedarbloom Wellness",
    "Voltbridge Electric", "Harmon & Slate", "Foxglove Retail", "Deepwell Mining",
    "Suncross Payments", "Northspire Legal", "Brasswick Motors", "Tanglewood Games",
    "Heatherstone Realty", "Skyfen Optics", "Larkspur Marine", "Clearpath Fiber",
    "Pendleton & Gray", "Rimrock Materials", "Blueshore Packaging", "Stratton Vale Foods",
    "Cindervault Storage", "Mossgate Education", "Ironhaven Defense", "Whitmore Signal",
    "Driftstone Supply", "Falconer Digital", "Junipera Cosmetics", "Blackwell Precision",
    "Pinehurst Textiles", "Daymark Navigation", "Thornbury Pharma", "Galecrest Wind",
    "Copperfield Apparel", "Silverlake Transit", "Cairnbrook Safety", "Ridgepoint Crypto",
    "Ambervale Agriculture", "Steelcross Aviation", "Maplethorn Furniture", "Glenwick Telecom",
    "Seacliff Hospitality", "Ironbark Construction", "Dewpoint Climate", "Flintshire Composites",
    "Starling & Finch", "Crestholm Sports", "Bramblegate Events", "Wildshore Aquaculture",
    "Ashford Instruments", "Pinnacle Loom", "Quarryfield Cement", "Sablewood Interiors",
    "Windmark Drones", "Hearthstone Staffing", "Bayline Sensors", "Thorngate Distilling",
  ];

  const countries = [
    "United States", "Canada", "United Kingdom", "Australia",
  ];

  let emailDomain = "example.com";

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function randomDigits(n) {
    let s = "";
    for (let i = 0; i < n; i++) s += Math.floor(Math.random() * 10);
    return s;
  }

  const generators = {
    firstName: () => pick(firstNames),
    lastName: () => pick(lastNames),
    fullName: () => pick(firstNames) + " " + pick(lastNames),
    email: () => {
      const first = pick(firstNames).toLowerCase();
      const last = pick(lastNames).toLowerCase();
      return first + "." + last + "@" + emailDomain;
    },
    company: () => pick(companies),
    phone: () => "(555) 555-" + randomDigits(4),
    url: () => "https://www.example.com",
    address1: () => randomDigits(3) + " " + pick(streets),
    address2: () => pick(units),
    city: () => pick(cities),
    state: () => pick(states),
    zip: () => randomDigits(5),
    country: () => pick(countries),
    creditCard: () => "4242 4242 4242 4242",
    cvv: () => randomDigits(3),
    expiration: () => {
      const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, "0");
      const year = new Date().getFullYear() + Math.floor(Math.random() * 5) + 1;
      return month + "/" + String(year).slice(-2);
    },
  };

  function generateIdentity() {
    const first = pick(firstNames);
    const last = pick(lastNames);
    const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, "0");
    const year = new Date().getFullYear() + Math.floor(Math.random() * 5) + 1;
    return {
      firstName: first,
      lastName: last,
      fullName: first + " " + last,
      email: first.toLowerCase() + "." + last.toLowerCase() + "@" + emailDomain,
      company: pick(companies),
      phone: "(555) 555-" + randomDigits(4),
      url: "https://www.example.com",
      address1: randomDigits(3) + " " + pick(streets),
      address2: pick(units),
      city: pick(cities),
      state: pick(states),
      zip: randomDigits(5),
      country: "United States",
      creditCard: "4242 4242 4242 4242",
      cvv: randomDigits(3),
      expiration: month + "/" + String(year).slice(-2),
    };
  }

  const labels = {
    firstName: "First Name",
    lastName: "Last Name",
    fullName: "Full Name",
    email: "Email",
    company: "Company",
    phone: "Phone",
    url: "URL",
    address1: "Address",
    address2: "Address Line 2",
    city: "City",
    state: "State",
    zip: "Zip Code",
    country: "Country",
    creditCard: "Card Number",
    cvv: "CVV",
    expiration: "Expiration",
  };

  function setEmailDomain(domain) {
    emailDomain = domain || "example.com";
  }

  window.__rci = window.__rci || {};
  window.__rci.fakedata = { generators, labels, generateIdentity, setEmailDomain };
})();
