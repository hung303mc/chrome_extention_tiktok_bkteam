//Created a port with background page for continous message communication
const port = chrome.runtime.connect({ name: "captureRequest" });
const ENPOINTS = [
   "https://seller-us.tiktok.com/api/fulfillment/order/list", // get orders
   "https://seller-us.tiktok.com/api/v3/trade/orders/get", // get order detail
   "https://seller-us.tiktok.com/api/v1/pay/statement/order/list", // get pay order
   "https://seller-us.tiktok.com/api/fulfillment/order/get", // get product_id
];

// capture response request get orders
chrome.devtools.network.onRequestFinished.addListener(async function (
   netevent,
) {
   const request = await netevent.request;
   const response = await netevent.response;

   if (
      !request?.url ||
      response.status !== 200 ||
      ENPOINTS.every((i) => !request.url.includes(i)) ||
      !response?.content?.mimeType?.includes("application/json")
   )
      return;
   // send response to background
   netevent.getContent(function (body) {
      const data = JSON.parse(body);
      if (port && typeof port === "object")
         if (port.postMessage && typeof port.postMessage === "function") {
            port.postMessage({
               message: "responseData",
               endpoint: request?.url,
               data,
            });
         }
   });
});
