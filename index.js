const express = require("express")
const cors = require("cors")
const { MongoClient } = require('mongodb');
require("dotenv").config()


const app = express()
const port = process.env.PORT || 5000

// middileware
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.i5tec.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect()
        // console.log("Database Connected Successfully")
        const database = client.db("Online_Shop")
        const porductCollection = database.collection('products')
        const orderCollection = database.collection("Orders")

        // Get Api
        app.get("/products", async (req, res) => {
            // console.log(req.query)
            const cursor = porductCollection.find({})
            const page = req.query.page
            const size = parseInt(req.query.size) /* parseInt na korle error khabe */
            const count = await cursor.count()
            let products;
            if (page) {
                products = await cursor.skip(page * size).limit(size).toArray()
            }
            else {
                products = await cursor.toArray()   /* cursor.limit er maddome product load er sonkha komanu hoy */
            }
            res.send({
                count,
                products
            })
        })

        // Use POST to get data by Keys 
        app.post('/products/byKeys', async (req, res) => {
            // console.log(req.body)
            const keys = req.body
            const query = { key: { $in: keys } }
            const products = await porductCollection.find(query).toArray()
            res.json(products)
        })

        // ADD ORDERS API
        app.post("/orders", async (req, res) => {
            const order = req.body
            // console.log('order', order)
            const result = await orderCollection.insertOne(order)
            res.json(result)
        })
    }
    finally {
        // await client.close()
    }
}
run().catch(console.dir)

app.get("/", (req, res) => {
    res.send("Sittng Here")
})

app.listen(port, () => {
    console.log(`Listening from ${port}`)
})