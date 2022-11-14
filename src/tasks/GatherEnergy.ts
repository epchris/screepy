import { findEnergyStore } from "utils/FindSource";

export const gatherEnergy = (creep:Creep) => {
  if(!creep.memory.target) {
    console.log("FINDING ENERGY TARGET")
    let source = findEnergyStore(creep.room);
    console.log("Found Energy Store: " + source)
    creep.memory.target = source.id;
  }

  var source = Game.getObjectById(creep.memory.target)
  console.log("GATHERING FROM : " + source)
  if(source instanceof Source) {
    if(creep.harvest(source) == ERR_NOT_IN_RANGE) {
      creep.moveTo(source, {visualizePathStyle: {stroke: "#FFFFFF"}})
    }
  }
  else if(source instanceof StructureContainer) {
    let withdrawResult = creep.withdraw(source, RESOURCE_ENERGY);
    if(withdrawResult == ERR_NOT_IN_RANGE) {
      creep.moveTo(source, {visualizePathStyle: {stroke: "#FFFFFF"}})
    }
    else if(withdrawResult == ERR_NOT_ENOUGH_ENERGY) {
      // Storage ran out of energy, switch to something else
      delete creep.memory.target
    }
    else if(withdrawResult == ERR_BUSY) {
      creep.say("Busy...")
    }
    else {
      console.log("Creep: " + creep.memory.role + ": Withdraw Error: " + withdrawResult)
    }
  }
}
