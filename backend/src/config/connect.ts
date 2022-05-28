import { Cluster, connect } from "couchbase"

async function connectToCluster(): Promise<Cluster> {
    try {
        console.log("Connecting......")
        const cluster: Cluster = await connect("couchbase://cdcouchbase", {
            username: "Administrator",
            password: "bdnr-12345",
            timeouts: {
                kvTimeout: 10000,
                kvDurableTimeout: 10000,
                viewTimeout: 10000,
                queryTimeout: 10000,
                analyticsTimeout: 10000,
                searchTimeout: 10000,
                managementTimeout: 10000
            }
        })
        console.log("Connected......")

        return cluster
    } catch (error) {
        console.log(error)
        console.error("Error connecting to couchbase!")
        throw new Error("Error connecting to couchbase!")
    }
}

export default connectToCluster
