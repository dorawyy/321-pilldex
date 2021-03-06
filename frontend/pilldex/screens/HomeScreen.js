import React, { useState, useContext, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  FlatList
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import firebase from '@react-native-firebase/app';

const width = Dimensions.get('window').width;

function HomeScreen({ navigation }) {
  // date related states
  const dayArray = ["Sunday", "Monday", "Tuesday",
                    "Wednesday", "Thursday", "Friday", "Saturday"];
  const monthArray = ["January", "February", "March", "April", "May",
                      "June", "July", "August", "September", "October",
                      "November", "December"];
  const [date, setDate] = useState(() => {
    const now = new Date();
    return ({
      dateObj: now,
      dayOfWeek: dayArray[now.getDay()], // string
      month: monthArray[now.getMonth()], // string
      date: now.getDate(), // number
      year: now.getFullYear() // number
    });
  });

  // schedule states
  const [schedule,setSchedule] = useState([]);
  const [notifs, setNotifs] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const isFocused = useIsFocused();

  useEffect(() => {
    fetchSchedule();
  }, [refresh, isFocused]);

  // fetch schedule from database and send to processing functions
  function fetchSchedule() {
    fetch(`http://ec2-3-96-185-233.ca-central-1.compute.amazonaws.com:3000/users?userId=${firebase.auth().currentUser.uid}`, {
      method: 'GET',
    })
    .then((response) => response.json())
    .then((responseJson) => {
      if(responseJson["user"] == null || responseJson["user"] == undefined)
        throw new Error("Response from server does not exist");

      console.log("Response from server is", responseJson["user"]["schedule"]);
      setSchedule(responseJson["user"]["schedule"]);
      formatNotifs(responseJson["user"]["schedule"]);
    })
    .catch((error) => {
      console.log(error);
      setSchedule([]);
    });
  }

  // format user schedule for display
  function formatNotifs(data) {
    var d = date.dateObj.getDay();
    var ret = [];

    if (data[d] == undefined)
      return;

    // package each reminder found
    data[d].forEach((e) => {
      var dateString = "";
      var AM = false;

      var mins = e["time"]["reminderTime"]["minute"];
      var minutes = mins;
      var hours = parseInt(e["time"]["reminderTime"]["hour"], 10);
      if (mins < 10)
        mins = "0" + mins;

      if (hours > 12) {
        dateString = (hours - 12) + ":" + mins + " PM";
      } else {
        dateString = hours + ":" + mins + " AM";
        AM = true;
      }

      var d = new Date(date.year, date.dateObj.getMonth(), date.date, hours, mins);

      if (!e['takenEarly']) {
        ret.push({id: e['reminderId'], name: e['pillName'], food: true,
                 drowsy: true, done: e['takenEarly'], dateString: dateString,
                 hour: hours, mins: minutes, date: d});
      }

    });

    // sort by time HERE
    ret.sort((a, b) => {
      if ( a.hour < b.hour ) {
        return -1;
      } else if ( a.hour > b.hour ) {
        return 1;
      } else {
        if (a.mins == b.mins) {
          return 0;
        } else {
          return a.mins > b.mins ? 1 : -1;
        }
      }
    });

    setNotifs(ret);
  }

  // function to handle date toggling
  function toggleDate(dir) {
    var newDate = date.dateObj;
    newDate.setDate(date.dateObj.getDate() + dir);
    setDate({
      dateObj: newDate,
      dayOfWeek: dayArray[newDate.getDay()],
      month: monthArray[newDate.getMonth()],
      date: newDate.getDate(),
      year: newDate.getFullYear()
    });
    formatNotifs(schedule);
  }

  // dismiss a reminder
  function closeNotification(id) {
    var item = notifs.filter(obj => {
      return obj.id === id;
    });

    item = item[0];

    if (!item.done) {
      var copy = [...notifs];
      var i = copy.indexOf(item);
      copy[i].done = true;
      setNotifs(copy);

      setTimeout((copy) => {
        setNotifs(copy => {
          return copy.filter((elem) => elem.id != id);
      })}, 1000);

      var taken = new Date();
      var early = ((taken - item.date) < 0) ? true : false;

      fetch(`http://ec2-3-96-185-233.ca-central-1.compute.amazonaws.com:3000/pills/taken`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: firebase.auth().currentUser.uid,
          timeTaken: taken,
          reminderId: item.reminderId,
          name: item.name,
          takenEarly: early
        })
      })
      .catch(err => console.error(err));
    }

  }

  return (
    <View style={styles.container}>
      <View style={{height: 20}} />
      <Text style={styles.title}>My Pilldex</Text>
      <View style={{height: 10}} />
      <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
        <Text style={styles.options}>Main</Text>
        <Text style={styles.options}
              onPress={() => navigation.navigate('Notifications')}>
              Notifications
        </Text>
      </View>
      <View style={styles.line} />
      <View style={styles.pageSelector} />

      <View style={{height: 5}} />
      <View style={styles.subHeading}>
        <SimpleLineIcons style={styles.arrow1} name="arrow-left" colour='#000' size={26}
                         onPress={() => toggleDate(-1)} />
        <View style={{flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
          <Text style={styles.dayText}>{date.dayOfWeek}</Text>
          <Text style={styles.dateText}>{date.month} {date.date}, {date.year}</Text>
        </View>
        <SimpleLineIcons style={styles.arrow2} name="arrow-right" colour='#000' size={26}
                         onPress={() => toggleDate(1)} />
      </View>
      <View style={{height: 0.75, width: width - 60, backgroundColor: '#000', marginTop: 5}} />

      <FlatList
        data={notifs}
        extradata={notifs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={item.done ? styles.doneBox : styles.notifBox}>
            <View style={{flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start'}}>
              <TouchableOpacity style={item.done ? styles.checkDone : styles.checkBox}
                                onPress={() => closeNotification(item.id)}/>
              <View style={{flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'space-evenly', marginLeft: 8}}>
                <Text style={styles.medName}>{item.name}</Text>
                <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                  <Ionicons name="alarm-outline" color="#000" size={25} />
                  <Text style={styles.pillTime}>{item.dateString}</Text>
                </View>
                <Text>{item.food && item.drowsy ? "Take with Food, Causes Drowsiness" :
                       item.drowsy ? "Causes Drowsiness" :
                       item.food ? "Take with Food" : ""}</Text>
              </View>
            </View>
          </View>
        )}
      />
      <TouchableOpacity style={styles.button}
                        onPress={() => navigation.navigate('NewPill')}>
        <Text style={styles.btnText}>NEW PILL</Text>
      </TouchableOpacity>
      <View style={{height: 30}} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  title: {
    fontFamily: 'Quicksand-Bold',
    fontSize: 40,
    color: '#46B1C9',
    textAlign: 'center'
  },
  options: {
    fontFamily: 'Quicksand-Regular',
    fontSize: 20,
    marginHorizontal: 35,
  },
  line: {
    height: 0.75,
    width: width,
    backgroundColor: '#A2E1E2',
    marginTop: 5
  },
  pageSelector: {
    height: 8,
    width: 55,
    borderRadius: 4,
    backgroundColor: '#538083',
    marginTop: -5,
    marginLeft: -187
  },
  subHeading: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    width: width - 60,
  },
  arrow1: {
    marginLeft: -45,
    marginRight: 45
  },
  arrow2: {
    marginLeft: 45,
    marginRight: -45
  },
  dayText: {
    textAlign: 'center',
    fontFamily: 'Inter-SemiBold',
    fontSize: 30,
    color: '#46B1C9'
  },
  dateText: {
    textAlign: 'center',
    fontFamily: 'Inter-Light',
    fontSize: 22,
    marginTop: -5,
    marginBottom: -5
  },
  notifBox: {
    width: width - 60,
    height: 100,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: '#84C0C6',
    marginTop: 10
  },
  doneBox: {
    width: width - 60,
    height: 100,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: '#C9C9C9',
    marginTop: 10
  },
  checkBox: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderColor: '#84C0C6',
    borderWidth: 1.5,
    marginLeft: 15
  },
  checkDone: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#C9C9C9',
    borderColor: '#C9C9C9',
    borderWidth: 1.5,
    marginLeft: 15
  },
  medName: {
    fontFamily: 'Quicksand-Bold',
    fontSize: 28,
    color: '#538083'
  },
  pillTime: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 15
  },
  button: {
    height: 60,
    width: 180,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#9FB7B9',
    borderRadius: 35,
    marginTop: 10,
    marginLeft: 5
  },
  btnText: {
    fontFamily: 'Inter-SemiBold',
    color: '#fff',
    fontSize: 20,
    textAlign: 'center'
  }
});

export default HomeScreen;
