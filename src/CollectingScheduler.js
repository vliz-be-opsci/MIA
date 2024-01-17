export default class CollectingScheduler {
    constructor(afforadances,derefconfig){
        console.log('Collecting Scheduler initialised');
        this.affordances = afforadances;
        console.log(this.affordances);
        this.schedule = afforadances;
        this.derefconfig = derefconfig;
        console.log(this.derefconfig);
        this.queueNextInSchedule();
        
    }

    async queueNextInSchedule() {
        try {
            setTimeout(async () => {
                //if length of schedule is 0 return
                if (this.schedule.length === 0) {
                    console.log('no affordances left in schedule');
                    return;
                }
                const ae = this.schedule.shift();
                console.log(ae);
                await this.collectInfo(ae);
                console.log('collected info for ' + ae.link);
                // log the ammount of affordances left in the schedule
                console.log(this.schedule.length);
                this.queueNextInSchedule();
            }, 666);
        } catch (error) {
            console.log(error);
        }
    }

    collectInfo(ae) {
        ae.collectInfo();
    }
}