const mongoose = require("mongoose");
let Schema = mongoose.Schema;

const RefundSchema = new Schema({
    id: {
        type: Number,
        // // required: true   
    },
})

const fulfillmentContentSchema = new Schema({
    // cultivar
    id: {
        type: Number,
    },

    name: {
        type: String,
    },

    quantity: {
        type: Number
    }
})

const DiscountCodeSchema = new Schema({
    code: {
        type: String,
        // // required: true   
    },

    amount: {
        type: Number,
        // // required: true
    },

    type: {
        type: String,
        // // required: true     
    }
})

const PurchasedItemSchema = new Schema({
    id: {
        type: Number,
        // required: true   
    },

    name: {
        type: String,
        // required: true
    },

    quantity: {
        type: Number,
        // required: true     
    },

    price: {
        type: Number,
        // required: true     
    }
})

const ShopifyOrderSchema = new Schema({
    id: {
        type: Number,
        // required: true
    },

    orderNumber: {
        type: String,
        // required: true
    },

    orderDate: {
        type: String,
        // required: true
    },

    deliveryDate: {
        type: String,
        // required: true
    },

    deliveryFee: {
        type: Number,
        // required: true
    },

    email: {
        type: String,
        // required: true  
    },

    note: {
        type: String,
        // // required: true  
    },

    paymentGateway: {
        type: String,
        // required: true
    },

    createdAt: {
        timestamp: {
            type: String,
            // required: true
        },
        staffEmail: {
            type: String,
            // required: true
        },
    },

    // updatedAt:{
    //     timestamp:{
    //         type: String,
    //         // required: true
    //     },
    //     staffEmail:{
    //         type: String,
    //         // // required: true
    //     },
    // },

    closedAt: {
        timestamp: {
            type: String,
            // // required: true
        },
        staffEmail: {
            type: String,
            // // required: true
        },
    },

    paymentStatus: {
        type: String,
        // required: true
    },

    //url
    snapshot: {
        type: String,
        // required: true 
    },

    totalPaid: {
        type: Number,
        // required: true         
    },

    subtotal: {
        type: Number,
        // required: true
    },

    tax: {
        type: Number,
        // // required: true
    },

    discount: {
        type: Number,
        // // required: true
    },

    discountCode: [DiscountCodeSchema],

    items: [PurchasedItemSchema],

    status: {
        type: String,
        // required: true
    },

    shippingFee: {
        type: Number,
        // required: true
    },

    refund: [RefundSchema],

    shipping: {
        customerName: {
            type: String,
            // required: true 
        },

        company: {
            type: String,
            // // required: true            
        },

        phone: {
            type: String,
            // required: true            
        },

        address1: {
            type: String,
            // required: true 
        },

        address2: {
            type: String,
            // // required: true 
        },

        city: {
            type: String,
            // required: true              
        },

        province: {
            type: String,
            // required: true
        },

        zip: {
            type: Number,
            // required: true
        },

        country: {
            type: String,
            // required: true
        },

        latitude: {
            type: Number,
            // required: true
        },

        longitude: {
            type: Number,
            // required: true
        }

    },

    fulfillment: {
        id: {
            type: Number,
        },
        createdAt: {
            type: String,
        },

        logisticCompany: {
            type: String,
        },

        trackingUrl: {
            type: String,
        },
    },

    deliveryStatus: {
        type: String
    },

    content: [fulfillmentContentSchema]
});

const ShopifyOrder = mongoose.model("shopifyOrder", ShopifyOrderSchema, "shopifyOrder");

module.exports = ShopifyOrder;
