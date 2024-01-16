

export default class CollectingScheduler {
    constructor(afforadances){
        console.log('Collecting Scheduler initialised');
        this.affordances = afforadances;
        console.log(this.affordances);
        this.schedule = afforadances;
        this.queueNextInSchedule();
    }

    async queueNextInSchedule() {
        try {
            setTimeout(async () => {
                const ae = this.schedule.shift();
                if (!ae) {
                    console.log('no affordances left in schedule');
                    return;
                }
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