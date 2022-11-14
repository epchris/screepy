import { gatherEnergy } from "tasks/GatherEnergy";
import { RoleRunner } from "./RoleRunner";

export enum UpgraderState {
  UPGRADING = "upgrading",
  GATHERING = "gathering"
}

export class Upgrader implements RoleRunner {
  creep:Creep;
  constructor(creep: Creep) {
    this.creep = creep
  }

  run() {
    let freeEnergyCapacity = this.creep.store.getFreeCapacity(RESOURCE_ENERGY);
    let carriedEnergy = this.creep.store.getUsedCapacity(RESOURCE_ENERGY);
    let totalCapacity = this.creep.store.getCapacity(RESOURCE_ENERGY);
    let initialState = this.creep.memory.state;

    // If there was no initial state, we want to start by gathering
    if(!initialState || (initialState == UpgraderState.UPGRADING && carriedEnergy == 0)) {
      this.creep.memory.state = UpgraderState.GATHERING;
      this.creep.say("Gather");
    }

    // We weren't building, but we're full on energy, so get to it
    if(initialState != UpgraderState.UPGRADING && carriedEnergy == totalCapacity) {
      this.creep.memory.state = UpgraderState.UPGRADING;
      this.creep.say("Upgrade")
    }

    if(this.creep.memory.state == UpgraderState.GATHERING) {
      gatherEnergy(this.creep)
    }
    else {
      let controller = this.creep.room.controller;

      if(controller) {
        if(this.creep.upgradeController(controller) == ERR_NOT_IN_RANGE) {
          this.creep.moveTo(controller, {visualizePathStyle: {stroke: "#ffaa00"}})
        }
      }
      else {
        this.creep.say("No Controller")
      }
    }
  }
};
