export function crazyHash(data: string) {
  let num = Bun.hash.murmur32v3(data);
  // const chars =
  //   "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const chars =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZÀÁÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿ";
  let result = "";
  do {
    result = chars[num % chars.length] + result;
    num = Math.floor(num / chars.length);
  } while (num > 0);
  return result;
}
