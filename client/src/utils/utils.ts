export default class Utils {
  static classNames = (...classes: string[]) => {
    return classes.filter(Boolean).join(" ");
  };

  static objectsAreEqual = (o1: any, o2: any): boolean =>
    typeof o1 === "object" && Object.keys(o1).length > 0
      ? Object.keys(o1).length === Object.keys(o2).length &&
        Object.keys(o1).every((p) => Utils.objectsAreEqual(o1[p], o2[p]))
      : o1 === o2;

  static getCapitalized = (text: string): string => {
    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  static formatAmount = (amount: number): string =>
    // @ts-ignore
    amount ? parseFloat(amount.toFixed(2)).toLocaleString(`it-IT`) : "0";
}
