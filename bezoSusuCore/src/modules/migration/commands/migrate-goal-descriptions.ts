import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { Console, Command } from 'nestjs-console';
import { EntityManager } from 'typeorm';

import { GoalTypeEntity } from '../../savings-goal/entities/goal-type.entity';
import { STATUS } from '../../auth/entities/enums/status.enum';

@Console()
export class MigrateGoalDescriptionCommand {
  private db: Connection;
  constructor(
    private em: EntityManager,
    @InjectConnection() private connection: Connection,
  ) {
    this.db = this.connection.useDb('bezosusuDBLive');
  }

  @Command({
    command: 'migrate:goal-descriptions',
    options: [
      {
        flags: '--type <type>',
        required: false,
      },
    ],
  })
  async execute(opts?: any) {
    try {
      return await this._execute(opts);
    } catch (e) {
      console.error(e);
      return 1;
    }
  }

  async _execute(opts?: any) {
    await this.migrateAccountTypes();
  }

  // load account type

  async getAccountTypes() {
    const accountTypes = await this.db
      .collection('account_type')
      .find()
      .toArray();
    return accountTypes;
  }

  async migrateAccountTypes() {
    console.log('Migrating account types ....');
    const accountTypes = await this.getAccountTypes();
    console.log('accountTypes', accountTypes);
    for (const accountType of accountTypes) {
      if (accountType.name.toLowerCase() === 'primary') {
        continue;
      }
      const goalType = new GoalTypeEntity();
      goalType.name = accountType.name;
      goalType.status = accountType.active ? STATUS.active : STATUS.disabled;
      goalType.type = accountType.type;
      goalType.description = accountType.description;
      console.log('Saving goal type: ', goalType);
      await this.saveGoalType(goalType);
    }
    console.log('Migration complete ....');
  }

  async saveGoalType(data: GoalTypeEntity) {
    await this.em
      .findOne(GoalTypeEntity, {
        where: { name: data.name },
      })
      .then(async (goal: any) => {
        if (!goal) {
          await this.em.save(data);
        }
        if (goal) {
          await this.em.update(GoalTypeEntity, goal.id, {
            description: data.description,
          });
        }
      });
  }
}
