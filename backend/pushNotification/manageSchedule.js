const db = require('../db/db');
const Pills = db.Pill;
const Users = db.User;

const getDate = (day, pill, user) => {
    const lunchAM = user.lunchAM ? user.lunchAM : false;
	const lunchHour = user.lunchHr ? (lunchAM ? user.lunchHr : user.lunchHr + 12) : 12;
	const lunchMin = user.lunchMin ? user.lunchMin : 0;

	const dinnerAM = user.dinnerAM ? user.dinnerAM : false;
	const dinnerHour = user.dinnerHr ? (dinerAM ? user.dinnerHr: user.dinnerHr + 12) : 19;
	const dinnerMin = user.dinnerMin ? user.dinnerMin : 0;

	const sleepAM = user.sleepAM ? user.sleepAM : false;
	const sleepHour = user.sleepHr ? (sleepAM ? user.sleepHr : user.sleepHr + 12) : 22;
	const sleepMin = user.sleepMin ? user.sleepMin : 0;

   if (pill.withFood && pill.withSleep) {
	  return new Date(2020, 10, (dinnerHour + (dinnerHour - sleepHour) / 2 + 7 > 24 ? day + 2 : day + 1), dinnerHour + (dinnerHour - sleepHour) / 2, dinnerMin);
   }
   if (pill.withFood) {
      return new Date(2020, 10, (lunchHour + 7 > 24 ? day + 2 : day + 1), lunchHour, lunchMin);
   }
   else if (pill.withSleep) {
      return new Date(2020, 10, (sleepHour + 7 > 24 ? day + 2 : day + 1), sleepHour, sleepMin);
   }
   else {
      return new Date(2020, 10, (lunchHour + 9 > 24 ? day + 2 : day + 1), lunchHour + 2);
   }
};
 
const updateSchedule = async (userID, pill) => {
   let user = await Users.findOne({userId: userID});
   let schedule = user.schedule;
   const freq = pill.frequencyUnit === 'Daily' ? 1 : 7;	
   for (let i = 0; i < 7; i += freq) {
		if(schedule[i]) {
			schedule[i].push({time: getDate(i, pill, user), pillName: pill.name});
		}
   }
  await Users.findOneAndUpdate({userId: userID}, {schedule: schedule});

}

const deleteSchedule = async (userID, pill) => {
   let user = await Users.findOne({userId: userID});
   let schedule = user.schedule;

   schedule = schedule.map(day => {
      return day.filter(reminder => {
         reminder.pillName !== pill.name;
      })
   });

  await Users.findOneAndUpdate({userId: userID}, {schedule: schedule});
};

const createSchedule = async (userID) => {
   //iterate through all of the pills
   let pills = await Pills.find({userId: userID});
   let user = await Users.findOne({userId: userID});
   let schedule = [[], [], [], [], [], [], []];

   pills.forEach(pill => {
      //Get when we need to take the pill
      //Check frequency and whether we take it at night or with foodi
      const freq = pill.frequencyUnit === 'Daily' ? 1 : 7;
      for (let i = 0; i < 7; i += freq) {
         schedule[i].push({time: getDate(i, pill, user), pillName: pill.name});
      }
   });

  await Users.findOneAndUpdate({userId: userID}, {schedule: schedule});
} 

module.exports = {createSchedule, updateSchedule, deleteSchedule};