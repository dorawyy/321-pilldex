/* User schema for storage in the mongodb database */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/* 
 * token = user's unique device token for notifications 
 * userId = user's unique id used for authentication
 * NOTE: following fields split up to make it easier for the frontend to update the UI
 * 		 These fields will be used for scheduling the user's pills
 * wakeup = time the user wakes up
 * sleep = time the user goes to sleep 
 * breakfast = time the user eats breakfast
 * lunch = time the user eats lunch
 * dinner = time the user eats dinner
 * schedule = the user's pill schedule
 * 		  Each day of the week has a list of pills, and the time they should take it 
 */
const userSchema = new Schema({
	token: String,
	userId: {type: String, unique: true, required: true}, 
	wakeupHr: {type: Number, required: false},
	wakeupMin: {type: Number, required: false},
	wakeupAM: {type: Boolean, required: false},
	wakeupPM: {type: Boolean, required: false},
	sleepHr: {type: Number, required: false},
	sleepMin: {type: Number, required: false},
	sleepAM: {type: Boolean, required: false},
	sleepPM: {type: Boolean, required: false},
	breakfastHr: {type: Number, required: false},
	breakfastMin: {type: Number, required: false},
	breakfastAM: {type: Boolean, required: false},
	breakfastPM: {type: Boolean, required: false},
	lunchHr: {type: Number, required: false},
	lunchMin: {type: Number, required: false},
	lunchAM: {type: Boolean, required: false},
	lunchPM: {type: Boolean, required: false},
	dinnerHr: {type: Number, required: false},
	dinnerMin: {type: Number, required: false},
	dinnerAM: {type: Boolean, required: false},
	dinnerPM: {type: Boolean, required: false},
	schedule: [
		[{ time: {reminderTime: {hour: Number, minute: Number}, leftBound: Number, rightBound: Number}, pillName: String, reminderId: String, dosage: Number, timesLate: Number, adjustedTimes: [], takenEarly: Boolean, withFood: Boolean, withSleep: Boolean}],
		[{ time: {reminderTime: {hour: Number, minute: Number}, leftBound: Number, rightBound: Number}, pillName: String, reminderId: String, dosage: Number, timesLate: Number, adjustedTimes: [], takenEarly: Boolean, withFood: Boolean, withSleep: Boolean}],
		[{ time: {reminderTime: {hour: Number, minute: Number}, leftBound: Number, rightBound: Number}, pillName: String, reminderId: String, dosage: Number, timesLate: Number, adjustedTimes: [], takenEarly: Boolean, withFood: Boolean, withSleep: Boolean}],
		[{ time: {reminderTime: {hour: Number, minute: Number}, leftBound: Number, rightBound: Number}, pillName: String, reminderId: String, dosage: Number, timesLate: Number, adjustedTimes: [], takenEarly: Boolean, withFood: Boolean, withSleep: Boolean}],
		[{ time: {reminderTime: {hour: Number, minute: Number}, leftBound: Number, rightBound: Number}, pillName: String, reminderId: String, dosage: Number, timesLate: Number, adjustedTimes: [], takenEarly: Boolean, withFood: Boolean, withSleep: Boolean}],
		[{ time: {reminderTime: {hour: Number, minute: Number}, leftBound: Number, rightBound: Number}, pillName: String, reminderId: String, dosage: Number, timesLate: Number, adjustedTimes: [], takenEarly: Boolean, withFood: Boolean, withSleep: Boolean}],
		[{ time: {reminderTime: {hour: Number, minute: Number}, leftBound: Number, rightBound: Number}, pillName: String, reminderId: String, dosage: Number, timesLate: Number, adjustedTimes: [], takenEarly: Boolean, withFood: Boolean, withSleep: Boolean}]
	]
}); 

userSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        delete ret._id;
        delete ret.hash;
    }
});

module.exports = mongoose.model('User', userSchema);

