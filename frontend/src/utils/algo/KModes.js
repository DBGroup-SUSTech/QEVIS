class KModes {
  pidList
  centroids
  distFunc        // (pid1, pid2) => distance
  centroidFunc    // [pid] => pid of centroid

  allocMap
  clusters
  distMap

  constructor(pidList, centroids, distFunc, centroidFunc) {
    this.pidList = pidList
    this.centroids = centroids
    this.distFunc = distFunc
    this.centroidFunc = centroidFunc

    this.init()
  }

  init() {
    this.allocMap = new Map()
    this.pidList.forEach(pid => {
      if (this.centroids.indexOf(pid) === -1) {
        this.allocMap.set(pid, null)
      } else {
        this.allocMap.set(pid, pid)
      }
    })

    this.distMap = this.computeDistances()
  }

  computeDistances() {
    let distMap = new Map()
    for (let i = 0; i < this.pidList.length - 1; ++i) {
      let pid1 = this.pidList[i]
      for (let j = 0; j < this.pidList.length; ++j) {
        let pid2 = this.pidList[j]
        let dist = this.distFunc(pid1, pid2)
        distMap.set(this.getPairId(pid1, pid2), dist)
      }
    }
    return distMap
  }

  getPairId(pid1, pid2) {
    if (pid1 > pid2) {
      [pid1, pid2] = [pid2, pid1]
    }
    return `${pid1}_${pid2}`
  }

  solve() {
    let turn = 0
    while (turn++ < 100) {
      let notChanged = true
      this.pidList.forEach(pid => {
        let minDist = Infinity, closest = null
        this.centroids.forEach(c => {
          let dist = this.distMap.get(this.getPairId(pid, c))
          if (minDist > dist || minDist === Infinity) {
            minDist = dist
            closest = c
          }
        })
        if (closest !== this.allocMap.get(pid)) {
          this.allocMap.set(pid, closest)
          notChanged = false
        }
      })

      // recompute centroids
      let clusters = this.clusters = new Map()
      Array.from(this.allocMap).forEach(([id, centroid]) => {
        if (clusters.has(centroid)) {
          clusters.get(centroid).push(id)
        } else {
          clusters.set(centroid, [id])
        }
      })

      if (notChanged) {
        break
      }

      this.centroids = Array.from(clusters.values()).map(cluster => {
        return this.centroidFunc(cluster)
      })
    }
    console.log('k-modes finished in ' + turn + 'turns')
  }
}

export {
  KModes
}
