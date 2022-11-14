import { object } from "lodash"
import { generateRandomNumber } from "utils/GenerateRandomNumber"

export enum Roles {

}

export interface CreepRoleDefinition{
  parts(): Array<BodyPartConstant>
  spawn(spawner: StructureSpawn): string | ScreepsReturnCode
  requiredEnergy(): number
}

export abstract class Spawnable implements CreepRoleDefinition {
  protected abstract generateName() : string
  abstract parts() : Array<BodyPartConstant>
  abstract requiredEnergy(): number
  abstract role(): string

  spawn(spawner: StructureSpawn) : string | ScreepsReturnCode {
    let name = this.generateName()
    console.log("Spawning " + this.role() + ": " + name)
    let returnCode = spawner.spawnCreep(
      this.parts(),
      name,
      {memory: {role: this.role(), room: spawner.room.name, working: false}}
    )

    if(returnCode == OK) {
      return name
    }
    else {
      console.log("Could not spawn: " + returnCode)
      return returnCode
    }
  }
}

export abstract class BaseCreepSpawner extends Spawnable implements CreepRoleDefinition {
  abstract namePrefix() : string

  requiredEnergy() : number {
    return this.parts().map(x => BODYPART_COST[x]).reduce((prev, current) => prev + current)
  }

  protected generateName() {
    return this.namePrefix() + generateRandomNumber(0, 10000)
  }
}

export class LightHarvesterSpawner extends BaseCreepSpawner {
  namePrefix() : string { return "LH" }
  role() : string { return "harvester" }
  parts() {
    return [WORK,CARRY,MOVE]
  }
}

export class MediumHarvesterSpawner extends BaseCreepSpawner {
  namePrefix() : string { return "MH" }
  role() : string { return "harvester" }
  parts() {
    return [WORK,WORK,CARRY,MOVE,MOVE]
  }
}

export class HeavyHarvesterSpawner extends BaseCreepSpawner {
  namePrefix() : string { return "HH" }
  role() : string { return "harvester" }
  parts() {
    return [WORK,WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE]
  }
}

export class LightBuilderSpawner extends BaseCreepSpawner {
  namePrefix() : string { return "LB" }
  role() : string { return "builder" }
  parts() {
    return [WORK,CARRY,MOVE]
  }
}

export class MediumBuilderSpawner extends BaseCreepSpawner {
  namePrefix() : string { return "MB" }
  role() : string { return "builder" }
  parts() {
    return [WORK,WORK,CARRY,MOVE,MOVE]
  }
}

export class LightFixerSpawner extends BaseCreepSpawner {
  namePrefix() : string { return "LF" }
  role() : string { return "fixer" }
  parts() {
    return [WORK,CARRY,MOVE]
  }
}

export class MediumFixerSpawner extends BaseCreepSpawner {
  namePrefix() : string { return "MF" }
  role() : string { return "fixer" }
  parts() {
    return [WORK,WORK,CARRY,MOVE,MOVE]
  }
}

export class LightUpgraderSpawner extends BaseCreepSpawner {
  namePrefix() : string { return "LU" }
  role() : string { return "upgrader" }
  parts() {
    return [WORK,CARRY,MOVE]
  }
}

export class MediumUpgraderSpawner extends BaseCreepSpawner {
  namePrefix() : string { return "MU" }
  role() : string { return "upgrader" }
  parts() {
    return [WORK,WORK,CARRY,MOVE,MOVE]
  }
}

export class LightMeleeSpawner extends BaseCreepSpawner {
  namePrefix() : string { return "LM" }
  role() : string { return "melee" }
  parts() {
    return [ATTACK,CARRY,MOVE]
  }
}

