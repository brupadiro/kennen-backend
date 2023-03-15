const axios = require("axios");
const qs = require("qs");


const getAddressData = async function (addressId, config) {
  const apiUrl = `https://purpleshopweb.com/api/addresses/${addressId}?output_format=JSON`;



  const response = await axios.get(apiUrl, config);
  const data = response.data;
  return data;
}

// Obtener información de un cliente
const getCustomerData = async function (customerId, config) {
  const apiUrl = `https://purpleshopweb.com/api/customers/${customerId}?output_format=JSON`;
  const response = await axios.get(apiUrl, config);
  console.log(response.data)
  const data = response.data;
  return data;
}


module.exports = {

    async orderList(ctx) {
        try {
          const response = await await strapi.service('api::webservice.webservice').getPayments(ctx)
          const orders = response.data.orders;
          return orders;
        }catch {
          console.log("aca")
          return []
        }
      },
  
  
      async order(ctx) {
        const {
          id
        } = ctx.params;
  
  
  
        // Obtener información de una orden
        const getOrderData = async function (orderId, config) {
          const apiUrl = `https://purpleshopweb.com/api/orders/${orderId}?output_format=JSON`;
          const response = await axios.get(apiUrl, config);
          const data = response.data;
          return data;
        }
  
        // Función principal que recorre los datos de la orden y consulta información adicional
        async function getOrderInfo(orderData, config) {
  
  
  
          const customerId = orderData.order.id_customer;
          const deliveryAddressId = orderData.order.id_address_delivery;
  
          // Obtener información adicional de las direcciones
          const deliveryAddress = await getAddressData(deliveryAddressId, config);
  
          // Obtener información adicional del cliente
          const customerData = await getCustomerData(customerId, config);
  
          // Obtener información de los productos de la orden
          // Crear objeto JSON con toda la información
          const orderInfo = {
            order: orderData.order,
            deliveryAddress: deliveryAddress.address,
            customerData: customerData.customer,
          };
          return orderInfo;
        }
        const apiToken = "QVSJ7LNVIL8KBE5SZ1GQ61T8BQ2GM8H7";
  
        const config = {
          headers: {
            Authorization: `Basic ${Buffer.from(`${apiToken}:`).toString("base64")}`
          }
        };
  
  
        const orderData = await getOrderData(id, config)
  
        const order = await getOrderInfo(orderData, config)
  
  
        return order
  
      },
      async orderListAllStores(ctx) {


        const {user} = ctx.state
        const {company} = ctx.request.query
        const stores = await strapi.db.query('api::webservice.webservice').findMany({
          where: { company: company} ,
        });
        var limit = 10
        if(ctx.query.pagination.page){
          let startItems = (ctx.query.pagination.page -1) *10
          limit = `${startItems},10`
        }
        console.log(limit)
        const orders = await Promise.all(stores.map(async (store) => {
            const storeOrders = await this.orderList({query:{limit:limit},params:{id:store.id}});
            // Agregamos el nombre de la tienda a cada pedido
            storeOrders.forEach(order => order.storeName = store.name);
            return storeOrders;
  
        }));
      
        // Extraemos los pedidos de cada tienda en un solo array
        const allOrders = orders.flat();
      
        // Agregamos esta línea para extraer la fecha de cada pedido
        allOrders.forEach(order => order.date = new Date(order.date_add));
      
        // Usamos el método sort() para ordenar los pedidos por fecha
        allOrders.sort((a, b) => b.date - a.date);
        return allOrders;
      },
      async payments(ctx){
        const {method} = ctx.query;
        // Hacemos la petición GET a la API de PrestaShop
        const response = await strapi.service('api::webservice.webservice').getPayments(ctx)
        if (method == 'day'){
          payments =  strapi.service('api::webservice.webservice').paymentsByDay(response.data.orders)
        } else if(method == 'product') {
          payments = strapi.service('api::webservice.webservice').paymentsByProduct(response.data.orders)
        } else {
          payments = strapi.service('api::webservice.webservice').paymentsByDayAndMethod(response.data.orders)
        }
        return payments                

      },
      async customers(ctx) {
        const {
          page,
          state
        } = ctx.query;
  
        const {id} = ctx.params;
        const store = await strapi.db.query('api::webservice.webservice').findOne({
          where: { id: id },
        });
        var limit = 10
        if(ctx.query.pagination.page){
          let startItems = (ctx.query.pagination.page -1) *10
          limit = `${startItems},10`
        }
        console.log(limit)

              
        // Configuración para conectarnos a la API de PrestaShop
        const apiKey = store.apiKey;
        const apiUrl = `${store.url}/api/customers`;
        const config = {
          headers: {
            Authorization: `Basic ${Buffer.from(`${apiKey}:`).toString("base64")}`
          },
          params: {
              output_format: "JSON",
            display: "full",
            limit: limit,
            sort: "id_DESC"
          },
          paramsSerializer: function (params) {
              return qs.stringify(params, {
                  arrayFormat: "brackets"
              });
          },
  
        };
        // Hacemos la petición GET a la API de PrestaShop
        var customers = []
        try{
          const response = await axios.get(apiUrl, config);
          customers = response.data.customers
        } catch {
          console.log("error")
        }
  
        return customers;

      }    
}