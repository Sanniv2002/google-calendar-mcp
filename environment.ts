import path from 'path';
class Environment {
  keyFile: string;
  scopes: string[];
  calendarId: string;

  constructor() {
    const credentialsFile = "C:/Users/sanni/Desktop/s3-indexer/tripchalo-eca431f0764f.json";

    this.keyFile = path.resolve(__dirname, credentialsFile);

    this.scopes = [
      "https://www.googleapis.com/auth/calendar",
      "https://www.googleapis.com/auth/calendar.events",
    ];
    this.calendarId = "sanniv.nitkkr@gmail.com";
  }
}

export default Environment;
