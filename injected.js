const ENPOINTS = [
  "/api/fulfillment/order/list", // get orders
  "/api/fulfillment/order/na/list", // get orders
  "/api/fulfillment/na/order/list", // get orders - sửa lại endpoint này
  "/api/v3/trade/orders/get", // get order detail
  "/api/v1/pay/statement/order/list", // get pay order
  "/api/fulfillment/order/get", // get product_id
  "/api/fulfillment/order/na/get", // get product_id

  "/api/v1/fulfillment/shipping_doc/generate", // generate shipping docs
];

console.log("🟢 Injected script đã được tải vào trang");

const { fetch: origFetch } = window;
window.fetch = async (...args) => {
  const response = await origFetch(...args);
  const url = args[0];
  if (url && ENPOINTS.some((i) => !!url.match(new RegExp(i, "gi")))) {
    response
      .clone()
      .json() // maybe json(), text(), blob()
      .then((data) => {
        window.postMessage({ endpoint: url, data: data }, "*"); // send to content script
      })
      .catch((err) => console.error(err));
  }
  return response;
};
