const config = require("../../config"); 
const moment = require('moment-timezone');
const { DataTypes } = require("sequelize");


const schedule = config.DATABASE.define("schedule", {
  jid: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  date: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  status: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
});


const setSchedule = async (jid, date, status, content) => {
  try {
    if (!jid || !date || !status || !content) {
      throw new Error("All parameters (jid, date, status, content) are required.");
    }

    const existingSchedule = await schedule.findOne({
      where: { date: date },
    });

    if (!existingSchedule) {
      await schedule.create({
        jid: jid,
        date: date,
        status: status,
        content: JSON.stringify(content),
      });
    } else {
      await existingSchedule.update({
        jid: jid,
        content: JSON.stringify(content),
        status: status,
      });
    }

    return { success: true, message: "Schedule set successfully." };
  } catch (error) {
    return { success: false, message: error.message };
  }
};


const getSchedule = async () => {
  try {
    const schedules = await schedule.findAll({
      order: [["date", "ASC"]],
    });
    if (schedules.length === 0) {
      return { success: false, data: [] };
    }

    const nowDate = moment().format('YYYY-MM-DD'); 

    const filteredSchedules = schedules
      .filter((s) => s.status === "true") 
      .map((s) => {
        let parsedContent;

        try {
          parsedContent = JSON.parse(s.content);
        } catch (error) {
          parsedContent = s.content; 
        }
        const [time, date] = s.date.split('/'); 
        
        if (moment(date).isBefore(nowDate, 'day')) {
          return null;
        }

        return {
          date: s.date,
          jid: s.jid,
          content: parsedContent,
        };
      })
      .filter(s => s !== null);  

    if (filteredSchedules.length === 0) {
      return { success: false, data: [] };
    }

    return { success: true, data: filteredSchedules };
  } catch (error) {
    return { success: false, data: [] };
  }
};


const delSchedule = async (jid, date) => {
  try {
    if (!jid || !date) {
      throw new Error("Both 'jid' and 'date' parameters are required.");
    }

    const scheduleToDelete = await schedule.findOne({
      where: { jid: jid, date: date },
    });

    if (!scheduleToDelete) {
      return { status: false, message: "No schedule found for the given jid and date." };
    }

    await scheduleToDelete.destroy();
    return { status: true, message: "Schedule deleted successfully." };
  } catch (error) {
    return { status: false, message: error.message };
  }
};

module.exports = {
  setSchedule,
  getSchedule,
  delSchedule
};