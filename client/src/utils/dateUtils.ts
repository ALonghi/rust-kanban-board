export default class DateUtils {
  static convertToReadable = (utcDateTime: string) => {
    const date = new Date(Date.parse(utcDateTime));
    if (date) {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, "0"); // javascript starts from zero months lol
      const day = date.getDate().toString().padStart(2, "0");
      return day + "/" + month + "/" + year;
    }
    return "";
  };

  static convertToReadableWithHours = (utcDateTime: string) => {
    const date = new Date(Date.parse(utcDateTime));
    let readableDate = this.convertToReadable(utcDateTime);
    if (readableDate)
      return (
        readableDate +
        " " +
        date.getHours().toString().padStart(2, "0") +
        ":" +
        date.getMinutes().toString().padStart(2, "0")
      );
  };

  static getCurrentUTCDateStr = (): string => new Date().toISOString();
}
