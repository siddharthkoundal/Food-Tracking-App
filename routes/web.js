const authController = require("../app/http/controllers/authController");
const cartController = require("../app/http/controllers/customers/cartController");
const homeController = require("../app/http/controllers/homeController");
const orderController = require("../app/http/controllers/customers/orderController");
const AdminOrderController = require("../app/http/controllers/admin/orderController");
const statusController = require("../app/http/controllers/admin/statusController");

//Middlewares
const auth = require("../app/http/middlewares/auth");
const admin = require("../app/http/middlewares/admin");
const guest = require("../app/http/middlewares/guest");

function initRoutes(app) {
  app.get("/", homeController().index);

  app.get("/cart", cartController().index);

  app.post("/update-cart", cartController().update);

  app.get("/login", guest, authController().login);

  app.post("/login", guest, authController().postLogin);

  app.get("/register", authController().register);

  app.post("/register", authController().postRegister);

  app.post("/logout", authController().logout);

  app.post("/orders", orderController().store);

  //Customer routes

  app.post("/orders", auth, orderController().store);

  app.get("/customer/orders", auth, orderController().index);

  app.get("/customer/orders/:id", auth, orderController().show);

  //Admin Routes

  app.get("/admin/orders", admin, AdminOrderController().index);

  app.post("/admin/order/status", admin, statusController().update);
}

module.exports = initRoutes;
