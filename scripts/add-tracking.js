// tiktokapi-851593ab-ad09-43ff-97d0-1f0e3eb31a3d

// ==== CONSTANTS =====
const ALL_AT_SELECTOR = ".force-add-tracking-all-item .om-checkbox";
const AT_SELECTOR = ".force-add-tracking-item .om-checkbox";
const AT_ITEM_SELECTOR = ".add-tracking-item";
const ADD_TRACKING_BTN = "#btn-add-tracking";
const BTN_ADD_TRACKING = 'div[data-log_click_for="arrange_shipment"] button';
const ORDER_ID_NUMBER = "tr a .order_id_number";
const INPUT_TRACKING_ID = "input[placeholder='Enter tracking ID']";
const INPUT_SHIPPING_PROVIDER = "input[placeholder='Select shipping provider']";
const CARRIER_OPTION = '.theme-arco-trigger li[role="option"]';
const BTN_CONFIRM = 'button[data-log_click_for="confirm_shipment"]';
const BTN_MANAGE_ORDER = 'button[data-log_click_for="go_to_order_list"]';

const ADD_TRACKING_MSG = {
  base: "Add Trackings",
  selected: "Add Tracks Selected Orders",
};

const ERR_MSG = {
  order: "Order not found.",
  trackingCode: "Tracking Order not found.",
  carrier: "Could not detect carrier from tracking.",
  trackingId: "Input Tracking ID not found.",
  btnConfirm: "Could not found button Add tracking info.",
};

// ==== EVENTS =====
// checked fore add tracking
$(document).on("click", ALL_AT_SELECTOR, async function () {
  const isChecked = $(this).is(":checked");

  if (isChecked) {
    $(AT_SELECTOR).each(function () {
      if (!$(this).is(":checked")) $(this).click();
    });
  } else {
    $(AT_SELECTOR).each(function () {
      if ($(this).is(":checked")) $(this).click();
    });
  }

  setTextBtnAddTrack();
});

// checked force add all tracking
$(document).on("click", AT_SELECTOR, function () {
  setTextBtnAddTrack();
});

$(document).on("click", AT_ITEM_SELECTOR, async function () {
  const orderId = $(this).attr("data-order-id");
  const tracking = $(this).attr("data-tracking");
  const carrier = $(this).attr("data-carrier");

  if (!orderId) {
    notifyError(ERR_MSG.order);
    return;
  }
  if (!tracking) {
    notifyError(ERR_MSG.trackingCode);
    return;
  }

  $(ADD_TRACKING_BTN).addClass("loader");
  $(this).addClass("loader");
  await executeAddTracking({ orderId, tracking, carrier });
  $(this).removeClass("loader");
  $(ADD_TRACKING_BTN).removeClass("loader");

  // Gửi thông điệp đến background.js với thông tin orderId và tracking
  chrome.runtime.sendMessage({
    message: "addTrackingComplete",
    orderId,
    tracking
  });

});

$(document).on("click", ADD_TRACKING_BTN, async function () {
  const orders = [];
  let isAddTrackingSpecify = false;
  $(AT_SELECTOR).each(function () {
    if ($(this).is(":checked")) {
      isAddTrackingSpecify = true;
      return false;
    }
  });

  $(AT_SELECTOR).each(function () {
    const orderId = $(this).attr("data-order-id");
    const tracking = $(this).attr("data-tracking");
    const carrier = $(this).attr("data-carrier");
    if (!orderId || !tracking) return true;

    if (isAddTrackingSpecify) {
      if ($(this).is(":checked")) {
        orders.push({ orderId, tracking, carrier });
      }
      return true;
    }

    orders.push({ orderId, tracking, carrier });
  });

  if (orders.length == 0) {
    notifyError(ERR_MSG.order);
    return;
  }

  $(this).addClass("loader");

  for (const { orderId, tracking, carrier } of orders) {
    const cls = `.add-tracking-item[data-order-id="${orderId}"]`;
    $(cls).addClass("loader");
    await executeAddTracking({ orderId, tracking, carrier });

    // Gửi thông điệp đến background.js với thông tin orderId và tracking
    chrome.runtime.sendMessage({
      message: "InfoTrackingCompleteOnly",
      orderId,
      tracking
    });

    await sleep(4000);
    $(cls).removeClass("loader");
  }

  $(this).removeClass("loader");
  // Gửi thông điệp đến background.js với thông tin orderId và tracking
  chrome.runtime.sendMessage({
    message: "addTrackingComplete",
    orderId,
    tracking
  });
});

// ===== UI ====
const setTextBtnAddTrack = () => {
  let hasChecked = false;
  $(AT_SELECTOR).each(function () {
    if ($(this).is(":checked")) {
      hasChecked = true;
      return false;
    }
  });

  let msg = ADD_TRACKING_MSG.base;
  if (hasChecked) {
    msg = ADD_TRACKING_MSG.selected;
  }

  $(ADD_TRACKING_BTN).text(msg);
};

// === UTILS ====
const detectCarrierCode = (tracking) => {
  const trackingCode = (tracking + "").trim();
  const trackingLen = trackingCode.length;

  if (trackingLen < 2) {
    return "";
  }

  if (trackingCode.startsWith("92")) {
    return "usps";
  }

  if (
    trackingCode.startsWith("420") &&
    (trackingLen === 30 || trackingLen === 34)
  ) {
    return "dhl";
  }

  const start = trackingCode.toUpperCase().slice(0, 2);
  if (trackingCode.startsWith("1Z") || start.includes("80")) {
    return "ups";
  }
  if (["94", "93", "92"].some((i) => start === i) && trackingLen !== 10) {
    return "usps";
  }

  const allowedString = [
    "GM",
    "LX",
    "RX",
    "UV",
    "CN",
    "SG",
    "TH",
    "IN",
    "HK",
    "MY",
    "42",
    "92",
  ];
  if (allowedString.includes(start)) {
    if (trackingLen > 12) {
      return "dhlglobalmail";
    }
  }

  if (start === "61" || (start === "77" && tracking.length == 12)) {
    return "fedex";
  }

  if (
    ["82", "69", "30", "75"].includes(start) ||
    trackingLen === 10 ||
    trackingLen === 8
  ) {
    return "dhl";
  }
};

const carrierObject = {
  usps: "USPS",
  ups: "UPS",
  fedex: "FedEx",
  dhl: "DHL eCommerce",
  dhlglobalmail: "DHL eCommerce",
};
const detectCarrierValue = (carrierCode) => {
  return carrierObject[carrierCode] || "";
};

//  ==== HANDLES =====
const executeAddTracking = async ({ orderId, tracking, carrier = "" }) => {
  if (!orderId) {
    notifyError(ERR_MSG.order);
    return;
  }
  if (!tracking) {
    notifyError(ERR_MSG.trackingCode);
    return;
  }

  // map carrierCode via `shipping_carrier_code` else detect from `tracking_number`
  let carrierCode = "";
  if (carrier) {
    const carrierLowerCase = carrier.toLowerCase(); // case: Customcat return `coder` (vendor) is Uppercase
    carrierCode = detectCarrierValue(carrierLowerCase);
  }

  if (!carrierCode) {
    carrierCode = detectCarrierValue(detectCarrierCode(tracking));
  }

  if (!carrierCode) {
    notifyError(ERR_MSG.carrier);
    return;
  }

  const addTrackingbyId = `tr:has(div[data-log_main_order_id="${orderId}"]) ${BTN_ADD_TRACKING}`;
  let countBtnAT = 0;
  while (true) {
    if (countBtnAT === 30) {
      notifyError(ERR_MSG.order);
      return;
    }
    if ($(addTrackingbyId).length > 0) break;
    console.log("Attempt", countBtnAT + 1, "failed. Element not found:", addTrackingbyId);


    countBtnAT += 1;
    await sleep(1000);
  }

  $(addTrackingbyId).length > 0 && $(addTrackingbyId).trigger("click");
  // await for load new DOM
  await sleep(3000);
  // check again by orderId
  let countOrderId = 0;
  while (true) {
    if (countOrderId === 30) {
      notifyError(ERR_MSG.order);
      return;
    }

    if ($(ORDER_ID_NUMBER).length > 0) break;

    countOrderId += 1;
    await sleep(1000);
  }

  if ($(ORDER_ID_NUMBER).text() !== orderId) {
    notifyError(ERR_MSG.order);
    return;
  }

  // find tracking_id input
  let countTI = 0;
  while (true) {
    if (countTI === 30) {
      notifyError(ERR_MSG.trackingId);
      return;
    }

    if ($(INPUT_TRACKING_ID).length > 0) break;
    countTI += 1;

    await sleep(1000);
  }

  const inputTrackingId = $(INPUT_TRACKING_ID);
  inputTrackingId.focus();
  inputTrackingId.val("");
  document.execCommand("insertText", false, tracking);
  inputTrackingId.blur();

  // const carrierEvent = document.createEvent("HTMLEvents");
  //  carrierEvent.initEvent("change", true, true);
  //  $select.dispatchEvent(carrierEvent);
  await sleep(2000);

  $(INPUT_SHIPPING_PROVIDER).trigger("click");
  await sleep(3000);

  let countOpt = 0;
  while (true) {
    if (countOpt === 30) {
      notifyError(ERR_MSG.carrier);
      return;
    }

    if ($(CARRIER_OPTION).length > 0) break;
    countOpt += 1;
    await sleep(1000);
  }

  for (let i = 1; i <= $(CARRIER_OPTION).length; i++) {
    const opt = $(`${CARRIER_OPTION}:nth-child(${i})`);
    if (!opt || !opt.text()) continue;

    if (opt.text() !== carrierCode) {
      $(opt).attr("aria-selected", "");
      $(opt).removeClass("theme-arco-select-option-selected");
    } else {
      $(opt).attr("aria-selected", "true");
      $(opt).addClass("theme-arco-select-option-selected");
      $(INPUT_TRACKING_ID).val(carrierCode);

      $(opt).trigger("click");
    }
  }

  let countBtnCf = 0;
  while (true) {
    if (countBtnCf === 30) {
      notifyError(ERR_MSG.btnConfirm);
      return;
    }

    if ($(BTN_CONFIRM).length > 0) break;

    countBtnCf += 1;
    await sleep(3000);
  }

  $(BTN_CONFIRM).trigger("click");

  // show response success
  $(`#add_tracking tr[data-order-id="${orderId}"]`).remove();
  if ($(`#add_tracking tr`).length == 0) {
    $(".btn-add-tracking-wrap").css("display", "none");
    if (!$("#add_tracking .om-not-found-wrap").length)
      $("#add_tracking .table_wrap").append(orderNotFound);
  }
  notifySuccess("Add tracking success.");
  await sleep(1000);

  let countBtnManageOrder = 0;
  while (true) {
    if (countBtnManageOrder === 30) {
      notifyError(ERR_MSG.btnManageOrder);
      return;
    }

    if ($(BTN_MANAGE_ORDER).length > 0) break;

    countBtnManageOrder += 1;
    await sleep(3000);
  }

  $(BTN_MANAGE_ORDER).trigger("click");
  await sleep(1000);
};

{
  /* <div style="display: flex; flex-direction: column;">
  <li role="option" class="theme-arco-select-option theme-m4b-select-option">
    USPS
  </li>
  <li role="option" class="theme-arco-select-option theme-m4b-select-option">
    UPS
  </li>
  <li role="option" class="theme-arco-select-option theme-m4b-select-option">
    FedEx
  </li>
  <li role="option" class="theme-arco-select-option theme-m4b-select-option">
    LaserShip
  </li>
  <li role="option" class="theme-arco-select-option theme-m4b-select-option">
    OnTrac
  </li>
  <li role="option" class="theme-arco-select-option theme-m4b-select-option">
    Better Trucks
  </li>
  <li role="option" class="theme-arco-select-option theme-m4b-select-option">
    TForce
  </li>
  <li
    role="option"
    aria-selected="true"
    class="theme-arco-select-option theme-m4b-select-option theme-arco-select-option-selected"
  >
    DHL eCommerce
  </li>
  <li role="option" class="theme-arco-select-option theme-m4b-select-option">
    Amazon Logistics
  </li>
  <li role="option" class="theme-arco-select-option theme-m4b-select-option">
    AxleHire
  </li>
  <li role="option" class="theme-arco-select-option theme-m4b-select-option">
    Lone Star Overnight
  </li>
  <li role="option" class="theme-arco-select-option theme-m4b-select-option">
    Deliver-it
  </li>
  <li role="option" class="theme-arco-select-option theme-m4b-select-option">
    GLS US
  </li>
  <li role="option" class="theme-arco-select-option theme-m4b-select-option">
    Spee-Dee Delivery
  </li>
  <li role="option" class="theme-arco-select-option theme-m4b-select-option">
    Wizmo
  </li>
</div>; */
}
