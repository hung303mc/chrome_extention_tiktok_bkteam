// CONTANTS
const MB_URL = "http://bkteam.top/dungvuong-admin/api/Order_Sync_Tiktok_to_System_Api.php";

let currentAutoApiKey = null;
let doingAuto = false;
let doingAutoSyncing = false;
const ATTRIBUTES = {
  COLOR: new Set([
    "Black",
    "White",
    "Sport Grey",
    "Forest Green",
    "Sand",
    "Navy",
    "Maroon",
    "Light Pink",
    "Orange",
    "Dark Heather",
    "Black Accent",
    "Light Blue Accent",
    "Light Green Accent",
    "Orange Accent",
    "Pink Accent",
    "Red Accent",
    "Grey",
    "Dark Grey Heather",
    "Deep Teal",
    "Asphalt",
    "Heather Sane Dune",
    "Heather Raspberry",
    "Heather Peach",
    "Heather Orange",
    "Heather Mint",
    "Heather Military Green",
    "Heather Mauve",
    "Heather Sand Dune",
    "Heather Red",
    "Cardinal",
    "Berry",
    "Dark Military Green",
    "Ash",
    "Light Blue",
    "Light",
    "Light Sport",
    "Dark",
    "Caroline Blue",
    "Red",
    "Natural",
    "Military Green",
    "Link Pink",
    "Heather sport",
    "Heather Sport",
    "Heather",
    "Heather Team Purple",
    "Light Bue",
    "Whtie",
    "Dark Heather",
  ]),
  SIZE: new Set([
    "S",
    "M",
    "L",
    "XL",
    "2XL",
    "3XL",
    "4XL",
    "5XL",
    "11 Oz",
    "15 Oz",
    "30x40 inche",
    "50x60 inche",
    "60x80 inche",
  ]),
  PRODUCT_TYPE: new Set([
    "T-shirt",
    "Sweatshirt",
    "Unisex Tshirt",
    "Unisex T-shirt",
    "Hoodie",
    "Short Sleeve Tee",
    "Unisex Short Sleeve Tee",
    "Unisex Sweatshirt",
    "Unisex Hoodie",
    "Cozy Plush Fleece Blanket",
    "Premium Sherpa Blanket",
    "Ornament 1",
    "Ornament 2",
    "Default",
  ]),
};

var OrderInfo = {
  locked: false,
  orderId: null,
  order: null,
  shipping: null,
  subTotal: null,
  productId: null,
};

const resetOrderInfo = () => {
  OrderInfo = {
    locked: false,
    orderId: null,
    order: null,
    shipping: null,
    subTotal: null,
    productId: null,
  };
};

// Utils
function slugify(str) {
  return String(str)
    .normalize("NFKD") // split accented characters into their base characters and diacritical marks
    .replace(/[\u0300-\u036f]/g, "") // remove all the accents, which happen to be all in the \u03xx UNICODE block.
    .trim() // trim leading or trailing whitespace
    .toLowerCase() // convert to lowercase
    .replace(/[^a-z0-9 -_]/g, "") // remove non-alphanumeric characters
    .replace(/\s+/g, "-") // replace spaces with hyphens
    .replace(/_+/g, "-"); // remove consecutive hyphens
}
const arrInvalid = (data) => !data || !Array.isArray(data) || data.length === 0;
const objInvalid = (data) => !data || typeof data !== "object";

const getPrice = (str) => {
  if (!str || typeof str !== "string") return 0;

  const pt = /\d+(\.\d+)?/;
  const match = str.match(pt);
  if (arrInvalid(match)) return 0;
  return match[0];
};

const getShippingByName = (items, name) => {
  if (arrInvalid(items)) return "";
  const match = items.find((i) => i?.key === name);
  if (objInvalid(match)) return "";

  return match.value;
};

const convertTime = (orderDate) => {
  let dateStr = orderDate + "";
  if (dateStr.length < 13) {
    dateStr += "0".repeat(13 - dateStr.length);
  }
  // return new Date(parseInt(dateStr)).toISOString();
  const date = new Date(parseInt(dateStr));
  const pstDate = date.toLocaleString("en-US", {
    timeZone: "America/Los_Angeles",
  });

  // const formatVal = (val) => {
  //   val = String(val);
  //   if (val.length === 1) {
  //     val = "0" + val;
  //   }
  //   return val;
  // };

  // const [T1, T2] = pstDate.split(/,/).map((i) => i.trim());
  // let [mo, d, y] = T1.split(/\//g).map((i) => formatVal(i));
  // let [h, m, s] = T2.split(/\:/g).map((i) => formatVal(i));
  // [s] = s.split(" ");

  // const pt = /PM/gi;
  // if (!!pstDate.match(pt)) {
  //   h = parseInt(h) + 12;
  //   if (h >= 24) {
  //     h = h - 24;
  //     d = parseInt(d) + 1;
  //   }
  // }

  // const res = `${[y, mo, d].join("-")}T${[h, m, s].join(":")}.000Z`;
  // return res;

  const result = new Date(pstDate + " PDT").toISOString();
  return result;
};

const convertTimePDT = (orderDate) => {
  let dateStr = orderDate + "";
  if (dateStr.length < 13) {
    dateStr += "0".repeat(13 - dateStr.length);
  }
  const date = new Date(parseInt(dateStr));
  const options = {
    timeZone: "America/Los_Angeles",
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  };
  const pstDate = new Intl.DateTimeFormat('en-US', options).format(date);

  // Split the formatted string into components
  const [month, day, year, hour, minute, second] = pstDate.match(/\d+/g);

  // Construct the ISO string
  const isoString = `${year}-${month}-${day}T${hour}:${minute}:${second}.000Z`;

  return isoString;
};

const getShipping = (shippingAddress) => {
  if (objInvalid(shippingAddress)) return {};
  const { items, region, districts } = shippingAddress;
  const [name, phone, zipCode, address1, addressDetail, houseNumber] = [
    "name",
    "phone",
    "zipcode",
    "address",
    "address_detail",
    "house_number",
  ].map((i) => getShippingByName(items, i));

  const address2 = [houseNumber, addressDetail].filter(Boolean).join(" ");

  let city,
    state,
    country = "";
  if (!arrInvalid(districts)) {
    const [s, c] = districts;
    if (s?.name) {
      state = s.name;
    }

    if (c?.name) {
      city = c.name;
    }
  }

  country = region?.name || "";

  return {
    name,
    address1,
    address2,
    city,
    state,
    zipCode,
    country,
    phone,
  };
};

const getBuyer = (buyerNickName) => {
  if (!buyerNickName) return { email: "", name: "" };
  return {
    email: buyerNickName + "@gmail.com",
    name: buyerNickName,
  };
};

// https://seller-us.tiktok.com/api/v1/pay/statement/order/list
const getSubTotal = (data) => {
  const { sum_settlement_amount } = data || {};
  const { amount } = sum_settlement_amount || {};

  return Number.parseFloat(getPrice(amount));
};

const getSubTotalItem = (priceDetail) => {
  const { format_price } = priceDetail || {};
  return Number.parseFloat(getPrice(format_price));
};

const getImage = (productImage) => {
  const { url_list } = productImage || {};
  const [url] = (url_list || []).filter(Boolean);

  return url;
};

const getQty = (skus, skuId) => {
  if (arrInvalid(skus)) return 1;

  const match = skus.find((i) => i?.sku_id === skuId);
  if (objInvalid(match)) return 1;

  return match.quantity;
};

const getAttributes = (skuName) => {
  if (!skuName || skuName.length === 0) return [];
  const splitted = skuName
    .split(",")
    .map((i) => i?.trim())
    .filter(Boolean);

  if (splitted.length === 0) return [];

  const res = [];
  for (let [key, arr] of Object.entries(ATTRIBUTES)) {
    for (let item of splitted) {
      if (arr.has(item)) {
        res.push({ name: slugify(key), value: item });
      }
    }
  }

  return [...res, { name: "sku_name", value: skuName }];
};

const getItem = (sku) => {
  if (objInvalid(sku)) return;

  const {
    sku_id,
    sku_name,
    total_price,
    product_name,
    product_image,
    quantity,
    order_line_ids,
    seller_sku_name,
  } = sku;
  const image = getImage(product_image);
  const attributes = getAttributes(sku_name);
  const price = getSubTotalItem(total_price);

  const itemID =
    order_line_ids && order_line_ids.length > 0 ? order_line_ids[0] : sku_id;
    
  return {
    itemID,
    qty: quantity,
    productID: sku_id,
    productVariantID: sku_id,
    sku: seller_sku_name,
    title: product_name,
    image,
    price,
    shippingCost: 0,
    attributes,
  };
};

const getItems = (skus) => {
  if (arrInvalid(skus)) return [];

  const res = [];
  for (let sku of skus) {
    res.push(getItem(sku));
  }

  return res.filter(Boolean);
};

const getOrderInfo = (mainOrder) => {
  if (objInvalid(mainOrder)) return;
  const {
    main_order_id,
    buyer_info,
    skus,
    logistics_service_name,
    main_order_create_time,
    price_detail,
    latest_tts_timestamp,  // Lấy latest_tts_timestamp
    latest_delivery_time,  // Lấy latest_delivery_time
  } = mainOrder;

  const { shipping_address, buyer_nickname } = buyer_info || {};
  const shipping = getShipping(shipping_address);
  const buyer = getBuyer(buyer_nickname || shipping?.name);
  const items = getItems(skus);
  const orderCreated = convertTimePDT(main_order_create_time);
  const shipBy = convertTimePDT(latest_tts_timestamp);  // Chuyển đổi latest_tts_timestamp
  const deliveryBy = convertTimePDT(latest_delivery_time);  // Chuyển đổi latest_delivery_time

  return {
    orderID: main_order_id,
    buyer,
    shipping,
    shippingMethod: logistics_service_name,
    shippingTotal: 0,
    items,
    orderCreated,
    shipBy,  // Lưu thời gian ship by
    deliveryBy,  // Lưu thời gian delivery by
    priceDetail: Number.parseFloat(getPrice(price_detail?.format_price)),
  };
};


const SPLIT_PRODUCT_ID = "__TH__";
const genProductIds = (order) => {
  if (objInvalid(order)) return;

  const { sku_module } = order;
  if (arrInvalid(sku_module)) return;

  const res = {};
  for (let item of sku_module) {
    if (objInvalid(item) || !item.sku_id || !item.product_id) continue;

    res[item.sku_id] = item.product_id;
  }

  return res;
};

var activeTabId;
var stopProcess = false;
chrome.tabs.onActivated.addListener(function (activeInfo) {
  activeTabId = activeInfo?.tabId;
});

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const stopInteval = (params) => {
  clearInterval(params);
};

const sendMessage = (tabId, message, data) => {
  let timeOut = 0;
  let start = setInterval(() => {
    timeOut++;
    chrome.tabs.sendMessage(
      tabId,
      {
        message,
        data,
      },
      (resp) => {
        if (!chrome.runtime.lastError && resp?.message === "received")
          stopInteval(start);
      },
    );
    if (timeOut == 120) stopInteval(start);
  }, 1000);
};

const sendToContentScript = (msg, data) =>
  new Promise(async (resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs || !tabs.length || !tabs[0].id) {
        if (activeTabId) {
          chrome.tabs.get(activeTabId, function (tab) {
            if (tab) {
              sendMessage(tab.id, msg, data);
              return resolve(true);
            }
            return resolve(false);
          });
        }
        return resolve(false);
      }
      sendMessage(tabs[0].id, msg, data);
      resolve(true);
    });
  });

const sendRequestToMB = async (endPoint, apiKey, data) => {
  const res = {
    error: null,
  };
  if (!apiKey) apiKey = await getMBApiKey();

  let url = MB_URL;
  if (endPoint) {
    url += `?case=${endPoint}`;
  }

  try {
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "merchantId": apiKey, // Sử dụng merchantId như một apiKey
      },
      body: data,
    });
    return await resp.json();
  } catch (error) {
    res.error = error.message;
  }
  return res;
};


const getMBApiKey = () =>
  new Promise(async (resolve) => {
    chrome.storage.local.get("MBApi").then((result) => {
      resolve(result["MBApi"]);
    });

    const isSended = await sendToContentScript("getApiKey", null);
    if (!isSended) resolve(null);
    chrome.runtime.onMessage.addListener(async (req, sender, res) => {
      const { message, data } = req || {};
      if (message === "getApiKey" && data) resolve(data);
    });
  });

/**
 * order_status_code:
 *  - 104: Canceled
 *  - 103: Completed
 *  - 102: Delivered
 */
const checkStatus = (order_status_module, code) => {
  if (arrInvalid(order_status_module)) return false;
  return order_status_module.every((i) => i?.main_order_status === code); // 104 => cancelled
};

const getStatusCode = (order_status_module) => {
  if (arrInvalid(order_status_module)) return 0;
  return order_status_module[0] && order_status_module[0].main_order_status;
};

const getTrackingNo = (delivery_module) => {
  if (arrInvalid(delivery_module)) return false;
  const trackingNos = delivery_module
    .map((item) => item?.tracking_no)
    .filter(Boolean);
  return trackingNos.length > 0;
};

const getOrderData = (data) => {
  const orders = data?.data?.main_orders || [];
  if (!orders || !Array.isArray(orders) || orders.length === 0) return [];

  const formattedOrders = orders
    .map((item) => {
      if (!item || typeof item !== "object") return null;

      const {
        main_order_id: orderId,
        sku_module,
        order_status_module,
        delivery_module,
      } = item;
      // ignore status
      const isCanceled = checkStatus(order_status_module, 104);
      if (isCanceled) return;

      const firstItem = (sku_module || [])[0];
      const productImages = firstItem?.product_image?.url_list || [];
      const image = (productImages || [])[0];
      const statusCode = getStatusCode(order_status_module);
      return {
        orderId,
        image,
        statusCode,
        hasTracking: getTrackingNo(delivery_module),
      };
    })
    .filter(Boolean);
  return formattedOrders;
};

const formatOrderFinal = (orderInfo) => {
  if (!orderInfo.order || orderInfo.subTotal == null || !orderInfo.productId)
    return;

  const { items } = orderInfo.order || {};
  if (arrInvalid(items)) return;

  const newItems = [];
  for (let item of items) {
    newItems.push({
      ...item,
      productID: orderInfo.productId[item.productVariantID],
    });
  }

  const { priceDetail, ...restOrder } = orderInfo.order;
  return {
    ...restOrder,
    subTotal: orderInfo.subTotal,
    items: newItems,
  };
};

// ===> capture event from `devtool`
chrome.runtime.onConnect.addListener((port) => {
  if (!port || port.name !== "captureRequest") return;
  port.onMessage.addListener(async (msg) => {
    const { message, data, endpoint } = msg || {};
    switch (message) {
      case "responseData":
        if (!data) break;
        return;

        if (endpoint.includes("fulfillment/order/list")) {
          const orders = getOrderData(data);

          const resp = {
            orders,
            mbInfo: {},
            error: null,
          };

          if (orders.length === 0) {
            sendToContentScript("orders", resp);
            break;
          }

          // Check synced orders
          const apiKey = await getMBApiKey();
          if (!apiKey) return;

          const query = JSON.stringify({
            originIds: JSON.stringify(orders.map((o) => o["orderId"]))
          });
          const result = await sendRequestToMB("checkTiktokSyncedOrders", apiKey, query);
          resp.mbInfo = result.data;
          resp.error = result.error
              ? result.error
              : result.errors
                  ? result.errors[0].message
                  : null;

          sendToContentScript("orders", resp);
        }

        if (endpoint.includes("trade/orders/get")) {
          const mainOrder = data?.data?.main_order;
          const { main_order_id } = mainOrder || {};
          if (main_order_id === OrderInfo.orderId) {
            const order = getOrderInfo(mainOrder);
            OrderInfo.order = order;
          }
        }

        // get amount
        if (endpoint.includes("pay/statement/order/list")) {
          const result = data?.data;
          const { order_records } = result || [];
          const [record] = (order_records || []).filter(Boolean);
          const { reference_id } = record || {};

          if (reference_id === OrderInfo.orderId) {
            OrderInfo.subTotal = getSubTotal(result);
          }
        }

        // get product_id
        if (
          endpoint.includes("/fulfillment/order/get") ||
          endpoint.includes("/fulfillment/order/na/get")
        ) {
          const mainOrder = data?.data?.main_order;
          const [order] = (mainOrder || []).filter(Boolean);
          if (objInvalid(order) || order.main_order_id !== OrderInfo.orderId)
            return;
          OrderInfo.productId = genProductIds(order);
        }

      default:
        break;
    }
  }); // tiktokapi-9997252d-2d26-4324-8035-741339a0aff2
});

// ===> capture event from `popup`
chrome.runtime.onMessage.addListener((req, sender, res) => {
  const { message, data } = req || {};
  switch (message) {
    case "saveApiKey":
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs?.length > 0 && tabs[0].id) {
          // ====> send order info to `content_script`
          sendMessage(tabs[0].id, "popupSaveApiKey", data);
        }
      });
      chrome.runtime.sendMessage({
        message: "listedSaveApiKey",
      });
      break;
    default:
      break;
  }
});

async function handleSyncOrderImpl({ order, index, len, apiKey }) {
  if (OrderInfo.locked) return;
  if (stopProcess) return;

  OrderInfo.orderId = order["orderId"];
  OrderInfo.locked = true;
  const url = `https://seller-us.tiktok.com/order/detail?order_no=${OrderInfo.orderId}&shop_region=US`;

  const dataSendMessage = {
    order,
    label: `Syncing orders: ${index + 1}/${len}`,
  };

  let tabs = await chrome.tabs.query({ currentWindow: true });

  let tab = (tabs || []).find((item) => item?.active);
  if (tab?.id) {
    chrome.tabs.update(tab.id, { url }, (tabInner) => {
      sendMessage(tabInner?.id, "getOrderItemInfo", dataSendMessage);
    });
  } else if (activeTabId) {
    chrome.tabs.get(activeTabId, function (tabInner) {
      if (tabInner) {
        chrome.tabs.update(activeTabId || tabInner?.id, { url }, (tab) => {
          sendMessage(tab.id, "getOrderItemInfo", dataSendMessage);
        });
      }
    });
  }

  let countSleep = 0;
  while (true) {
    if (
      (OrderInfo.order && OrderInfo.subTotal != null && OrderInfo.productId) ||
      countSleep == 200
    ) {
      break;
    }
    countSleep++;
    await sleep(1000);
  }

  if (!OrderInfo.order || OrderInfo.subTotal == null || !OrderInfo.productId) {
    sendToContentScript("syncOrderToMB", {
      data: false,
      error: "Could not get order info.",
    });
    await sleep(2000);
    resetOrderInfo();
    return;
  }

  const newOrder = formatOrderFinal(OrderInfo);
  if (!newOrder) {
    sendToContentScript("syncOrderToMB", {
      data: false,
      error: "Could not get order info.",
    });
    await sleep(2000);
    resetOrderInfo();
    return;
  }

  // sync order to MB
  let query = JSON.stringify({
      input: newOrder
  });
  const result = await sendRequestToMB("createTiktokOrder", apiKey, query);
  const messResp = { data: true, error: null };
  if (result.error) messResp.error = result.error;
  else if (result.errors?.length) messResp.error = result.errors[0].message;

  sendToContentScript("syncOrderToMB", messResp);
  resetOrderInfo();
  await sleep(3000);
  return;
}

async function* handleSynOrderGen(orders, apiKey) {
  for (let i = 0; i < orders.length; i++) {
    const order = orders[i];
    yield await handleSyncOrderImpl({
      order,
      len: orders.length,
      apiKey,
      index: i,
    });
  }
}

const handleSyncOrders = async (orders, apiKey) => {
  const results = [];
  resetOrderInfo();
  if (!apiKey) apiKey = await getMBApiKey();
  stopProcess = false;

  for await (const _order of handleSynOrderGen(orders, apiKey)) {
  }

  stopProcess = false;

  //  Manage Orders > To Ship page
  const url = "https://seller-us.tiktok.com/order/?selected_sort=1&tab=to_ship";

  //  Manage Orders > Shipped page (for testing)
  // const url = "https://seller-us.tiktok.com/order/?selected_sort=1&tab=all";

  // After navigating back to Manage Orders > To Ship, and To Ship page completes loading, call this function:
  const onUpdated = async function onUpdated(tabId, changeInfo, tabInfo) {
    if (!(changeInfo.status == "complete" && tabId == updatedTab?.id)) {
      return;
    }
    updatedTab = null;

    await chrome.tabs.sendMessage(tabId, {
      message: "afterBackToOrderPage",
    });
  };

  chrome.tabs.onUpdated.addListener(onUpdated);

  let updatedTab = await chrome.tabs.update(activeTabId, {
    url,
    active: true,
  });

  return results;
};

const maybeOpenURL = () => {
  const url =
    "https://seller-us.tiktok.com/order/?order_status[]=1&selected_sort=1&tab=to_ship";
  chrome.tabs.query({}, (tabs) => {
    let found = false;
    tabs.map((tab) => {
      if (found) {
        return;
      }
      if (tab?.url?.includes("seller-us.tiktok.com")) {
        found = tab.id;
      }
    });

    if (found) {
      chrome.tabs.update(found, {
        active: true,
        url,
      });
    } else {
      chrome.tabs.create({
        active: true,
        url,
      });
    }
  });
};

// ===> capture event from `content_script`
chrome.runtime.onMessage.addListener(async (req, sender) => {
  const { message, data, endpoint } = req || {};
  switch (message) {
    case "responseData":
      if (!data) break;

      if (
        endpoint.includes("fulfillment/order/list") ||
        endpoint.includes("fulfillment/order/na/list")
      ) {
        const orders = getOrderData(data);

        const resp = {
          orders,
          mbInfo: {},
          error: null,
        };

        if (orders.length === 0) {
          sendToContentScript("orders", resp);
          break;
        }

        // Check synced orders
        const apiKey = await getMBApiKey();
        if (!apiKey) return;

        const query = JSON.stringify({
          originIds: JSON.stringify(orders.map((o) => o["orderId"]))
        });
        const result = await sendRequestToMB("checkTiktokSyncedOrders", apiKey, query);
        resp.mbInfo = result.data;
        resp.error = result.error
            ? result.error
            : result.errors
                ? result.errors[0].message
                : null;

        sendToContentScript("orders", resp);
      }

      if (endpoint.includes("trade/orders/get")) {
        const mainOrder = data?.data?.main_order;
        const { main_order_id } = mainOrder || {};
        if (main_order_id === OrderInfo.orderId) {
          const order = getOrderInfo(mainOrder);
          OrderInfo.order = order;
        }
      }

      // get amount
      if (endpoint.includes("pay/statement/order/list")) {
        const result = data?.data;
        const { order_records } = result || [];
        const [record] = (order_records || []).filter(Boolean);
        const { reference_id } = record || {};

        if (reference_id === OrderInfo.orderId) {
          OrderInfo.subTotal = getSubTotal(result) || 10;
        } else {
          OrderInfo.subTotal = OrderInfo.order?.priceDetail || 0;
        }
      }

      // get product_id
      if (
        endpoint.includes("/fulfillment/order/get") ||
        endpoint.includes("/fulfillment/order/na/get")
      ) {
        const mainOrder = data?.data?.main_order;
        const [order] = (mainOrder || []).filter(Boolean);
        if (objInvalid(order) || order.main_order_id !== OrderInfo.orderId)
          return;
        OrderInfo.productId = genProductIds(order);
      }
      break;

    case "addTrackingComplete":
      // Lấy thông tin từ request
      const { orderId, tracking } = req;

      // Gửi thông tin order và tracking lên server trước khi điều hướng
      const query = JSON.stringify({
        orderId,
        trackingCode: tracking,
      });

      const resAddTrack = await sendRequestToMB("addedTrackingCode", null, query);

      //  Manage Orders > To Ship page
      const url =
        "https://seller-us.tiktok.com/order/?selected_sort=1&tab=to_ship";

      // After navigating back to Manage Orders > To Ship, and To Ship page completes loading, call this function:
      const onUpdated = async function onUpdated(tabId, changeInfo) {
        if (!(changeInfo.status == "complete" && tabId == updatedTab?.id)) {
          return;
        }
        updatedTab = null;
      };

      chrome.tabs.onUpdated.addListener(onUpdated);
      let updatedTab = await chrome.tabs.update(activeTabId, {
        url,
        active: true,
      });
      break;
    default:
      break;
  }
  if (message === "listedSaveApiKey") {
    sendToContentScript("listedSaveApiKey", null);
  }

  if (message === "autoReady") {
    if (doingAuto) {
      return;
    }

    doingAuto = true;
    currentAutoApiKey = req?.apiKey;
    maybeOpenURL();

    return;
  }

  if (message === "autoSyncOrderToMB") {
    if (doingAutoSyncing) {
      return;
    }

    doingAutoSyncing = true;

    const { apiKey, orders } = data;
    await sendToContentScript("auto_syncing");
    if (orders?.length) {
      await handleSyncOrders(orders, apiKey);
    }
    await sendToContentScript("auto_synced");

    doingAutoSyncing = false;

    return;
  }

  if (message === "syncOrderToMB") {
    const { apiKey, orders, markSynced } = data;
    if (!orders || !orders.length) return;
    await handleSyncOrders(orders, apiKey);

    if (markSynced) {
      await sendToContentScript("auto_synced");
    }
  }

  if (message === "stopProcess") {
    stopProcess = true;
  }
});

chrome.runtime.onInstalled.addListener(maybeOpenURL);

// tiktokapi-c5b3660c-37d6-44ff-b33b-f9b667b6163b
