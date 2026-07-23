const keywords = ['ban speech', 'seize property'];
const regex = new RegExp(`(${keywords.join('|')})`, 'gi');
const text = "hello ban SPEECH world seize property!";
const parts = text.split(regex);
console.log(parts);
