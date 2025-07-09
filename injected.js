const ENPOINTS = [
  "/api/fulfillment/order/list", // get orders
  "/api/fulfillment/order/na/list", // get orders
  "/api/fulfillment/na/order/list", // get orders - sửa lại endpoint này
  "/api/v3/trade/orders/get", // get order detail
  "/api/v1/pay/statement/order/list", // get pay order
  "/api/fulfillment/order/get", // get product_id
  "/api/fulfillment/order/na/get", // get product_id
  "/api/fulfillment/na/order/get", // get product_id

  "/api/v1/fulfillment/shipping_doc/generate", // generate shipping docs
];

console.log("🟢 Injected script: Phép thử 3 (Lấy URL an toàn)");

const { fetch: origFetch } = window;
window.fetch = async (...args) => {
    // Lấy URL một cách an toàn
    let url;
    if (typeof args[0] === 'string') {
        url = args[0]; // Nếu là chuỗi thì gán trực tiếp
    } else if (args[0] instanceof Request) {
        url = args[0].url; // Nếu là object Request thì lấy thuộc tính .url
    }

    const response = await origFetch(...args);

    // Vẫn kiểm tra URL như cũ, nhưng giờ `url` đã chắc chắn là chuỗi
    if (url && ENPOINTS.some((i) => url.includes(i))) {
        // Hành động vẫn đang bị tắt để thử nghiệm
        console.log(`[Injected] Đã bắt được URL: ${url} một cách an toàn.`);
        response
          .clone()
          .json()
          .then((data) => {
            window.postMessage({ endpoint: url, data: data }, "*");
          })
          .catch((err) => console.error(err));
    }
    return response;
};