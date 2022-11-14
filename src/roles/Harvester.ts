import { findRoomSource } from "utils/FindSource";
import { Builder } from "./Builder";
import { RoleRunner } from "./RoleRunner";
import { BaseCreepSpawner } from "./Roles";

export class Harvester implements RoleRunner {
  creep:Creep
  room:Room

  /**
   * Priorities for building certain things, lower number is higher priority
   */
  static TargetPriorities = new Map<string, number>([
    [STRUCTURE_SPAWN, 1],
    [STRUCTURE_EXTENSION, 2],
    [STRUCTURE_CONTAINER, 3]
  ]);

  constructor(creep:Creep) {
    this.creep = creep
    this.room = creep.room
  }

  run() {
    if(this.creep.store.getFreeCapacity() > 0) {
      if(!this.creep.memory.target) {
        let source = findRoomSource(this.creep.room)
        this.creep.memory.target = source.id;
      }

      let target = Game.getObjectById(this.creep.memory.target) as Source
      if(this.creep.harvest(target) == ERR_NOT_IN_RANGE) {
        this.creep.moveTo(target, {visualizePathStyle: {stroke: '#ffaa00'}});
      }
    }
    else {
      delete this.creep.memory.target
      this.deliver();
    }
  }

  /**
   * Returns an array of targets sorted by priority
   */
  private deliver() {
    let sortedStorageTargets = this.room.find(FIND_STRUCTURES)
    .filter(this.isStorageType)
    .filter(this.storageHasRoom)
    .sort((a, b) => {
      return this.getStoragePriority(a) - this.getStoragePriority(b)
    })

    if(sortedStorageTargets.length > 0) {
      let target = sortedStorageTargets[0]
      if(this.creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        this.creep.moveTo(target);
      }
    }
  }

  private getStoragePriority(storage : AnyStructure) {
    let priority = Harvester.TargetPriorities.get(storage.structureType)
    if(priority !== undefined) {
      return priority;
    } else {
      // Default priority is always lowest
      return 100;
    }
  }

  /**
   * Fiters for storage types that need energy
   *
   * @param structure
   * @returns
   */
  private storageHasRoom(structure : AnyStoreStructure) {
    // Only accept types that have storage we can deliver to
    return structure.store.getFreeCapacity(RESOURCE_ENERGY)
  }

  /**
   * Checks that the object is a storage type
   *
   * @param obj object to check
   * @returns boolean, narrows object to storage type
   */
  private isStorageType(obj:any) : obj is AnyStoreStructure {
    if((obj as AnyStoreStructure).store) {
      return true
    }
    else {
      return false
    }
  }
};


