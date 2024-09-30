var mbApi = "MBApi";
const addonCollapsible = "AddonCollapsible";

// Markups
const syncOrderOptionComponent = `
   <div class="box-order-ids">
      <label class="om-label" for="order_ids">Order Ids</label>
      <div class="wrap-order_ids">
         <textarea class="om-textarea" name="order_ids" id="order_ids" rows="4"></textarea>
      </div>
   </div>
   <div class="box-alway-mapping">
      <div class="wrap-alway_mapping">
         <input class="om-checkbox" type="checkbox" name="alway_mapping" id="alway_mapping" />
      </div>
      <label class="om-label" for="alway_mapping">Always mapping</label>
   </div>
   <div class="box-is-multi-product">
      <div class="wrap-is_multi_product">
         <input class="om-checkbox" type="checkbox" name="is_multi_product" id="is_multi_product" />
      </div>
      <label class="om-label" for="is_multi_product">Is multiple products</label>
   </div>
   <div class="box-split-order">
      <div class="wrap-split_order">
         <input class="om-checkbox" type="checkbox" name="split_order" id="split_order"/>
      </div>
      <label class="om-label" for="split_order">Split orders</label>
   </div>
   <div style="margin-left: 10px; margin-top: 10px;" class="box-split-detail-wrap">
      <div class="apply-split">
         <input
            class="om-checkbox"
            type="checkbox"
            name="apply_all_items"
            id="apply_all_items"
            checked
         />
         <label
            class="om-label"
            for="apply_all_items"
            style="display: inline-block; padding: 0px"
            >Apply all items</label
         >
      </div>
      <div class="box-split-detail" style="display: flex; margin-top: 10px">
         <div>
            <label class="om-label" for="number_item_of_each_order"
            >Expected orders:</label
            >
            <div class="wrap-apikey">
            <input
               class="om-input"
               type="number"
               min="1"
               value="1"
               name="number_item_of_each_order"
               id="number_item_of_each_order"
            />
            </div>
         </div>
         <div>
            <label class="om-label" for="qty_per_item">Qty per item:</label>
            <div class="wrap-apikey">
            <input
               class="om-input"
               type="number"
               min="1"
               value="1"
               name="qty_per_item"
               id="qty_per_item"
            />
            </div>
         </div>
      </div>
   </div>

   <!-- <div class="box-split-detail">
      <div>
         <label class="om-label" for="number_item_of_each_order">Expected orders:</label>
         <div class="wrap-apikey">
            <input class="om-input" type="number" min="1" value="1" name="number_item_of_each_order" id="number_item_of_each_order"/>
         </div>
      </div>
      <div>
         <label class="om-label" for="qty_per_item">Qty per item:</label>
         <div class="wrap-apikey">
            <input class="om-input" type="number" min="1" value="1" name="qty_per_item" id="qty_per_item"/>
         </div>
      </div>
   </div> -->
   <div class="wrap-btn om-fl-center" style="margin-top:15px">
      <button id="sync-order-option" class="om-btn">Sync Orders</button>
   </div>
`;

const addonComponent = `
   <div class="om-addon">
      <div class="om-container">
         <button type="button" id="om-collapsible" class="om-btn">
            <svg
               aria-hidden="true"
               focusable="false"
               data-prefix="fas"
               data-icon="angle-double-right"
               style="width: 18px"
               class="svg-inline--fa fa-angle-double-right fa-w-14"
               role="img"
               xmlns="http://www.w3.org/2000/svg"
               viewBox="0 0 448 512"
            >
               <path
                  fill="currentColor"
                  d="M224.3 273l-136 136c-9.4 9.4-24.6 9.4-33.9 0l-22.6-22.6c-9.4-9.4-9.4-24.6 0-33.9l96.4-96.4-96.4-96.4c-9.4-9.4-9.4-24.6 0-33.9L54.3 103c9.4-9.4 24.6-9.4 33.9 0l136 136c9.5 9.4 9.5 24.6.1 34zm192-34l-136-136c-9.4-9.4-24.6-9.4-33.9 0l-22.6 22.6c-9.4 9.4-9.4 24.6 0 33.9l96.4 96.4-96.4 96.4c-9.4 9.4-9.4 24.6 0 33.9l22.6 22.6c9.4 9.4 24.6 9.4 33.9 0l136-136c9.4-9.2 9.4-24.4 0-33.8z"
               ></path>
            </svg>
         </button>
         <div class="om-content">
            <div class="om-tab om-top-tab">
               <button class="tablinks om-tablinks" data-name="sync_order">
                  Sync Orders
               </button>
               <!-- <button class="tablinks om-tablinks" data-name="sync_order_option">
                  Sync Orders Options
               </button> -->
            </div>

            <div id="sync_order" class="tabcontent om-tabcontent"></div>

            <div id="sync_order_option" class="tabcontent om-tabcontent">
               ${syncOrderOptionComponent}
            </div>
         </div>
      </div>
   </div>
`;

const syncOrderComponent = `
   <div class="sync-order-wrap">
      <div class="om-heading">
        <h3>Orders Statistic</h3>
      </div>
      
      <div class="om-tab om-sub-tab">
         <button class="tablinks" data-name="not_synced">Not Synced</button>
         <button class="tablinks" data-name="add_tracking">Add Tracking</button>
         <!--<<button class="tablinks" data-name="create_label">Create Label</button>-->
         <!--<button class="tablinks" data-name="grand_total">Update Grand Totals</button>-->
      </div>
      <div id="not_synced" class="tabcontent">
         <div class="om-main-cta-button-wrapper om-fl-center btn-sync-order-wrap">
            <button id="sync-order" class="om-btn">Sync Orders</button>
         </div>
      </div>
      <div id="add_tracking" class="tabcontent">
         <div class="om-main-cta-button-wrapper om-fl-center btn-add-tracking-wrap">
            <button id="btn-add-tracking" class="om-btn">Add Tracking</button>
         </div>
      </div>
      <!--<div id="create_label" class="tabcontent">
        <div class="om-main-cta-button-wrapper om-fl-center btn-create-label-wrap">
          <button id="btn-create-label" class="om-btn">Create Label</button>
        </div>
      </div>-->
      <!--<div id="grand_total" class="tabcontent">
         <div class="om-main-cta-button-wrapper om-fl-center btn-grandtotal-wrap">
            <button id="update-grandtotal" class="om-btn">Start Update</button>
         </div>
      </div>-->
   </div>
`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// UTILS
const b64Encode = (obj) => {
  const strObj = JSON.stringify(obj);
  return btoa(unescape(encodeURIComponent(strObj)));
};

const b64Decode = (b64String) => {
  const objStr = decodeURIComponent(escape(window.atob(b64String)));
  return JSON.parse(objStr);
};

const setCookie = (name, value) => {
  // remove cookie
  const cookieArr = document.cookie.split(";");
  for (var i = 0; i < cookieArr.length; i++) {
    const cookiePair = cookieArr[i].split("=");
    if ([mbApi, addonCollapsible].includes(cookiePair[0].trim())) {
      document.cookie = name + "=" + ";expires=Thu, 01 Jan 1970 00:00:01 GMT";
    }
  }

  let cookie = name + "=" + encodeURIComponent(value);
  cookie += "; max-age=" + 365 * 24 * 60 * 60;
  document.cookie = cookie;
};

const getCookie = (name) => {
  const cookieArr = document.cookie.split(";");
  for (var i = 0; i < cookieArr.length; i++) {
    const cookiePair = cookieArr[i].split("=");
    if (name == cookiePair[0].trim()) {
      return decodeURIComponent(cookiePair[1]);
    }
  }
  return null;
};
const notifySuccess = (message) => {
  $.toast({
    heading: message,
    position: "bottom-center",
    showHideTransition: "slide",
    loader: false,
    textAlign: "center",
  });
};

const taskProcessing = (label) => {
  if (label)
    $(".om-addon").append(`
         <div class="om-processing">
            <div class="om-processing-label">${label}</div>
            <div class="om-processing-stop">
               <button class="om-btn" id="stop-process">Stop</button>
            </div>
         </div>
      `);
};
// Click Sync Order > Sync > Stop to stop the syncing process
$(document).on("click", `#stop-process`, function (e) {
  chrome.runtime.sendMessage({
    message: "stopProcess",
  });
});

const getStorage = (key) =>
  new Promise((r) =>
    chrome.storage.local.get(key).then((result) => {
      r(result[key]);
    }),
  );

const setStorage = (key, value) =>
  new Promise((r) => {
    return chrome.storage.local.set({ [key]: value }).then(() => {
      r(value);
    });
  });

const notifyError = (message) => {
  $.toast({
    heading: message,
    position: "bottom-center",
    showHideTransition: "slide",
    loader: false,
    textAlign: "center",
    bgColor: " #d82c0d",
  });
};

const checkAddonCollapse = async () => {
  const isOpen = await getStorage(addonCollapsible);
  if (isOpen === false) {
    if ($("#om-collapsible").hasClass("om-active"))
      $("#om-collapsible").click();
  } else {
    if (!$("#om-collapsible").hasClass("om-active"))
      $("#om-collapsible").click();
  }
};

const init = async () => {
  const apiKey = await getStorage(mbApi);
  if (!apiKey) {
    notifyError("Please enter MB api key.");
    return;
  }

  // embedding addon into tiktok
  if (!window.location.href.includes("seller-us.tiktok.com/order")) return;

  if ($(".om-addon").length) return;
  $("body").append(addonComponent);
  await checkAddonCollapse();

  // active tab sync order
  $('[data-name="sync_order"]').click();
  $("#sync_order").append(syncOrderComponent);
  $(".btn-sync-order-wrap").css("display", "none");
  $(".btn-revert-order-wrap").css("display", "none");

  // loading tabs until receive orders
  $("#not_synced").prepend(
    `<div style="position:relative;height:100px" class="loader-resp"></div>`,
  );
  $("#add_tracking").prepend(
    `<div style="position:relative;height:100px" class="loader-resp"></div>`,
  );
  // active tab not synced
  $('[data-name="not_synced"]').click();
};

$(document).ready(async function () {
  // await sleep(3500);
  // await setStorage("_mb_auto", false);
  // await setStorage("_mb_auto_key", null);

  init();
});

// EventListenter
// collapse addon
$(document).on("click", "#om-collapsible", async function () {
  this.classList.toggle("om-active");
  var content = this.nextElementSibling;
  if (content.style.width) {
    content.style.width = null;
    setTimeout(() => {
      content.style.height = null;
      content.style.padding = null;
    }, 300);
  } else {
    content.style.width = "500px";
    content.style.height = "auto";
  }
  if ($(this).hasClass("om-active")) await setStorage(addonCollapsible, true);
  else await setStorage(addonCollapsible, false);
});
// open tabs
$(document).on("click", `.om-tablinks`, function (e) {
  $(".om-tabcontent").each(function () {
    $(this).css("display", "none");
  });
  $(".om-tablinks").each(function () {
    $(this).removeClass("om-active om-active-tab");
  });
  $(`#${$(this).attr("data-name")}`).css("display", "block");
  $(this).addClass("om-active om-active-tab");
});

chrome.runtime.onMessage.addListener(async function (req, sender, res) {
  const { message, data } = req || {};
  console.log("BG_REqueset", req);
  switch (message) {
    case "popupSaveApiKey":
      res({ message: "received" });
      localStorage.setItem("list_table_module_size", 100);

      // ===> send to background
      chrome.runtime.sendMessage({
        message: "listedSaveApiKey",
        domain: window.location.origin,
      });
      window.location.reload();
      break;
    case "listedSaveApiKey":
      res({ message: "received" });
      break;

    default:
      break;
  }
});
// Function to remove Order Status:Awaiting Shipment and other filters on Manage Orders > To Ship tab
const removeOrderStatusFilter = async (counter) => {
  if (counter > 5) return;
  if (counter > 1) await sleep(2000);
  let button;
  let spans = document.getElementsByTagName("span");
  for (let span of spans) {
    if (span.textContent.includes("Clear all")) {
      button = span;
      break;
    }
  }

  if (!button) {
    removeOrderStatusFilter(counter + 1);
  } else {
    button.click();
  }
};
// ====> capture event from `background`
chrome.runtime.onMessage.addListener(async function (req, sender, res) {
  const { message, data } = req || {};
  switch (message) {
    case "getApiKey":
      res({ message: "received" });
      chrome.runtime.sendMessage({
        message: "getApiKey",
        data: await getStorage(mbApi),
      });
      break;
    case "afterBackToOrderPage":
      res({ message: "received" });
      await sleep(7000);
      removeOrderStatusFilter(1);
      break;
    default:
      break;
  }
});

function setDivHeight() {
  const tabContent = document.querySelector(".table_wrap");
  const tabNames = [...document.querySelectorAll(".om-tab")];

  const heading = document.querySelector(".om-heading");
  const button = document.querySelector(".om-main-cta-button-wrapper");
  const omProcessing = document.querySelector(".om-processing");
  if (tabContent) {
    const blankSpace =
      window.innerHeight -
      tabNames[0].clientHeight -
      tabNames[1].clientHeight -
      heading.clientHeight -
      button.clientHeight -
      (omProcessing ? omProcessing.clientHeight : 0) -
      5;

    tabContent.style.height = blankSpace + "px";

    return true;
  } else {
    return false;
  }
}

const tabSelector = ".om-container #sync_order .om-tab";
const orderHeader = ".om-container #sync_order .om-heading";

const btnSelector = ".om-container #add_tracking .om-main-cta-button-wrapper";
const headingSelecotr = "#add_tracking .om-table thead";
function setAddTrackingHeight() {
  const tabContent = document.querySelector("#add_tracking .table_wrap");

  if (tabContent) {
    const tab = (document.querySelector(tabSelector) || {}).clientHeight;
    const button = (document.querySelector(btnSelector) || {}).clientHeight;
    const orderHeight = (document.querySelector(orderHeader) || {})
      .clientHeight;
    const tableHeading = (document.querySelector(headingSelecotr) || {})
      .clientHeight;

    const height =
      window.innerHeight - tab - button - tableHeading - orderHeight; // margin-top
    const tbody = tabContent.querySelector(".table_wrap tbody");
    if (tbody) {
      tbody.style.height = height + "px";
    }
  }
}


const btnCreateLabelSelector = ".om-container #create_label .om-main-cta-button-wrapper";
const headingCreateLabelSelecotr = "#create_label .om-table thead";
function setCreateLabelHeight() {
  const tabContent = document.querySelector("#create_label .table_wrap");

  if (tabContent) {
    const tab = (document.querySelector(tabSelector) || {}).clientHeight;
    const button = (document.querySelector(btnCreateLabelSelector) || {}).clientHeight;
    const orderHeight = (document.querySelector(orderHeader) || {})
      .clientHeight;
    const tableHeading = (document.querySelector(headingCreateLabelSelecotr) || {})
      .clientHeight;

    const height =
      window.innerHeight - tab - button - tableHeading - orderHeight; // margin-top
    const tbody = tabContent.querySelector(".table_wrap tbody");
    if (tbody) {
      tbody.style.height = height + "px";
    }
  }
}

function debounce(func, timeout = 500) {
  let timer;
  return (...args) => {
    timer && clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, timeout);
  };
}

window.addEventListener(
  "resize",

  debounce(() => {
    setDivHeight();
    setAddTrackingHeight();
    setCreateLabelHeight();
  }),
);

// inject injected script
var s = document.createElement("script");
s.src = chrome.runtime.getURL("injected.js");
s.onload = function () {
  this.remove();
};
(document.head || document.documentElement).appendChild(s);

// receive message from injected script
window.addEventListener("message", function (event) {
  const { endpoint, data } = event.data || {};
  chrome && chrome.runtime && chrome.runtime.sendMessage({
    message: "responseData",
    endpoint,
    data,
  });
});
