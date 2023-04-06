const getDate = () => {
  return new Date().toISOString();
};
export default class Logger {
  static debug = (msg: string) => {
    console.log(`[DEBUG] [${getDate()}] - ${msg}`);
  };

  static info = (msg: string) => {
    console.log(`[INFO] [${getDate()}] - ${msg}`);
  };

  static error = (msg: string) => {
    console.log(`[ERROR] [${getDate()}] - ${msg}`);
  };
}
