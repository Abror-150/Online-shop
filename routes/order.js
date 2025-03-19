const {Router} = require("express")
const rouleAuthmiddleware = require("../middlewares/auth")
const Order = require("../models/order")
const OrderItem = require("../models/orderItem")
const Product = require("../models/product")
const route = Router()


route.get("/",async(req,res)=>{
    try {
        let data =await Order.findAll()
        res.send(data)
    } catch (error) {
        console.log(error);
        
    }
})
route.post("/",rouleAuthmiddleware(["seller","admin"]),async(req,res)=>{
    let {items} = req.body
    try {
        let newOrder = await Order.create(req.body)
        let orderI = await Promise.all(items.map(async(item)=>{
            const product = Product.findOne({where:{name:item.productName}})
            if(!product){
                return res.status(404).send({message:"product not found"})
            }
              return{
                orderId:newOrder.id,
                productId:product.id,
                count:item.count
              }
        }))
        await OrderItem.bulkCreate(orderI)
            res.send(newOrder)
    } catch (error) {
        console.log(error);
        
    }
})
route.patch("/:id",async(req,res)=>{
    let {id} = req.params
    try {
        let data =await Order.findByPk(id)
        await data.update(req.body)
        res.send(data)
    } catch (error) {
        console.log(error);
           
    }
})
route.patch("/:id",async(req,res)=>{
    let {id} = req.params
    try {
        let data =await Order.findByPk(id)
        await data.destroy()
        res.send(data)
    } catch (error) {
        console.log(error);
           
    }
})

module.exports = route