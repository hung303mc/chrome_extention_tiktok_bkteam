let mb_tiktok_orders = null;

// UI
const removeTableLoading = () => {
  // remove loading
  $("#not_synced .loader-resp").remove();
  $("#ignored .loader-resp").remove();
  $("#add_tracking .loader-resp").remove();

  $("#create_label .loader-resp").remove();

  // show not synced table
  if (!$("#not_synced table").length)
    $("#not_synced").prepend(`
          <div class="table_wrap">
             <table class="om-table">
               <thead>
                  <tr>
                     <th class="force-sync-all-item">
                        <input class="om-checkbox" type="checkbox" />
                     </th>
                     <th>Image</th>
                     <th>Order ID</th>
                     <th>Action</th>
                  </tr>
               </thead>
               <tbody></tbody>
             </table>
          </div>
       `);

  // show ignore table
  if (!$("#ignored table").length)
    $("#ignored").prepend(`
          <div class="table_wrap">
             <table class="om-table">
               <thead>
                  <tr>
                     <th class="force-revert-all-item">
                        <input class="om-checkbox" type="checkbox" />
                     </th>
                     <th>Image</th>
                     <th>Order ID</th>
                     <th>Action</th>
                  </tr>
                </thead>
                <tbody></tbody>
             </table>
          </div>
       `);

  // show tracking table
  if (!$("#add_tracking table").length)
    $("#add_tracking").prepend(`
        <div class="table_wrap add_track_table_wrap">
          <table class="om-table">
            <thead>
                <tr>
                  <th class="force-add-tracking-all-item">
                      <input class="om-checkbox" type="checkbox" />
                  </th>
                  <th>Image</th>
                  <th>Order ID</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody></tbody>
          </table>
        </div>
    `);

  // show create label table
  if (!$("#create_label table").length) {
    $("#create_label").prepend(`
      <div class="table_wrap create_label_table_wrap">
        <table class="om-table">
          <thead>
            <tr>
              <th class="force-create-label-all-item">
                <input class="om-checkbox" type="checkbox"/>
              </th>
              <th>Order ID</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody></tbody>
        </table>
      </div>
    `);
  }
};

const statusLabel = (status, colorCode) => `
   <div class="om-status-label-wrap" data-status="${status}">
      <span class="om-status-label" style="background-color:${colorCode};">${status}</span>
   </div>
`;

const addStatusLabel = (orderInfo, ordersObj) => {
  if (!orderInfo) return;

  const ordersXpath = "table[class^='StyledTable'] tbody tr";
  for (let i = 0; i < $(ordersXpath).length; i++) {
    const item = $(ordersXpath)?.eq(i);

    const orderId = item
      ?.find("td:nth-child(2) span[data-log_click_for='order_id_link']")
      .text();

    if (!orderId || !orderInfo[orderId] || !ordersObj[orderId]) continue;

    const addLabelXpath = "td:nth-child(5) .theme-arco-space-item:nth-child(1)";
    const { status, tracking_code: trackingCode } = orderInfo[orderId];
    const { statusCode, hasTracking } = ordersObj[orderId]; // from Tiktok data
    const childrens = [];

    switch (status) {
      case "synced":
        if (!item.find(`.om-order-info [data-status="Synced"]`).length)
          childrens.push(statusLabel("Synced", "#008060"));

        if (hasTracking) {
          childrens.push(statusLabel("Tracking Code Added", "#008060"));
        } else {
          if (trackingCode) {
            if (
              !item.find(`.om-order-info [data-status="Tracking Available"]`)
                .length
            )
              childrens.push(statusLabel("Tracking Available", "#008060"));
          } else {
            if (
              !item.find(
                `.om-order-info [data-status="Tracking Not Available"]`,
              ).length
            )
              childrens.push(statusLabel("Tracking Not Available", "#f44336"));
          }
        }

        break;
      case "not-synced":
        // order's status = completed => hide
        if (statusCode === 103) break;
        if (!item.find(`.om-order-info [data-status="Not Synced"]`).length)
          childrens.push(statusLabel("Not Synced", "#f44336"));
        break;
      case "ignored":
        if (!item.find(`.om-order-info [data-status="MB Ignored"]`).length)
          childrens.push(statusLabel("MB Ignored", "#f44336"));
        break;
      default:
        break;
    }

    if (childrens?.length > 0) {
      item
        .find(addLabelXpath)
        .append(`<div class="wt-mt-xs-2 om-order-info"></div>`);
      const elem = item.find(addLabelXpath + " .om-order-info");

      for (let child of childrens) {
        elem.append(child);
      }
    }
  }
};

const orderNotFound = `
   <div class="om-not-found-wrap">
      <div style="padding:20px 10px;"><img style="width:30px;object-fit:cover;" src="${chrome.runtime.getURL(
        "assets/images/not-found.png",
      )}"/></div>
      <div class="om-text-not-found" >Orders not found</div>
   </div>
`;
const syncedAllOrders = `
   <div class="om-synced-all-wrap">
      <div style="padding:20px 10px;"><img style="width:30px;object-fit:cover;" src="${chrome.runtime.getURL(
        "assets/images/completed.png",
      )}"/></div>
      <div class="om-text-synced-all" >All orders were synced to MB</div>
   </div>
`;

const convertOrderToObj = (orders) => {
  const obj = {};
  for (let order of orders) {
    if (order?.orderId == null) continue;
    obj[order.orderId] = order;
  }
  return obj;
};

const appendOrdersIntoTable = (data) => {
  removeTableLoading();
  if (!data) return;
  const { orders, mbInfo = {} } = data;

  console.log('orders:  ', orders);
  console.log('nbInfo:  ', mbInfo);
  addStatusLabel(mbInfo, convertOrderToObj(orders));
  //------------ insert data into table
  let hasNotSync = false;
  let hasIgnore = false;
  let hasTrackingCode = false;
  let hasCreateLabel = false;

  const countUnsyncOrders = Object.values(mbInfo).filter(
    (item) => item.status === "not-synced",
  ).length;

  if (countUnsyncOrders == 0) {
    $(".om-table tbody").empty();
    $(".om-synced-all-wrap").show();
  } else {
    $(".om-synced-all-wrap").hide();
  }

  for (const order of orders) {
    if (!mbInfo[order.orderId]) continue;

    const { statusCode, hasTracking } = order; // from Tiktok data
    const {
      status: mbStatus,
      tracking_code,
      shipping_carrier_code,
    } = mbInfo[order.orderId];
    const orderId = order.orderId;
    // add order into not sync table
    //  statusCode === 103 => completed => hide
    if (mbStatus === "not-synced" && statusCode !== 103) {
      hasNotSync = true;
      if (!$(`#not_synced tr[data-order-id="${order.orderId}"]`).length) {
        $("#not_synced .om-table tbody").append(`
            <tr data-order-id="${order.orderId}">
              <td class="force-sync-item"><input data-order="${b64Encode(
                order,
              )}" class="om-checkbox" type="checkbox"></td>
              <td> <img class="om-img-50" src="${order.image}" /></td>
              <td>${order.orderId}</td>
              <td><button class="sync-order-item om-btn" data-order-id="${
                order.orderId
              }" data-order="${b64Encode(order)}">Sync</button></td>
            </tr>
        `);
      }
    }
    // add order into ignored table
    if (mbStatus === "ignored") {
      hasIgnore = true;
      if (!$(`#ignored tr[data-order-id="${order.orderId}"]`).length) {
        $("#ignored .om-table tbody").append(`
          <tr data-order-id="${order.orderId}">
            <td class="force-revert-item"><input data-order="${b64Encode(
              order,
            )}" class="om-checkbox" type="checkbox"></td>
            <td> <img class="om-img-50" src="${order.image}" /></td>
            <td>${order.orderId}</td>
            <td><button class="revert-order-item om-btn" data-order-id="${
              order.orderId
            }" data-order="${b64Encode(order)}">Revert</button></td>
          </tr>
      `);
      }
    }

    if (tracking_code && !hasTracking) {
      hasTrackingCode = true;
      let carrier = shipping_carrier_code ? shipping_carrier_code : "";

      if (!$(`#add_tracking tr[data-order-id="${orderId}"]`).length) {
        const props = `data-tracking="${tracking_code}" data-carrier="${carrier}" data-order-id="${orderId}"`;
        $("#add_tracking .om-table tbody").append(`
          <tr data-order-id="${orderId}">
            <td class="force-add-tracking-item">
              <input ${props} class="om-checkbox" type="checkbox">
            </td>
            <td>
              <img class="om-img-50" src="${order.image}" />
            </td>
            <td>
                <span class="om-order-id-tag">${orderId}</span>
                <span class="om-tracking-tag">${tracking_code}</span>
            </td>
            <td>
              <button class="add-tracking-item om-btn" ${props}>Add</button>
            </td>
          </tr>
        `);
      }
    }


    // Create label
    for (let order of orders){
      if (!order || !order.orderId) continue

      const selector = `tr[data-log_main_order_id="${orderId}"] div[data-log_click_for] button[data-tid="m4b_button"]`
      const div = $(`${selector} div`);
      if (div && div.length > 0) {
        const txtContent = div[0].textContent.toLowerCase().trim();
        if ("create label" === txtContent) {
          hasCreateLabel = true;
          const checkOrderId = $(`#create_label tr[data-order-id="${orderId}"]`)
          console.log('check order id', checkOrderId);
          if(!$(`#create_label tr[data-order-id="${orderId}"]`).length) {
            const props = `data-order-id="${orderId}" data-selector="${selector}"`;
            $("#create_label .om-table tbody").append(`
              <tr data-order-id="${orderId}">
                <td class="force-create-label-item">
                  <input ${props} class="om-checkbox" type="checkbox">
                </td>
                <td>
                  <span class="om-order-id-tag">${orderId}</span>
                </td>
                <td>
                  <button class="create-label-item om-btn" ${props}>Create</button>
                </td>
              </tr>
            `);
          }
        }
      }
    }
  }

  $("#add_tracking .om-not-found-wrap").remove();

  if (hasNotSync) $(".btn-sync-order-wrap").css("display", "flex");
  else {
    if (!$("#not_synced .om-synced-all-wrap").length)
      $("#not_synced .table_wrap").append(syncedAllOrders);
    $("#not_synced .btn-sync-order-wrap").css("display", "none");
  }

  if (hasIgnore) $(".btn-revert-order-wrap").css("display", "flex");
  else {
    if (!$("#ignored .om-not-found-wrap").length)
      $("#ignored .table_wrap").append(orderNotFound);
    $("#ignored .btn-revert-order-wrap").css("display", "none");
  }

  if (hasTrackingCode) $(".btn-add-tracking-wrap").css("display", "flex");
  else {
    if (!$("#add_tracking .table_wrap .om-not-found-wrap").length)
      $("#add_tracking .table_wrap").append(orderNotFound);
    $("#add_tracking .btn-add-tracking-wrap").css("display", "none");
  }

  if (hasCreateLabel) {
    $(".btn-create-label-wrap").css("display", "flex");
  } else {
    if(!$("#create_label .table_wrap .om-not-found-wrap").length) {
      $("#create_label .table_wrap").append(orderNotFound);
    }
    $("#create_label .btn-create-label-wrap").css("display", "none")
  }
};

// control sub-tabs inside tab sync orders
$(document).on("click", `.sync-order-wrap .tablinks`, function (e) {
  $(".sync-order-wrap .tabcontent").each(function () {
    $(this).css("display", "none");
  });
  $(".sync-order-wrap .tablinks").each(function () {
    $(this).removeClass("om-active om-active-tab");
  });
  $(`#${$(this).attr("data-name")}`).css("display", "block");
  $(this).addClass("om-active om-active-tab");

  setDivHeight();
  setAddTrackingHeight();
  setCreateLabelHeight();
});

// ===> listing event from `background`
chrome.runtime.onMessage.addListener(async function (req, sender, res) {
  const { message, data } = req || {};

  console.log("BG_REQUEST", req);

  if (message === "orders") {
    res({ message: "received" });
    if (!data) {
      return;
    }
    const { error } = data || {};
    if (error) {
      notifyError("Check synced order: " + data.error);
      return;
    }

    appendOrdersIntoTable(data);
    setDivHeight();

    const isAuto = await getStorage("_mb_auto");
    const autoKey = await getStorage("_mb_auto_key");
    // mb_tiktok_orders = data;
    if (isAuto && autoKey) {
      $(".om-addon #not_synced #sync-order").trigger('click');
      return;
      chrome.runtime.sendMessage({
        message: "autoSyncOrderToMB",
        domain: window.location.origin,
        // currentPage: currentPage,
        data: {
          apiKey: autoKey,
          orders: data?.orders,
        },
      });
    }

    return;
  }

  if (message === "getOrderItemInfo") {
    res({ message: "received" });
    if (!data) return;
    await appendProcessSyncOrderItem(data);
    return;
  }

  if (message === "syncOrderToMB") {
    res({ message: "received" });
    $(".loader").removeClass("loader");
    const { error } = data;
    if (error) notifyError(error);
    else notifySuccess("Sync order success");
    return;
  }

  if (message === "auto_syncing") {
    res({ message: "received" });
    $("#sync-order").addClass("loader");
    notifySuccess("Auto syncing orders...");
  }

  if (message === "auto_synced") {
    res({ message: "received" });
    notifySuccess("Auto synced orders");
    $("#sync-order").removeClass("loader");
    setTimeout(() => {
      const event = new CustomEvent("mb_sync_done");
      window.dispatchEvent(event);
    }, 5 * 1000);
  }
});

const appendProcessSyncOrderItem = async (data) => {
  removeTableLoading();
  if (!data) return;
  const { order, label } = data;
  if (!order) return;
  taskProcessing(label);
  // add order into not sync table
  if (!$(`#not_synced tr[data-order-id="${order.orderId}"]`).length) {
    $("#not_synced .om-table tbody").append(`
              <tr data-order-id="${order.orderId}">
                 <td class="force-sync-item"><input class="om-checkbox" type="checkbox"></td>
                 <td> <img class="om-img-50" src="${order.image}" /></td>
                 <td>${order.orderId}</td>
                 <td><button class="sync-order-item om-btn loader">Sync</button></td>
              </tr>
           `);
  }
  // disable btn Sync Orders
  $("#not_synced .btn-sync-order-wrap").css("display", "none");
  // info tab ignore order
  if (!$("#ignored .om-not-found-wrap").length)
    $("#ignored .table_wrap").append(orderNotFound);
  $("#ignored .btn-revert-order-wrap").css("display", "none");
  // get mockup
  let countWaitImg = 0;
  if (!order.image) {
    while (true) {
      if (countWaitImg == 30) break;
      const img = $(
        ".a-keyvalue:first-child tbody tr:first-child td:nth-child(2) img",
      )?.attr("src");
      if (img) {
        $(`[data-order-id="${order.orderId}"] img`).attr(
          "src",
          img.replace("._SCLZZZZZZZ__SX55_.", "."),
        );
        break;
      }
      await sleep(500);
      countWaitImg++;
    }
  }
};
// click on Checkbox to select all orders
$(document).on("click", ".force-sync-all-item .om-checkbox", function () {
  if ($(this).is(":checked"))
    $(".force-sync-item .om-checkbox").each(function () {
      if (!$(this).is(":checked")) $(this).click();
    });
  else
    $(".force-sync-item .om-checkbox").each(function () {
      if ($(this).is(":checked")) $(this).click();
    });
  setTextBtnSync();
});
const setTextBtnSync = () => {
  let hasChecked = false;
  $(".force-sync-item .om-checkbox").each(function () {
    if ($(this).is(":checked")) {
      hasChecked = true;
      return false;
    }
  });
  if (hasChecked) $("#sync-order").text("Sync Selected Orders");
  else $("#sync-order").text("Sync Orders");
};
// click on Checkbox to select one order
$(document).on("click", ".force-sync-item .om-checkbox", function () {
  if ($(this).is(":checked"))
    $(this).closest("tr").addClass("om-checkbox-selected");
  else $(this).closest("tr").removeClass("om-checkbox-selected");
  setTextBtnSync();
});

// Click button Sync in each order item
$(document).on("click", ".sync-order-item", async function () {
  const orders = [];
  const orderString = $(this).attr("data-order");
  if (!orderString) {
    notifyError("Order not found.");
    return;
  }
  orders.push(b64Decode(orderString));

  $(this).addClass("loader");

  $("#sync-order").addClass("loader");

  chrome.runtime.sendMessage({
    message: "syncOrderToMB",
    domain: window.location.origin,
    data: {
      apiKey: await getStorage(mbApi),
      orders,
    },
  });
});

window.addEventListener("mb_sync_now", async (event) => {
  // setTimeout(() => {
  //   const event = new CustomEvent("mb_sync_done");
  //   window.dispatchEvent(event);
  // }, 10 * 1000)
  // console.log('OK__event', event?.detail)
  if (event?.detail?.mb_api) {
    await setStorage("_mb_auto", true);
    await setStorage("_mb_auto_key", event?.detail?.mb_api?.tiktok);
    await setStorage(mbApi, event?.detail?.mb_api?.tiktok);
    chrome.runtime.sendMessage({
      message: "autoReady",
      domain: window.location.origin,
      apiKey: event?.detail?.mb_api?.tiktok,
      // currentPage: currentPage,
    });
  }
});

// click button Sync Selected Orders
$(document).on("click", "#sync-order", async function () {
  const orders = [];
  // check sync order specify
  let isSyncOrderSpecify = false;
  $(".force-sync-item .om-checkbox").each(function () {
    if ($(this).is(":checked")) {
      isSyncOrderSpecify = true;
      return false;
    }
  });
  $(".force-sync-item .om-checkbox").each(function () {
    const orderString = $(this).attr("data-order");
    if (!orderString) return true;
    const order = b64Decode(orderString);
    if (isSyncOrderSpecify) {
      if ($(this).is(":checked")) orders.push(order);
      return true;
    }
    orders.push(order);
  });
  if (orders.length == 0) {
    notifyError("Order not found.");
    return;
  }
  $(this).addClass("loader");
  for (const order of orders) {
    $(`.sync-order-item[data-order-id="${order.orderId}"]`).addClass("loader");
  }

  // console.log( 'DYN_ORDER', mb_tiktok_orders);
  // return;

  const isAuto = await getStorage("_mb_auto");
  const autoKey = await getStorage("_mb_auto_key");
  // send order ids to background
  chrome.runtime.sendMessage({
    message: "syncOrderToMB",
    domain: window.location.origin,
    // currentPage: currentPage,
    data: {
      apiKey: await getStorage(mbApi),
      orders,
      markSynced: isAuto && autoKey,
    },
  });
});
