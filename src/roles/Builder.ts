import { gatherEnergy } from "tasks/GatherEnergy"
import { findEnergyStore, findRoomSource } from "utils/FindSource"
import { RoleRunner } from "./RoleRunner"

export enum BuilderState {
  BUILDING = "building",
  GATHERING = "gathering"
}

export class Builder implements RoleRunner {
  creep:Creep

  constructor(creep:Creep) {
    this.creep = creep
  }

  run() {
    var state = this.creep.memory.state

    // Switch to the correct state based on current state
    if(this.creep.store[RESOURCE_ENERGY] == 0) {
      this.creep.say("🔄 energy")
      this.creep.memory.state = BuilderState.GATHERING
    }
    else if (state != BuilderState.BUILDING && this.creep.store.getFreeCapacity() == 0) {
      this.creep.memory.state = BuilderState.BUILDING
      this.creep.say("🚧 build")
      // Unset the source target so we pick a new one next time
      delete this.creep.memory.target
    }

    if(this.creep.memory.state == BuilderState.BUILDING) {
      // Try to build something that needs building
      var targets = this.creep.room.find(FIND_CONSTRUCTION_SITES)
      if(targets.length) {
        if(this.creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
          this.creep.moveTo(targets[0], {visualizePathStyle: {stroke: "#FFFFFF"}})
        }
      }
      else {
        this.creep.moveTo(25, 25)
      }
    }
    else {
      gatherEnergy(this.creep)
    }
  }
}
