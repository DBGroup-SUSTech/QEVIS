// import {KModes} from "@/utils/algo/KModes";
//
// class AggrEdge {
//   id
//   src
//   dst
//
//   constructor(src, dst) {
//     this.id = src.id + '_' + dst.id
//     this.src = src
//     this.dst = dst
//   }
// }
//
// class AggrNode {
//   id
//   type
//   x0
//   x1
//   y
//   outEdges = []
//   inEdges = []
//
//   constructor(id, type, x0, x1, y) {
//     this.id = id
//     this.type = type
//     this.x0 = x0
//     this.x1 = x1
//     this.y = y
//   }
// }
//
// class AggrAlgo {
//   aggrNodeMap
//   rootId
//
//   distMap
//   clusters
//   allocMap
//
//   constructor(aggrNodeMap, rootId) {
//     this.aggrNodeMap = aggrNodeMap
//     this.rootId = rootId
//   }
//
//   /**
//    * Run the aggregation algorithm and store the result in object
//    */
//   execute() {
//     let pidList = Array.from(this.aggrNodeMap.keys())
//     let k = this.computeK(pidList.length)
//     let centroids = this.getCentroids(k)
//     this.distMap = new Map()
//     pidList.forEach(pid => {
//       this.distMap.set(pid, this.getAllDistances(pid))
//     })
//
//     let algo = new KModes(pidList, centroids,
//       this.distFunc.bind(this), this.centroidsFunc.bind(this))
//     console.log('k-modes', algo)
//     algo.solve()
//
//     this.clusters = algo.clusters
//     this.allocMap = algo.allocMap
//   }
//
//   /**
//    * Get the execution result
//    */
//   getResult() {
//     return {clusters: this.clusters, allocMap: this.allocMap}
//   }
//
//   /**
//    * Get distance from start node to all other nodes
//    * @param startNodeId The id of start node
//    * @returns {Map<String, Number>} The distance map
//    */
//   getAllDistances(startNodeId) {
//     let unvisitedNodes = new Set()
//     Array.from(this.aggrNodeMap.values()).forEach(aNode => {
//       unvisitedNodes.add(aNode)
//     })
//     let costs = new Map()
//     Array.from(this.aggrNodeMap.keys()).forEach(id => {
//       costs.set(id, startNodeId === id ? 0 : Infinity)
//     })
//
//     while (unvisitedNodes.size > 0) {
//       // peek min cost
//       let minCost = Infinity, node
//       for (let otherNode of unvisitedNodes) {
//         let cost = costs.get(otherNode.id)
//         if (minCost > cost || minCost === Infinity) {
//           minCost = cost
//           node = otherNode
//         }
//       }
//       unvisitedNodes.delete(node)
//       // update neighbors
//       node.inEdges.concat(node.outEdges).forEach(edge => {
//         let neighbor = edge.src === node ? edge.dst : edge.src
//         if (!unvisitedNodes.has(neighbor)) {
//           return
//         }
//         let cost = this.getWeight(edge)
//         // update path cost from start node to here
//         if (minCost + cost < costs.get(neighbor.id)) {
//           costs.set(neighbor.id, minCost + cost)
//         }
//       })
//     }
//
//     return costs
//   }
//
//   /**
//    * Get the distance stored in distMap
//    * @param pid1
//    * @param pid2
//    * @returns {Number}
//    */
//   distFunc(pid1, pid2) {
//     return this.distMap.get(pid1).get(pid2)
//   }
//
//   /**
//    * Get the new centroid of a cluster
//    * @param clusterPidList
//    * @returns {String} Id of new centroid
//    */
//   centroidsFunc(clusterPidList) {
//     if (clusterPidList.length === 1) {
//       return clusterPidList[0]
//     } else if (clusterPidList.length === 2) {
//       // because it will choose ambiguous node when # = 2
//       // so handle it specially
//       let node1 = this.aggrNodeMap.get(clusterPidList[0])
//       let node1IsChild = node1.outEdges.find(e => e.dst.id === clusterPidList[1]) !== undefined
//       if (node1IsChild) {
//         return clusterPidList[0]
//       }
//       return clusterPidList[1]
//     }
//     let sums = clusterPidList.map(pid1 => {
//       let sum = 0
//       clusterPidList.forEach(pid2 => {
//         sum += this.distFunc(pid1, pid2)
//       })
//       return sum
//     })
//     let minSum = Infinity, minIdx = -1
//     sums.forEach((sum, i) => {
//       if (minSum > sum || minSum === Infinity) {
//         minSum = sum
//         minIdx = i
//       }
//     })
//     return clusterPidList[minIdx]
//   }
//
//   /**
//    * Compute cluster param k
//    * @param n The total number of points
//    * @returns {number}
//    */
//   computeK(n) {
//     return n
//     // const start = 6
//     // const upperBound = 20
//     // const incrRatio = 1 / 30
//     // if (n <= 6) {
//     //   return n
//     // } else {
//     //   n = (- Math.exp(-(n - start) * incrRatio) + 1)
//     //     * (upperBound - start) + start
//     //   return Math.floor(n)
//     // }
//   }
//
//   // getCentroids(k) {
//   //   let centroids = [this.aggrNodeMap.get(this.rootId)]
//   //   k = this.aggrNodeMap.size - k
//   //   while (k-- > 0) {
//   //     let node = centroids.shift()
//   //     node.inEdges.forEach(e => {
//   //       centroids.push(e.src)
//   //     })
//   //   }
//   //   return centroids.map(c => c.id)
//   // }
//
//   /**
//    * Get initial centroids
//    * @param k
//    * @returns {String[]}
//    */
//   getCentroids(k) {
//     let centroids = Array.from(this.aggrNodeMap.keys())
//       .map(id => this.aggrNodeMap.get(id))
//       .filter(aNode => aNode.outEdges.length > 1)
//       .map(aNode => aNode.id)
//     k -= centroids.length   // suppose <= k for now
//
//     let queue = [this.aggrNodeMap.get(this.rootId)]
//     while (k > 0) {
//       let node = queue.shift()
//       if (!centroids.includes(node.id)) {
//         centroids.push(node.id)
//         --k
//       }
//       node.inEdges.forEach(e => {
//         queue.push(e.src)
//       })
//     }
//
//     return centroids
//   }
//
//   /**
//    * Get the weight of an edge
//    * @param edge
//    * @returns {number}
//    */
//   getWeight(edge) {
//     let src = edge.src, dst = edge.dst
//     let nodeCost = (src.x1 - src.x0 + dst.x1 - dst.x0) / 2,
//         edgeCostX = Math.max(0, dst.x0 - src.x1) ,
//         edgeCostY = Math.abs(dst.y - src.y)
//     // console.log('>>>', edge.id, src.type, dst.type)
//     return hopCost
//       + nodeCostRatio * nodeCost
//       + edgeCostXRatio * edgeCostX
//       + edgeCostYRatio * edgeCostY
//       + (src.outEdges.length <= 1 ? 0 : multiOutCost)
//       + (dst.inEdges.length <= 1 ? 0 : multiInCost)
//       + (src.type === dst.type ? 0 : diffTypeCost)
//   }
//
// }
//
// // Algorithm parameters
// const hopCost = 1000
// const nodeCostRatio = 1
// const edgeCostXRatio = 5
// const edgeCostYRatio = 0.8
// const multiOutCost = 10000
// const multiInCost = 10000
// const diffTypeCost = 20000
//
//
