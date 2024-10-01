import AffordanceEntity from "./AffordanceEntity";

const DELAYMS = 666; // TODO: make this a smart delay

export default class CollectingScheduler {
  schedule: any[];
  constructor() {
    // console.log("Collecting Scheduler initialised");
    this.schedule = [];
  }

  async queueAffordance(affordance: AffordanceEntity) {
    this.schedule.push(affordance);
    // console.log("Affordance queued: ", affordance);
    if (this.schedule.length === 1) {
      // only restart scheduler if it was empty before
      this.queueNextInSchedule();
    }
  }

  async queueNextInSchedule() {
    if (this.schedule.length === 0) {
      // console.log("no affordances left in schedule");
      return; // this stops the scheduler
    }
    // else
    try {
      setTimeout(async () => {
        // if length of schedule is 0 return
        const ae = this.schedule.shift();
        try {
          await ae.collectInfo();
        } catch (error) {
          // console.log("Error collecting info from affordance: ", error);
        }
        this.queueNextInSchedule();
      }, DELAYMS); // check if smart delay is possible
    } catch (error) {
      // console.log("Unexpected error: ", error);
      this.queueNextInSchedule();
    }
  }
}
