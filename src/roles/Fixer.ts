import { gatherEnergy } from "tasks/GatherEnergy";
import { RoleRunner } from "./RoleRunner";

export enum FixerState {
  FIXING = "fixing",
  GATHERING = "gathering"
}

export class Fixer implements RoleRunner {
  creep: Creep
  constructor(creep: Creep) {
    this.creep = creep
  }

  run() {
    // Get energy if needed
    let freeEnergyCapacity = this.creep.store.getFreeCapacity(RESOURCE_ENERGY);
    let carriedEnergy = this.creep.store.getUsedCapacity(RESOURCE_ENERGY);
    let totalCapacity = this.creep.store.getCapacity(RESOURCE_ENERGY);
    let initialState = this.creep.memory.state;

    console.log("STATE: "+ initialState)
    // If there was no initial state, we want to start by gathering
    if(!initialState || (initialState == FixerState.FIXING && carriedEnergy == 0)) {
      this.creep.memory.state = FixerState.GATHERING;
      delete this.creep.memory.target
      this.creep.say("Gather");
    }

    // We weren't fixing, but we're full on energy, so get to it
    if(initialState != FixerState.FIXING && carriedEnergy == totalCapacity) {
      this.creep.memory.state = FixerState.FIXING;
      delete this.creep.memory.target
      this.creep.say("Fix")
    }


    if(this.creep.memory.state == FixerState.GATHERING) {
      gatherEnergy(this.creep);
    }
    else {
      if(!this.creep.memory.target) {
        let repairTarget = this.findRepairTarget(this.creep.room)
        if(repairTarget !== undefined) {
          this.creep.memory.target = repairTarget.id
        }
        else {
          this.creep.say("Idle")
          this.creep.moveTo(35, 35)
          return
        }
      }

      let target = Game.getObjectById(this.creep.memory.target) as AnyStructure
      if(target) {
        if(this.creep.repair(target) == ERR_NOT_IN_RANGE) {
          this.creep.moveTo(target, {visualizePathStyle: {stroke: "#ffaa00"}})
        }
      }
      else {
        this.creep.say("Idle")
        this.creep.moveTo(35, 35)
      }
    }
  }

  private findRepairTarget(room:Room) {
    let structures = room.find(FIND_STRUCTURES)
    let repairCandidates = Array<AnyStructure>()
    repairCandidates.push(...structures.filter(this.filterForWalls))
    repairCandidates.push(...structures.filter(this.filterForRoads))
    repairCandidates.push(...room.find(FIND_MY_STRUCTURES))

    const RepairAmounts = new Map<string, number>([
      [STRUCTURE_WALL, 5000],
      [STRUCTURE_CONTAINER, 100000]
    ])

    return repairCandidates.filter((structure) => {
      console.log("Structure: " + structure.structureType + "hits: " + structure.hits)
      let targetHits = RepairAmounts.get(structure.structureType)
      if(targetHits === undefined) {
        targetHits = structure.hitsMax * 0.25
      }
      return structure.hits < targetHits
    }).sort(() => 0.5 - Math.random())[0]
  }

  private filterForWalls(structure: AnyStructure) : structure is StructureWall {
    return (structure as StructureWall).hits !== undefined;
  }

  private filterForRoads(structure: AnyStructure) : structure is StructureRoad {
    return (structure as StructureRoad).hits !== undefined;
  }
}
