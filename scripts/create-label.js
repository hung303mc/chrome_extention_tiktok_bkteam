const CL_ITEM_SELECTOR = ".create-label-item";
const CREATE_LABEL_BTN = "btn-create-label";

console.log("log =======>>>> >>>.>> create_label file");
$(document).on("click", CL_ITEM_SELECTOR, async function () {
  console.log("click, click", $(this));
  const orderId = $(this).attr("data-order-id");
  const selector = $(this).attr("data-selector");

  console.log('orderId', orderId);
  console.log('selector', selector);

  if (!orderId) {
    notifyError(ERR_MSG.order);
    return;
  }

  $(CREATE_LABEL_BTN).addClass("loader");
  $(this).addClass("loader");
  await executeCreateLabel({ orderId, selector });
  $(this).removeClass("loader");
  $(CREATE_LABEL_BTN).removeClass("loader");

  chrome.runtime.sendMessage({
    message: "addTrackingComplete",
  });
});

// === HANDLES ====
const executeCreateLabel = async ({ orderId, selector }) => {
  if (!orderId) {
    notifyError(ERR_MSG.order);
    return;
  }

  const newSelector = selector;
  if (!newSelector) {
    newSelector = `tr[data-log_main_order_id="${orderId}"] div[data-log_click_for] button[data-tid="m4b_button"]`;
  }

  console.log("newSelector", newSelector);

  // count find selector
  let countFS = 0;
  while (true) {
    if (countFS === 30) {
      notifyError(ERR_MSG.order);
      return;
    }

    const div = $(`${newSelector} div`);
    if (div.length > 0) {
      console.log("div  === ", div);
      const txtContent = div[0].textContent.toLowerCase().trim();
      console.log("txtContent", txtContent);
      if ("create label" === txtContent) {
        break;
      }
    }
  }

  $(newSelector).length > 0 && $(newSelector).trigger("click");
};
