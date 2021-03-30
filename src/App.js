import Model from './Model';
import Api from './Api';

export default class App {
  constructor(name) {
    this.model = new Model();
    this.NAME = name;
    this.GAMEID = undefined;

    this.STATES = {
      MOVE_DOWN: 'MOVE_DOWN',
      CHASE: 'CHASE',
    };
    this.enemies = [
      {
        rank: 1,
        createDelay: 1500,
        life: 50,
        score: 25,
        shootTimer: 4000,
        maxNumber: 10,
        state: this.STATES.MOVE_DOWN,
        speed: 100,
        weapon: {
          speed: 150,
        },
      },
      {
        rank: 2,
        createDelay: 1500,
        life: 200,
        score: 50,
        shootTimer: 1000,
        maxNumber: 10,

        state: this.STATES.MOVE_DOWN,
        speed: 500,
        weapon: {
          speed: 300,
        },
      },
      {
        rank: 3,
        createDelay: 1000,
        life: 300,
        score: 100,
        shootTimer: 500,
        maxNumber: 10,
        state: this.STATES.MOVE_DOWN,
        speed: 125,
        weapon: {
          speed: 100,
        },
      },

    ];
    this.ranks = 4;
    this.lasers = this.generateLasers();
    this.stages = [];

    this.player = {
      name: this.model.name,
      score: this.model.score,
      level: this.model.level,
      rank: this.model.rank,
      weapon: this.getLaser(1),
    };
    this.stages = this.generateStages();

    this.leaders = null;

    this.stageNumber = 0;

    this.createGame();
  }

  generateLasers() {
    const lasers = [];
    for (let rank = 1; rank <= this.ranks; rank += 1) {
      for (let level = 1; level <= 5; level += 1) {
        const laser = {
          name: 'Laser',
          rank,
          level,
          fire: 50 * (0.5 * level * rank),
          timerShootDelay: 30 - (5 * level),
          speed: -(200 + (200 * level)),
        };
        lasers.push(laser);
      }
    }
    return lasers;
  }

  generateStages() {
    let nRanks = 0;
    const stages = [];
    for (let rank2 = 1; rank2 <= this.ranks; rank2 += 1) {
      for (let level = 1; level <= 5; level += 1) {
        nRanks += 1;
        const stage = {
          name: `Stage ${nRanks}`,
          targetScore: 300 + (500 * (1 + (nRanks * 2.5))),
          timeLimit: 1 + (30 * (1 + (nRanks * 0.1))),
          enemies: [
            {
              name: 'GunShip',
              rank: 1,
              maxNumber: (20 * (1 + ((nRanks * 25) / 100))),
              createDelay: 500,
              speed: (75 * (1 + ((level * 5) / 100))),
              life: (20 * (1 + ((level * 25) / 100))),
              shootTimer: this.getRandomIntInclusive(2000, 5000),
            },
            {
              name: 'GunShip',
              rank: 2,
              maxNumber: Math.ceil((nRanks / 2) - (1 * (1 + (level * 0.5)))),
              createDelay: 1000 - (1000 * 0.04 * nRanks),
              speed: (200 * (1 + ((level * 5) / 100))),
              life: (20 * (1 + ((level * 25) / 100))),
              shootTimer: this.getRandomIntInclusive(1500, 2000),
            },
            {
              name: 'ChaserShip',
              rank: 3,
              maxNumber: Math.ceil((nRanks / 2.5) - (1 * (1 + (level * 0.5)))),
              createDelay: 1000 - (1000 * 0.04 * nRanks),
              speed: (150 * (1 + ((level * 5) / 100))),
              life: (20 * (1 + ((level * 25) / 100))),
            },
            {
              name: 'CarrierShip',
              rank: 4,
              maxNumber: Math.ceil((nRanks / 4) - (1 * (1 + (level * 0.5)))),
              createDelay: 1000 - (1000 * 0.06 * nRanks),
              speed: (100 * (1 + ((level * 5) / 100))),
              life: (20 * (1 + ((level * 25) / 100))),
            },
          ],
          player: { ...this.player, weapon: this.getLaser(nRanks) },
        };
        stages.push(stage);
      }
    }
    return stages;
  }

  getLaser(level) {
    if (this.lasers && this.lasers[level - 1] !== undefined) {
      return this.lasers[level - 1];
    }
    return false;
  }

  async createGame() {
    this.api = await new Api(this.NAME);
    this.getScores();
  }

  score(value) {
    if (value && Number.isInteger(value) && value > 0) {
      this.model.score += value;
      return this.model.score;
    }
    return false;
  }

  getStage() {
    return this.stage;
  }

  levelUp() {
    this.model.level += 1;
    return this.model.level;
  }

  canLevelUp(time) {
    if (this.stage.timeLimit <= time) {
      this.stageNumber += 1;
      return true;
    }
    return false;
  }

  loadStage() {
    if (this.stages[this.stageNumber]) {
      this.stage = this.stages[this.stageNumber];
      return true;
    }
    return false;
  }

  getEnemies(stageEnemy) {
    if (stageEnemy && typeof stageEnemy === 'object') {
      this.enemies.forEach((enemy) => {
        if (stageEnemy.rank === enemy.rank) {
          stageEnemy = { ...enemy, ...stageEnemy };
        }
      });
      return stageEnemy;
    }

    return false;
  }

  gameOver() {
    this.api.saveScrore(this.GAMEID, this.player.name, this.model.score);
    this.model.score = 0;
    this.model.gameOver = false;
    this.stageNumber = 0;
  }

  setPlayerName(name) {
    this.player.name = name;
    return this.player.name;
  }

  async getScores() {
    this.model.leaders = await this.api.getScores(this.GAMEID);
    this.model.leaders.sort((a, b) => b.score - a.score);
    this.model.leaders = this.model.leaders.slice(0, 10);
    return this.model.leaders;
  }

  getRandomIntInclusive(min, max) {
    this.random = { min, max };
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
}
