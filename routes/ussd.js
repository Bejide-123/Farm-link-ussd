// import express from "express";
// const router = express.Router();



// router.post("/", (req, res) => {
//   const { text, phoneNumber, sessionId, serviceCode } = req.body;

//   console.log("📞 Incoming USSD Request:");
//   console.log("Phone:", phoneNumber);
//   console.log("Text:", text);
//   console.log("Session:", sessionId);
//   console.log("Service Code:", serviceCode);

//   let response = "";

//   if (text === "") {
//     response = "CON Welcome to FarmLink!\n1. Register\n2. View Markets";
//   } else if (text === "1") {
//     response = "CON Enter your name:";
//   } else if (text.startsWith("1*")) {
//     const name = text.split("*")[1];
//     response = `END Thank you ${name}, registration successful!`;
//   } else if (text === "2") {
//     response = "END Market prices coming soon!";
//   } else {
//     response = "END Invalid choice.";
//   }

//   res.set("Content-Type", "text/plain");
//   res.send(response);
// });

// export default router;


import express from "express";
const router = express.Router();

// Temporary in-memory storage for demo
const crops = [];
const farmers = {};
const buyers = {};
const userSessions = {}; // Track user role in current session

router.post("/", (req, res) => {
  const { text, phoneNumber, sessionId, serviceCode } = req.body;

  console.log("📞 Incoming USSD Request:");
  console.log("Phone:", phoneNumber);
  console.log("Text:", text);
  console.log("Session:", sessionId);

  let response = "";

  // === INITIAL MENU - ASK USER TYPE ===
  if (text === "") {
    response = "CON Welcome to FarmLink!\nWho are you?\n\n1. Farmer\n2. Buyer";
  }

  // ============================================
  // FARMER SELECTED
  // ============================================
  else if (text === "1") {
    userSessions[sessionId] = "farmer";
    // Check if farmer is registered
    if (farmers[phoneNumber]) {
      response = `CON Welcome back, ${farmers[phoneNumber].name}!\n\n1. Upload Crop\n2. View Market Prices\n3. Weather Info\n4. Farming Tips\n5. My Crops\n0. Logout`;
    } else {
      response = "CON Farmer Registration\nEnter your name:";
    }
  }

  // Farmer Registration
  else if (text.startsWith("1*") && text.split("*").length === 2 && !farmers[phoneNumber]) {
    const name = text.split("*")[1];
    if (name.trim()) {
      farmers[phoneNumber] = {
        name: name.trim(),
        phone: phoneNumber,
        type: 'farmer',
        registered: new Date().toISOString()
      };
      response = `CON Welcome ${name}!\n\n1. Upload Crop\n2. View Market Prices\n3. Weather Info\n4. Farming Tips\n5. My Crops\n0. Logout`;
    } else {
      response = "END Invalid name. Please try again.";
    }
  }

  // === FARMER MENU OPTIONS ===

  // Upload Crop
  else if (text === "1*1" || (text.startsWith("1*") && text.split("*")[1] === "1" && farmers[phoneNumber])) {
    response = "CON Upload Your Crop\nEnter crop name:\n(e.g., Tomatoes, Rice, Yam)";
  }
  else if (text.match(/^1\*\w+\*1\*\w+$/)) {
    const cropName = text.split("*")[2];
    response = `CON Crop: ${cropName}\nEnter price per unit:\n(in Naira)`;
  }
  else if (text.match(/^1\*\w+\*1\*\w+\*\d+$/)) {
    const parts = text.split("*");
    const cropName = parts[2];
    const price = parts[3];
    response = `CON Crop: ${cropName}\nPrice: ₦${price}\nEnter quantity:\n(e.g., 50 bags)`;
  }
  else if (text.match(/^1\*\w+\*1\*[\w\s]+\*\d+\*[\w\s]+$/)) {
    const parts = text.split("*");
    const cropName = parts[2];
    const price = parts[3];
    const quantity = parts[4];
    response = `CON Crop: ${cropName}\nPrice: ₦${price}\nQuantity: ${quantity}\nEnter location:`;
  }
  else if (text.match(/^1\*\w+\*1\*[\w\s]+\*\d+\*[\w\s]+\*[\w\s]+$/)) {
    const parts = text.split("*");
    const cropName = parts[2];
    const price = parts[3];
    const quantity = parts[4];
    const location = parts[5];

    const newCrop = {
      id: crops.length + 1,
      name: cropName.trim(),
      price: price.trim(),
      quantity: quantity.trim(),
      location: location.trim(),
      farmerPhone: phoneNumber,
      farmerName: farmers[phoneNumber]?.name || "Unknown",
      date: new Date().toISOString(),
      status: 'available'
    };
    crops.push(newCrop);

    console.log("🌾 New Crop Uploaded:", newCrop);
    response = `END Crop uploaded!\n\n${cropName}\n₦${price} per unit\n${quantity}\n${location}\n\nBuyers can now see it!`;
  }

  // View Market Prices (Farmer view)
  else if (text === "1*2" || (text.match(/^1\*\w+\*2$/) && farmers[phoneNumber])) {
    if (crops.length === 0) {
      response = "END No crops in market yet.";
    } else {
      let marketList = "CON Market Prices:\n\n";
      crops.slice(-5).reverse().forEach((crop, index) => {
        marketList += `${index + 1}. ${crop.name} - ₦${crop.price}\n   ${crop.location}\n`;
      });
      marketList += "\n0. Back";
      response = marketList;
    }
  }

  // Weather Info
  else if (text === "1*3" || (text.match(/^1\*\w+\*3$/) && farmers[phoneNumber])) {
    response = "CON Weather Forecast:\n\n1. Today\n2. 3-Day Forecast\n3. Rainfall Alert\n0. Back";
  }
  else if (text.match(/^1\*\w*\*3\*1$/)) {
    response = "END Today's Weather:\n\n🌤️ Partly Cloudy\n🌡️ 28°C\n💧 Humidity: 65%\n🌧️ Rain: 20%\n\nGood for planting!";
  }
  else if (text.match(/^1\*\w*\*3\*2$/)) {
    response = "END 3-Day Forecast:\n\nToday: 28°C Cloudy\nTomorrow: 26°C Rainy\nDay 3: 24°C Rainy\n\nPrepare for rain!";
  }
  else if (text.match(/^1\*\w*\*3\*3$/)) {
    response = "END Rainfall Alert:\n\n⚠️ Heavy rain expected\nOct 22-23, 2025\n40-60mm\n\n✓ Harvest ready crops\n✓ Prepare drainage";
  }

  // Farming Tips
  else if (text === "1*4" || (text.match(/^1\*\w+\*4$/) && farmers[phoneNumber])) {
    response = "CON Farming Tips:\n\n1. Planting Guide\n2. Pest Control\n3. Fertilizer Guide\n4. Harvesting Tips\n0. Back";
  }
  else if (text.match(/^1\*\w*\*4\*1$/)) {
    response = "END Planting Season:\n\n🌱 Best for Oct-Nov:\n- Maize\n- Tomatoes\n- Pepper\n\nRainy season!\nPlant early for best yield.";
  }
  else if (text.match(/^1\*\w*\*4\*2$/)) {
    response = "END Pest Control:\n\n🐛 Common pests:\n- Aphids\n- Cutworms\n\nSolutions:\n✓ Neem oil\n✓ Crop rotation\n✓ Remove infected plants";
  }
  else if (text.match(/^1\*\w*\*4\*3$/)) {
    response = "END Fertilizer Guide:\n\n🌾 Maize: NPK 15-15-15\n2 bags/hectare\n\n🍅 Tomatoes: NPK 12-12-17\n+ Organic compost\n\nApply every 3 weeks";
  }
  else if (text.match(/^1\*\w*\*4\*4$/)) {
    response = "END Harvesting Tips:\n\n✓ Harvest early morning\n✓ Use clean tools\n✓ Handle with care\n✓ Sort by quality\n✓ Store cool\n\nProper handling = Better price!";
  }

  // My Crops (Farmer's uploaded crops)
  else if (text === "1*5" || (text.match(/^1\*\w+\*5$/) && farmers[phoneNumber])) {
    const myCrops = crops.filter(crop => crop.farmerPhone === phoneNumber);
    if (myCrops.length === 0) {
      response = "END You haven't uploaded any crops yet.\n\nUse option 1 to upload!";
    } else {
      let myCropsList = "END Your Crops:\n\n";
      myCrops.forEach((crop, index) => {
        myCropsList += `${index + 1}. ${crop.name}\n   ₦${crop.price} - ${crop.quantity}\n   ${crop.location}\n\n`;
      });
      response = myCropsList;
    }
  }

  // ============================================
  // BUYER SELECTED
  // ============================================
  else if (text === "2") {
    userSessions[sessionId] = "buyer";
    // Check if buyer is registered
    if (buyers[phoneNumber]) {
      response = `CON Welcome back, ${buyers[phoneNumber].name}!\n\n1. Browse Crops\n2. Search by Location\n3. Search by Crop\n4. My Orders\n0. Logout`;
    } else {
      response = "CON Buyer Registration\nEnter your name:";
    }
  }

  // Buyer Registration
  else if (text.startsWith("2*") && text.split("*").length === 2 && !buyers[phoneNumber]) {
    const name = text.split("*")[1];
    if (name.trim()) {
      buyers[phoneNumber] = {
        name: name.trim(),
        phone: phoneNumber,
        type: 'buyer',
        registered: new Date().toISOString()
      };
      response = `CON Welcome ${name}!\n\n1. Browse Crops\n2. Search by Location\n3. Search by Crop\n4. My Orders\n0. Logout`;
    } else {
      response = "END Invalid name. Please try again.";
    }
  }

  // === BUYER MENU OPTIONS ===

  // Browse Crops
  else if (text === "2*1" || (text.match(/^2\*\w+\*1$/) && buyers[phoneNumber])) {
    if (crops.length === 0) {
      response = "END No crops available yet.\n\nCheck back soon!";
    } else {
      let cropList = "CON Available Crops:\n\n";
      const displayCrops = crops.slice(-5).reverse();
      displayCrops.forEach((crop, index) => {
        cropList += `${index + 1}. ${crop.name}\n   ₦${crop.price} - ${crop.location}\n`;
      });
      cropList += "\nSelect for details\n0. Back";
      response = cropList;
    }
  }

  // View specific crop details
  else if (text.match(/^2\*\w*\*1\*[1-5]$/)) {
    const index = parseInt(text.split("*")[2]) - 1;
    const displayCrops = crops.slice(-5).reverse();
    const selectedCrop = displayCrops[index];

    if (selectedCrop) {
      response = `END ${selectedCrop.name}\n\nPrice: ₦${selectedCrop.price}\nQuantity: ${selectedCrop.quantity}\nLocation: ${selectedCrop.location}\n\nFarmer: ${selectedCrop.farmerName}\nContact: ${selectedCrop.farmerPhone}\n\nCall farmer to order!`;
    } else {
      response = "END Invalid selection.";
    }
  }

  // Search by Location
  else if (text === "2*2" || (text.match(/^2\*\w+\*2$/) && buyers[phoneNumber])) {
    response = "CON Enter location:\n(e.g., Kano, Lagos, Kaduna)";
  }
  else if (text.match(/^2\*\w*\*2\*[\w\s]+$/)) {
    const location = text.split("*")[2];
    const locationCrops = crops.filter(crop => 
      crop.location.toLowerCase().includes(location.toLowerCase())
    );

    if (locationCrops.length === 0) {
      response = `END No crops found in ${location}.\n\nTry another location!`;
    } else {
      let locationList = `END Crops in ${location}:\n\n`;
      locationCrops.slice(0, 5).forEach((crop, index) => {
        locationList += `${index + 1}. ${crop.name} - ₦${crop.price}\n   ${crop.farmerName}: ${crop.farmerPhone}\n\n`;
      });
      response = locationList;
    }
  }

  // Search by Crop
  else if (text === "2*3" || (text.match(/^2\*\w+\*3$/) && buyers[phoneNumber])) {
    response = "CON Enter crop name:\n(e.g., Tomatoes, Rice, Maize)";
  }
  else if (text.match(/^2\*\w*\*3\*[\w\s]+$/)) {
    const cropName = text.split("*")[2];
    const cropResults = crops.filter(crop =>
      crop.name.toLowerCase().includes(cropName.toLowerCase())
    );

    if (cropResults.length === 0) {
      response = `END No ${cropName} found.\n\nTry another crop!`;
    } else {
      let cropList = `END ${cropName} Available:\n\n`;
      cropResults.slice(0, 5).forEach((crop, index) => {
        cropList += `${index + 1}. ₦${crop.price} - ${crop.quantity}\n   ${crop.location}\n   ${crop.farmerName}: ${crop.farmerPhone}\n\n`;
      });
      response = cropList;
    }
  }

  // My Orders (placeholder)
  else if (text === "2*4" || (text.match(/^2\*\w+\*4$/) && buyers[phoneNumber])) {
    response = "END My Orders:\n\nNo orders yet.\n\nContact farmers directly via Browse Crops to place orders!";
  }

  // === LOGOUT ===
  else if (text.match(/\*0$/)) {
    response = "END Thank you for using FarmLink!\n\nDial again anytime. 🌾";
  }

  // === INVALID INPUT ===
  else {
    response = "END Invalid choice.\n\nPlease dial again.";
  }

  console.log("📤 Response:", response);

  res.set("Content-Type", "text/plain");
  res.send(response);
});

// API endpoints
router.get("/crops", (req, res) => {
  res.json({
    success: true,
    total: crops.length,
    crops: crops
  });
});

router.get("/farmers", (req, res) => {
  res.json({
    success: true,
    total: Object.keys(farmers).length,
    farmers: Object.values(farmers)
  });
});

router.get("/buyers", (req, res) => {
  res.json({
    success: true,
    total: Object.keys(buyers).length,
    buyers: Object.values(buyers)
  });
});

export default router;


// ## 🎯 **How It Works Now:**

// ### **First Time User:**
// 1. Dial `*384*1234#`
// 2. "Who are you? 1. Farmer 2. Buyer"
// 3. Select role → Register → See personalized menu

// ### **Farmer Menu:**

// 1. Upload Crop
// 2. View Market Prices
// 3. Weather Info
// 4. Farming Tips
// 5. My Crops
// 0. Logout
// ```

// ### **Buyer Menu:**

// 1. Browse Crops
// 2. Search by Location
// 3. Search by Crop
// 4. My Orders
// 0. Logout