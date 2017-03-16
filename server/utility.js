function formatDate(date) {
   date = new Date(date);
   let hours = date.getHours();
   let minutes = date.getMinutes();
   let ampm = hours >= 12 ? 'PM' : 'AM';
   hours = (hours % 12) || 12;
   hours = hours < 10 ? ('0' + hours) : hours;
   minutes = minutes < 10 ? '0' + minutes : minutes;
   let strTime = hours + ':' + minutes + ' ' + ampm;
   let strDate = date.toLocaleString("en-us", { month: "short" }) + ' ' + date.getDate() + ', ' + date.getFullYear();
   return { time: strTime, date: strDate };
}

module.exports.formatDate = formatDate;