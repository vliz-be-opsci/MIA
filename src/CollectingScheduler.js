

export default class CollectingScheduler {
    constructor(afforadances){
        console.log('Collecting Scheduler initialised');
        this.affordances = afforadances;
        console.log(this.affordances);
        this.startSchedule();
    }

    startSchedule(){
        console.log('starting schedule');
        this.affordances.forEach((ae) => {
            this.collectInfo(ae);
        });
    }

    collectInfo(ae) {
        console.log('collecting info');
        ae.collectInfo();
    }
}