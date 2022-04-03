"use strict"

import { Bucket, Cluster, Collection, connect, GetResult, MutationResult } from "couchbase"

async function main() {
    const cluster: Cluster = await connect("couchbase://localhost", {
        username: "Administrator",
        password: "password"
    })

    // get a reference to our bucket
    const bucket: Bucket = cluster.bucket("travel-sample")

    // get a reference to a collection
    const collection: Collection = bucket.scope("inventory").collection("airline")

    // get a reference to the default collection, required for older Couchbase server versions
    // const collection_default: Collection = bucket.defaultCollection()

    interface Document {
        type: string
        id: number
        callsign: string
        iata: string
        icao: string
        name: string
    }

    const airline: Document = {
        type: "airline",
        id: 8091,
        callsign: "CBS",
        iata: "IATA",
        icao: "ICAO",
        name: "Couchbase Airways"
    }

    const upsertDocument = async (doc: Document) => {
        try {
            // key will equal: "airline_8091"
            const key = `${doc.type}_${doc.id}`
            const result: MutationResult = await collection.upsert(key, doc)
            console.log("Upsert Result: ")
            console.log(result)
        } catch (error) {
            console.error(error)
        }
    }

    await upsertDocument(airline)

    const getAirlineByKey = async (key: string) => {
        try {
            const result: GetResult = await collection.get(key)
            console.log("Get Result: ")
            console.log(result)
        } catch (error) {
            console.error(error)
        }
    }

    await getAirlineByKey("airline_8091")
}

// Run the main function
main()
    .catch((err) => {
        console.log("ERR:", err)
        process.exit(1)
    })
    .then(() => process.exit(0))
