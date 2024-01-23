
const DELAYMS = 666;

export default class CollectingScheduler {
    constructor(){
        console.log('Collecting Scheduler initialised');
        this.schedule = [];
    }

    async queueAffordance(affordance) {
        this.schedule.push(affordance);
        console.log('Affordance queued: ' + affordance);
        if (this.schedule.length === 1){ // only restart scheduler if it was empty before
            this.queueNextInSchedule();
        }
    }

    async queueNextInSchedule() {
        if (this.schedule.length === 0) {
            console.log('no affordances left in schedule');
            return; //this stops the scheduler
        } 
        // else
        try {
            setTimeout(async () => {
                //if length of schedule is 0 return
                const ae = this.schedule.shift();
                await ae.collectInfo();

                this.queueNextInSchedule();
            }, DELAYMS); // check if smart delay is possible
        } catch (error) {
            console.log(error);
        }
    }
}