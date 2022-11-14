
export const findRoomSource = (room: Room) => {
  return room.find(FIND_SOURCES).sort(() => 0.5 - Math.random())[0]
}

export const findEnergyStore = (room: Room) => {
  // First try to find containers that have energy
  let energyContainers = room.find(FIND_STRUCTURES)
    .filter(
      (structure) => { return structure.structureType == STRUCTURE_CONTAINER }
    ).map((x) => { return x as StructureContainer })
    .filter((container) => {
        return container.isActive() && container.store.getUsedCapacity(RESOURCE_ENERGY) > 0
    })

  if(energyContainers.length) {
    console.log("Getting energy from container: " + energyContainers[0])
    return energyContainers[0]
  }

  let source = findRoomSource(room)
  console.log("Getting energy from source: " + source)
  return source
}
