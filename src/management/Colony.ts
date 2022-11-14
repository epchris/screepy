import { Builder } from "roles/Builder"
import { Fixer } from "roles/Fixer"
import { Harvester } from "roles/Harvester"
import { NoRunner, RoleRunner } from "roles/RoleRunner"
import { LightBuilderSpawner, LightFixerSpawner, LightHarvesterSpawner, LightUpgraderSpawner, MediumBuilderSpawner, MediumFixerSpawner, MediumHarvesterSpawner, MediumUpgraderSpawner, Roles, Spawnable } from "roles/Roles"
import { Upgrader } from "roles/Upgrader"

export class Colony {
  room: Room
  spawn: StructureSpawn
  sources: Array<Source>
  creeps: Array<Creep>
  spawners: Map<string, Array<Spawnable>>
  wantedCreeps: Map<string, number>

  constructor(spawn:StructureSpawn) {
    this.spawn = spawn
    this.room = spawn.room
    this.sources = this.discoverSources().map(id => Game.getObjectById(id) as Source)
    this.creeps = new Array<Creep>
    this.spawners = this.buildSpawners()
    this.wantedCreeps = new Map<string, number>([
      ["harvester", 6],
      ["upgrader", 5],
      ["builder", 6],
      ["fixer", 4]
    ])

    // Set up spawn memory if not initialized
    if(this.spawn.memory.activeCreeps == undefined) {
      console.log("Initializing spawn active Creeps array")
      this.spawn.memory.activeCreeps = new Array<string>()
    }
  }

  /**
  * Runs management of this colony
  */
  manage() {
    this.cleanupCreeps();
    this.hydrateCreeps();
    // Attempt to spawn a creep if not spawning already
    if(!this.spawn.spawning) { this.spawnCreep(); }
    this.runCreeps();
  }

  /**
   * Cleans up creeps that were active but are no longer in the game.
   */
  private cleanupCreeps() {
    let liveCreeps = new Array<string>()
    console.log("Active Creeps: " + this.spawn.memory.activeCreeps)
    for(var creepName of this.spawn.memory.activeCreeps) {
      if (!(creepName in Game.creeps)) {
        console.log("Creep " + creepName + " no longer alive")
      }
      else {
        liveCreeps.push(creepName)
      }
    }
    console.log("Managing " + liveCreeps.length + " creeps after cleanup")
    this.spawn.memory.activeCreeps = liveCreeps
  }

  private runCreeps() {
    let runner : RoleRunner
    for(const creep of this.creeps) {
      let creepRole = creep.memory.role
      if(creepRole == "harvester") {
        runner = new Harvester(creep);
      }
      else if(creepRole == "upgrader") {
        runner = new Upgrader(creep);
      }
      else if(creepRole == "builder") {
        runner = new Builder(creep);
      }
      else if(creepRole == "fixer") {
        runner = new Fixer(creep)
      }
      else {
        console.log("Creep with unkonwn role: " + creep)
        runner = new NoRunner()
      }
      // Run the creep
      runner.run()
    }
  }

  private buildSpawners() {
    return new Map<string, Array<Spawnable>>([
      ["harvester", [new LightHarvesterSpawner(), new MediumHarvesterSpawner()]],
      ["upgrader", [new LightUpgraderSpawner(), new MediumUpgraderSpawner()]],
      ["builder", [new LightBuilderSpawner(), new MediumBuilderSpawner()]],
      ["fixer", [new LightFixerSpawner(), new MediumFixerSpawner()]]
    ])
  }

  /**
   * Loads creeps that were previously managed by this colony
   */
  private hydrateCreeps() {
    for(var creepName of this.spawn.memory.activeCreeps) {
      let creep = Game.creeps[creepName]
      if(!creep.spawning) {
        this.creeps.push(creep)
      }
      else {
        console.log("Creep " + creep.name + " is still spawning...")
      }
    }
  }

  /**
   * Check to see if we need more creeps, spawn them if we do
   */
  private spawnCreep() {
    console.log("Spawning creeps...")
    let roleCounts = new Map<string, number>([
      ["harvester", 0],
      ["upgrader", 0],
      ["fixer", 0],
      ["builder", 0]
    ])

    const getRoleCount = (id:string) => roleCounts.get(id) ?? 0
    this.creeps.map(creep => creep.memory.role)
      .forEach(role => roleCounts.set(role, getRoleCount(role) + 1));

    // small function to check if the result was a string, a name, indicating that the crepe
    // was queued to be spawned
    const isString = (x:string|ScreepsReturnCode) : x is string => typeof x === "string"

    for(let [role, roleCount] of roleCounts) {
      let wanted = this.getWantedCreeps(role)
      if(roleCount < wanted) {
        let spawnResult = this.spawnCreepOfRole(role)
        if(isString(spawnResult)) {
          console.log("Spawned " + role + ": " + spawnResult)
          this.spawn.memory.activeCreeps.push(spawnResult)
          return
        }
      }
      else {
        console.log("Not spawning " + role + ": " + roleCount + "/" + wanted)
      }
    }
  }

  private getWantedCreeps(role:string) {
    return this.wantedCreeps.get(role) ?? 0
  }

  /**
  *
  * @returns Array of source IDs energy sources for this colony, candidates for retrieval
  */
  private discoverSources() {
    let memorySources = this.room.memory.sources

    if(memorySources == undefined || memorySources.length == 0) {
      this.room.memory.sources = this.room.find(FIND_SOURCES).map(source => source.id)
    }
    return this.room.memory.sources
  }

  private spawnCreepOfRole(role:string) : string | ScreepsReturnCode {
    let availableEnergy = this.room.energyAvailable;
    let spawners = this.spawners.get(role) ?? new Array<Spawnable>()
    if(spawners.length == 0) {
      console.log("No spawners for role: " + role + "!")
      return ERR_INVALID_TARGET
    }

    // Reverse sort the spawners, try to build the biggest creep for the request role
    let creep : Creep|ScreepsReturnCode
    let spawnable = spawners.sort((a,b) => b.requiredEnergy() - a.requiredEnergy()).find((spawnable) => {
      return spawnable.requiredEnergy() < availableEnergy
    })

    if(spawnable) {
      return spawnable.spawn(this.spawn)
    }
    else {
      console.log("Could not spawn " + role + ", probably lacking energy")
      return ERR_INVALID_TARGET
    }
  }
}
